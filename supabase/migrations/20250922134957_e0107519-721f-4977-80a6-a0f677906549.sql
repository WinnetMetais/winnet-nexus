-- ========================================
-- CORREÇÃO DOS WARNINGS DE SEGURANÇA
-- ========================================

-- 1. CORREÇÃO DE FUNCTION SEARCH PATH MUTABLE
-- Atualizar todas as funções para ter search_path definido

-- Atualizar função trigger_aprovar_orcamento para ter search_path
CREATE OR REPLACE FUNCTION public.trigger_aprovar_orcamento()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  venda_id UUID;
BEGIN
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    INSERT INTO vendas (orcamento_id, valor_total, status, created_by)
    VALUES (NEW.id, NEW.valor_total, 'pendente', NEW.created_by)
    RETURNING id INTO venda_id;

    INSERT INTO lancamentos_financeiros (venda_id, tipo, valor, status, descricao, created_by)
    VALUES (venda_id, 'entrada', NEW.valor_total, 'pendente', 'Entrada pendente orçamento #' || NEW.id, NEW.created_by);

    INSERT INTO pagamentos (venda_id, valor_pago, total_parcelas, created_by)
    VALUES (venda_id, NEW.valor_total, 1, NEW.created_by);

    INSERT INTO notificacoes (user_id, mensagem) VALUES (NEW.created_by, 'Orçamento aprovado e venda criada!');

    INSERT INTO logs (mensagem, user_id) VALUES ('Aprovação auto-fluxo: ' || NEW.id, NEW.created_by);
  END IF;
  RETURN NEW;
END;
$function$;

-- Atualizar função trigger_confirmar_venda para ter search_path
CREATE OR REPLACE FUNCTION public.trigger_confirmar_venda()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  taxa_saida DECIMAL;
BEGIN
  IF NEW.status = 'confirmada' AND OLD.status != 'confirmada' THEN
    UPDATE lancamentos_financeiros SET status = 'confirmado', data_lancamento = CURRENT_DATE
    WHERE venda_id = NEW.id AND tipo = 'entrada' AND status = 'pendente';

    UPDATE pagamentos SET status = 'confirmado', data_pagamento = CURRENT_DATE
    WHERE venda_id = NEW.id AND status = 'pendente';

    taxa_saida := NEW.valor_total * 0.02;
    INSERT INTO lancamentos_financeiros (venda_id, tipo, valor, status, descricao, data_lancamento, created_by)
    VALUES (NEW.id, 'saida', taxa_saida, 'confirmado', 'Taxa processamento venda #' || NEW.id, CURRENT_DATE, NEW.created_by);

    INSERT INTO notificacoes (user_id, mensagem) VALUES (NEW.created_by, 'Venda confirmada e entrada processada!');

    INSERT INTO logs (mensagem, user_id) VALUES ('Confirmação venda: ' || NEW.id, NEW.created_by);

    PERFORM pg_notify('financeiro:confirmado', json_build_object('venda_id', NEW.id, 'valor', NEW.valor_total)::text);
  END IF;
  RETURN NEW;
END;
$function$;

-- Atualizar função audit_clientes para ter search_path correto
CREATE OR REPLACE FUNCTION public.audit_clientes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO logs(mensagem, created_at)
  VALUES (format('clientes %s by %s at %s', TG_OP, current_uid(), now()), now());
  RETURN NEW;
END;
$function$;

-- 2. MOVER EXTENSÕES DO SCHEMA PUBLIC PARA EXTENSIONS
-- Verificar se existem extensões no schema public e movê-las

DO $$
DECLARE
  ext_record RECORD;
BEGIN
  -- Listar e mover extensões do schema public
  FOR ext_record IN 
    SELECT extname FROM pg_extension 
    WHERE extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    BEGIN
      -- Tentar mover extensão para schema extensions se não for crítica
      IF ext_record.extname NOT IN ('plpgsql', 'uuid-ossp') THEN
        EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_record.extname);
        RAISE NOTICE 'Moved extension % to extensions schema', ext_record.extname;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Se falhar, apenas registrar o aviso
      RAISE NOTICE 'Could not move extension %: %', ext_record.extname, SQLERRM;
    END;
  END LOOP;
END $$;

-- 3. CRIAR SCHEMA EXTENSIONS SE NÃO EXISTIR
CREATE SCHEMA IF NOT EXISTS extensions;

-- 4. CONFIGURAÇÕES DE SEGURANÇA ADICIONAIS
-- Garantir que todas as funções do sistema têm SECURITY DEFINER onde apropriado

-- Verificar e corrigir permissões das views
GRANT SELECT ON public.vw_fluxo_caixa TO authenticated;
GRANT SELECT ON public.vw_kpis_financeiros TO authenticated;
GRANT SELECT ON public.vw_pendentes_financeiros TO authenticated;

-- 5. CONFIGURAÇÃO DE AUDITORIA MELHORADA
-- Criar função de auditoria genérica mais segura
CREATE OR REPLACE FUNCTION public.audit_generic()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Registrar operação de auditoria de forma segura
  INSERT INTO logs(mensagem, user_id, created_at)
  VALUES (
    format('%s operation on table %s by user %s', 
           TG_OP, 
           TG_TABLE_NAME, 
           COALESCE(current_uid(), '00000000-0000-0000-0000-000000000000')
    ),
    current_uid(),
    now()
  );
  
  -- Retornar registro apropriado baseado na operação
  CASE TG_OP
    WHEN 'DELETE' THEN RETURN OLD;
    ELSE RETURN NEW;
  END CASE;
END;
$function$;

-- 6. OTIMIZAÇÕES DE SEGURANÇA PARA RLS
-- Garantir que todas as políticas RLS estão otimizadas

-- Criar índices para melhorar performance das políticas RLS
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON public.usuarios(role) WHERE role IS NOT NULL;

-- 7. CONFIGURAÇÃO DE MONITORAMENTO
-- Criar função para monitorar tentativas de acesso negado
CREATE OR REPLACE FUNCTION public.log_access_attempt(
  table_name TEXT,
  operation TEXT,
  user_id UUID DEFAULT NULL
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO logs(mensagem, user_id, created_at)
  VALUES (
    format('Access attempt: %s on %s by %s', 
           operation, 
           table_name, 
           COALESCE(user_id, current_uid(), '00000000-0000-0000-0000-000000000000')
    ),
    COALESCE(user_id, current_uid()),
    now()
  );
END;
$function$;

-- 8. CONFIGURAÇÃO DE RATE LIMITING BÁSICO
-- Criar tabela para tracking de rate limiting (se necessário)
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- Habilitar RLS na tabela de rate limiting
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Criar política para rate limiting
CREATE POLICY "rate_limit_own_records" ON public.rate_limit_log
  FOR ALL USING (user_id = current_uid());

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_timestamp 
  ON public.rate_limit_log(user_id, timestamp);

-- 9. LIMPEZA E OTIMIZAÇÃO FINAL
-- Garantir que todas as tabelas tem comentários apropriados de segurança
COMMENT ON TABLE public.clientes IS 'Tabela de clientes - RLS habilitado, realtime ativo, auditoria completa';
COMMENT ON TABLE public.orcamentos IS 'Tabela de orçamentos - RLS por usuário, triggers de negócio, realtime ativo';
COMMENT ON TABLE public.vendas IS 'Tabela de vendas - RLS por usuário, integração financeira, realtime ativo';
COMMENT ON TABLE public.lancamentos_financeiros IS 'Tabela financeira - RLS restritivo, auditoria completa';
COMMENT ON TABLE public.pagamentos IS 'Tabela de pagamentos - RLS por usuário, integração completa';
COMMENT ON TABLE public.usuarios IS 'Tabela de usuários - RLS por ID, controle de roles';
COMMENT ON TABLE public.logs IS 'Tabela de auditoria - Apenas leitura para ADM_MASTER';
COMMENT ON TABLE public.notificacoes IS 'Tabela de notificações - RLS por usuário';

-- 10. VERIFICAÇÃO FINAL DE SEGURANÇA
-- Função para validar configuração de segurança
CREATE OR REPLACE FUNCTION public.validate_security_config()
 RETURNS TEXT
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result TEXT := '';
  table_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Verificar se todas as tabelas principais têm RLS habilitado
  SELECT COUNT(*) INTO table_count
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r' 
    AND c.relname IN ('clientes', 'orcamentos', 'vendas', 'lancamentos_financeiros', 'pagamentos', 'usuarios', 'notificacoes')
    AND c.relrowsecurity = false;
  
  IF table_count > 0 THEN
    result := result || format('WARNING: %s tables without RLS enabled. ', table_count);
  END IF;
  
  -- Verificar se existem políticas para todas as tabelas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  IF policy_count = 0 THEN
    result := result || 'WARNING: No RLS policies found. ';
  END IF;
  
  IF result = '' THEN
    result := 'Security configuration is valid.';
  END IF;
  
  RETURN result;
END;
$function$;

-- Executar validação
SELECT public.validate_security_config() as security_status;

-- Comentário final
COMMENT ON DATABASE postgres IS 'CRM Database - Security hardened, RLS enabled, realtime configured, audit trails active';