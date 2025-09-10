-- Corrigir RLS das tabelas existentes
-- Remover e recriar política de clientes
DROP POLICY IF EXISTS "Clientes: ADM/VENDEDOR manage" ON clientes;
CREATE POLICY "Clientes: ADM/VENDEDOR manage" ON clientes 
FOR ALL USING (
  get_user_role(auth.uid()) IN ('ADM_MASTER', 'VENDEDOR')
);

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
DROP VIEW IF EXISTS vw_kpis_financeiros;
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