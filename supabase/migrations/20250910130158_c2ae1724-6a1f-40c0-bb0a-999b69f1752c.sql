-- Atualizar RLS das tabelas existentes para corrigir problemas de acesso
-- Garantir que ADM_MASTER e VENDEDOR possam inserir clientes
DROP POLICY IF EXISTS "Clientes: Read all, write ADM/VENDEDOR" ON clientes;
CREATE POLICY "Clientes: ADM/VENDEDOR manage" ON clientes 
FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND role IN ('ADM_MASTER', 'VENDEDOR'))
);

-- Atualizar RLS dos pagamentos para usar a função get_user_role
DROP POLICY IF EXISTS "Pagamentos: ADM/VENDEDOR write, SUPORTE read" ON pagamentos;
DROP POLICY IF EXISTS "Pagamentos: SUPORTE read-only" ON pagamentos;

CREATE POLICY "Pagamentos: ADM/VENDEDOR manage" ON pagamentos 
FOR ALL USING (
  get_user_role(auth.uid()) IN ('ADM_MASTER', 'VENDEDOR')
);

CREATE POLICY "Pagamentos: SUPORTE read-only" ON pagamentos 
FOR SELECT USING (
  get_user_role(auth.uid()) = 'SUPORTE'
);

-- Expandir triggers para automação completa
CREATE OR REPLACE FUNCTION public.trigger_aprovar_orcamento()
RETURNS TRIGGER AS $$
DECLARE
  venda_id_var UUID;
BEGIN
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    -- Criar Venda pendente
    INSERT INTO public.vendas (orcamento_id, valor_total, status, created_by)
    VALUES (NEW.id, NEW.valor_total, 'pendente', NEW.created_by)
    RETURNING id INTO venda_id_var;

    -- Criar Lançamento 'entrada' pendente
    INSERT INTO public.lancamentos_financeiros (venda_id, tipo, valor, status, descricao, created_by)
    VALUES (venda_id_var, 'entrada', NEW.valor_total, 'pendente', 'Entrada pendente do orçamento #' || NEW.numero_orcamento, NEW.created_by);

    -- Criar Pagamento pendente
    INSERT INTO public.pagamentos (venda_id, valor_pago, total_parcelas, created_by)
    VALUES (venda_id_var, NEW.valor_total, 1, NEW.created_by);

    -- Notificar
    PERFORM pg_notify('financeiro:venda_criada', json_build_object('venda_id', venda_id_var, 'valor', NEW.valor_total)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.trigger_confirmar_venda()
RETURNS TRIGGER AS $$
DECLARE
  taxa_saida DECIMAL;
BEGIN
  IF NEW.status = 'confirmada' AND OLD.status != 'confirmada' THEN
    -- Confirme Lançamento
    UPDATE public.lancamentos_financeiros 
    SET status = 'confirmado', data_lancamento = CURRENT_DATE
    WHERE venda_id = NEW.id AND status = 'pendente' AND tipo = 'entrada';

    -- Confirme Pagamento
    UPDATE public.pagamentos 
    SET status = 'confirmado', data_pagamento = CURRENT_DATE
    WHERE venda_id = NEW.id AND status = 'pendente';

    -- Adicione Saída automática: Taxa 2% (processamento)
    taxa_saida := NEW.valor_total * 0.02;
    INSERT INTO public.lancamentos_financeiros (venda_id, tipo, valor, status, descricao, data_lancamento, created_by, categoria)
    VALUES (NEW.id, 'saida', taxa_saida, 'confirmado', 'Taxa de processamento venda #' || NEW.id, CURRENT_DATE, NEW.created_by, 'Taxas');

    -- Notificar
    PERFORM pg_notify('financeiro:confirmado', json_build_object('venda_id', NEW.id, 'valor', NEW.valor_total)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Novo Trigger: Adicionar Saída Manual
CREATE OR REPLACE FUNCTION public.trigger_adicionar_saida()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'saida' AND NEW.valor > 1000 THEN
    PERFORM pg_notify('financeiro:saida_alta', json_build_object('lancamento_id', NEW.id, 'valor', NEW.valor)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_adicionar_saida ON lancamentos_financeiros;
CREATE TRIGGER trg_adicionar_saida
AFTER INSERT ON lancamentos_financeiros
FOR EACH ROW WHEN (NEW.tipo = 'saida') EXECUTE FUNCTION trigger_adicionar_saida();

-- Expandir view pendentes financeiros com mais detalhes
DROP VIEW IF EXISTS vw_pendentes_financeiros;
CREATE VIEW vw_pendentes_financeiros AS
SELECT 
  v.id AS venda_id,
  v.valor_total,
  v.status AS venda_status,
  v.data_venda,
  v.forma_pagamento,
  p.status AS pagamento_status,
  p.data_pagamento,
  l.status AS lancamento_status,
  o.numero_orcamento,
  c.nome AS cliente_nome
FROM vendas v
JOIN orcamentos o ON v.orcamento_id = o.id
JOIN clientes c ON o.cliente_id = c.id
LEFT JOIN pagamentos p ON v.id = p.venda_id AND p.parcela_num = 1
LEFT JOIN lancamentos_financeiros l ON v.id = l.venda_id AND l.tipo = 'entrada'
WHERE v.status IN ('pendente', 'confirmada') OR p.status = 'pendente' OR l.status = 'pendente'
ORDER BY v.created_at DESC;

-- Criar view para KPIs financeiros
CREATE VIEW vw_kpis_financeiros AS
SELECT 
  -- Entradas e saídas do mês atual
  COALESCE(SUM(CASE 
    WHEN l.tipo = 'entrada' AND l.status = 'confirmado' 
    AND DATE_TRUNC('month', l.data_lancamento) = DATE_TRUNC('month', CURRENT_DATE)
    THEN l.valor ELSE 0 END), 0) AS entradas_mes_atual,
  
  COALESCE(SUM(CASE 
    WHEN l.tipo = 'saida' AND l.status = 'confirmado' 
    AND DATE_TRUNC('month', l.data_lancamento) = DATE_TRUNC('month', CURRENT_DATE)
    THEN l.valor ELSE 0 END), 0) AS saidas_mes_atual,

  -- Vendas pendentes (valor total)
  COALESCE((SELECT SUM(valor_total) FROM vendas WHERE status = 'pendente'), 0) AS vendas_pendentes,
  
  -- Número de pagamentos pendentes
  COALESCE((SELECT COUNT(*) FROM pagamentos WHERE status = 'pendente'), 0) AS pagamentos_pendentes,
  
  -- Total geral de entradas e saídas confirmadas
  COALESCE(SUM(CASE 
    WHEN l.tipo = 'entrada' AND l.status = 'confirmado' 
    THEN l.valor ELSE 0 END), 0) AS total_entradas,
  
  COALESCE(SUM(CASE 
    WHEN l.tipo = 'saida' AND l.status = 'confirmado' 
    THEN l.valor ELSE 0 END), 0) AS total_saidas

FROM lancamentos_financeiros l;