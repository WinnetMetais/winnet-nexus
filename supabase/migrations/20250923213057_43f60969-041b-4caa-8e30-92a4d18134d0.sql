-- =========================================
-- FASE 1: CORREÇÕES CRÍTICAS DE SEGURANÇA E PERFORMANCE
-- =========================================

-- 1.1 Correção de Funções de Segurança

-- Corrigir função fn_can_access_orcamento() para implementar lógica real
CREATE OR REPLACE FUNCTION public.fn_can_access_orcamento(o_id uuid) 
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := (SELECT auth.uid());
  usr_role text := fn_get_role();
  owner_id uuid;
BEGIN
  SELECT created_by INTO owner_id FROM public.orcamentos WHERE id = o_id;
  
  IF owner_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF uid = owner_id THEN
    RETURN TRUE;
  ELSIF usr_role = 'ADM_MASTER' OR usr_role = 'SUPORTE' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Adicionar search_path a todas as funções existentes
ALTER FUNCTION public.trigger_aprovar_orcamento() SET search_path = public;
ALTER FUNCTION public.trigger_confirmar_venda() SET search_path = public;
ALTER FUNCTION public.trigger_adicionar_saida() SET search_path = public;
ALTER FUNCTION public.trigger_rejeitar_orcamento() SET search_path = public;
ALTER FUNCTION public.trigger_inativar_usuario() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.audit_clientes() SET search_path = public;

-- Função otimizada para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.fn_get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Função centralizada de validação de permissões
CREATE OR REPLACE FUNCTION public.fn_validate_user_permissions(required_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text := fn_get_current_user_role();
BEGIN
  RETURN user_role = ANY(required_roles);
END;
$$;

-- 1.2 Limpeza de Políticas RLS Redundantes

-- CLIENTES - Consolidar políticas
DROP POLICY IF EXISTS "clientes_select" ON public.clientes;
DROP POLICY IF EXISTS "clientes_insert" ON public.clientes;
DROP POLICY IF EXISTS "clientes_update" ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete" ON public.clientes;

CREATE POLICY "clientes_all_access" ON public.clientes
  FOR ALL USING (
    fn_validate_user_permissions(ARRAY['ADM_MASTER', 'VENDEDOR', 'SUPORTE'])
  );

-- ORCAMENTOS - Políticas otimizadas
DROP POLICY IF EXISTS "orcamentos_select" ON public.orcamentos;
DROP POLICY IF EXISTS "orcamentos_insert" ON public.orcamentos;
DROP POLICY IF EXISTS "orcamentos_update" ON public.orcamentos;
DROP POLICY IF EXISTS "orcamentos_delete" ON public.orcamentos;

CREATE POLICY "orcamentos_select" ON public.orcamentos
  FOR SELECT USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER', 'SUPORTE'])
  );

CREATE POLICY "orcamentos_insert" ON public.orcamentos
  FOR INSERT WITH CHECK (
    fn_validate_user_permissions(ARRAY['ADM_MASTER', 'VENDEDOR'])
  );

CREATE POLICY "orcamentos_update" ON public.orcamentos
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER'])
  );

CREATE POLICY "orcamentos_delete" ON public.orcamentos
  FOR DELETE USING (
    fn_validate_user_permissions(ARRAY['ADM_MASTER'])
  );

-- ITENS_ORCAMENTO - Políticas baseadas em acesso ao orçamento
DROP POLICY IF EXISTS "itens_orcamento_select" ON public.itens_orcamento;
DROP POLICY IF EXISTS "itens_orcamento_insert" ON public.itens_orcamento;
DROP POLICY IF EXISTS "itens_orcamento_update" ON public.itens_orcamento;
DROP POLICY IF EXISTS "itens_orcamento_delete" ON public.itens_orcamento;

CREATE POLICY "itens_orcamento_all_access" ON public.itens_orcamento
  FOR ALL USING (fn_can_access_orcamento(orcamento_id));

-- VENDAS - Políticas consolidadas
DROP POLICY IF EXISTS "vendas_select" ON public.vendas;
DROP POLICY IF EXISTS "vendas_insert" ON public.vendas;
DROP POLICY IF EXISTS "vendas_update" ON public.vendas;
DROP POLICY IF EXISTS "vendas_delete" ON public.vendas;

CREATE POLICY "vendas_select" ON public.vendas
  FOR SELECT USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER', 'SUPORTE'])
  );

CREATE POLICY "vendas_modify" ON public.vendas
  FOR ALL USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER'])
  );

-- LANCAMENTOS_FINANCEIROS - Políticas otimizadas
DROP POLICY IF EXISTS "lancamentos_select" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "lancamentos_insert" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "lancamentos_update" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "lancamentos_delete" ON public.lancamentos_financeiros;

CREATE POLICY "lancamentos_select" ON public.lancamentos_financeiros
  FOR SELECT USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER', 'SUPORTE'])
  );

CREATE POLICY "lancamentos_modify" ON public.lancamentos_financeiros
  FOR ALL USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER'])
  );

-- PAGAMENTOS - Políticas consolidadas
DROP POLICY IF EXISTS "pagamentos_select" ON public.pagamentos;
DROP POLICY IF EXISTS "pagamentos_insert" ON public.pagamentos;
DROP POLICY IF EXISTS "pagamentos_update" ON public.pagamentos;
DROP POLICY IF EXISTS "pagamentos_delete" ON public.pagamentos;

CREATE POLICY "pagamentos_select" ON public.pagamentos
  FOR SELECT USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER', 'SUPORTE'])
  );

CREATE POLICY "pagamentos_modify" ON public.pagamentos
  FOR ALL USING (
    created_by = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER'])
  );

-- NOTIFICACOES - Política simplificada
DROP POLICY IF EXISTS "notificacoes_select" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_insert" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_update" ON public.notificacoes;
DROP POLICY IF EXISTS "notificacoes_delete" ON public.notificacoes;

CREATE POLICY "notificacoes_user_access" ON public.notificacoes
  FOR ALL USING (user_id = auth.uid());

-- USUARIOS - Políticas otimizadas  
DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete" ON public.usuarios;

CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT USING (
    id = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER', 'SUPORTE'])
  );

CREATE POLICY "usuarios_modify" ON public.usuarios
  FOR ALL USING (
    id = auth.uid() OR 
    fn_validate_user_permissions(ARRAY['ADM_MASTER'])
  );

-- LOGS - Política simplificada
DROP POLICY IF EXISTS "logs_select" ON public.logs;
DROP POLICY IF EXISTS "logs_insert" ON public.logs;

CREATE POLICY "logs_admin_access" ON public.logs
  FOR SELECT USING (fn_validate_user_permissions(ARRAY['ADM_MASTER']));

CREATE POLICY "logs_insert_access" ON public.logs
  FOR INSERT WITH CHECK (true); -- Permite inserção para triggers

-- 1.3 Otimização de Índices

-- Remover índices duplicados se existirem
DROP INDEX IF EXISTS public.idx_lancamentos_venda_id;
DROP INDEX IF EXISTS public.idx_logs_user_id;
DROP INDEX IF EXISTS public.idx_notificacoes_user_id;
DROP INDEX IF EXISTS public.idx_orcamentos_cliente_id;
DROP INDEX IF EXISTS public.idx_pagamentos_venda_id;
DROP INDEX IF EXISTS public.idx_vendas_orcamento_id;

-- Criar índices compostos otimizados
CREATE INDEX IF NOT EXISTS idx_orcamentos_status_created_by ON public.orcamentos(status, created_by);
CREATE INDEX IF NOT EXISTS idx_vendas_status_data_venda ON public.vendas(status, data_venda);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo_status_data ON public.lancamentos_financeiros(tipo, status, data_lancamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status_data ON public.pagamentos(status, data_pagamento);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida ON public.notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at DESC);

-- Índices parciais para melhor performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_pending ON public.orcamentos(created_at) WHERE status = 'rascunho';
CREATE INDEX IF NOT EXISTS idx_vendas_pending ON public.vendas(data_venda) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_lancamentos_pending ON public.lancamentos_financeiros(data_lancamento) WHERE status = 'pendente';