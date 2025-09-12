-- Corrigir alertas de segurança e completar dados de teste

-- 1. CORRIGIR SECURITY DEFINER VIEWS (remover SECURITY DEFINER)
DROP VIEW IF EXISTS vw_fluxo_caixa CASCADE;
DROP VIEW IF EXISTS vw_pendentes_financeiros CASCADE;
DROP VIEW IF EXISTS vw_kpis_financeiros CASCADE;

-- Recriar views sem SECURITY DEFINER
CREATE VIEW vw_fluxo_caixa AS
SELECT 
  DATE_TRUNC('month', lf.data_lancamento) as mes,
  COALESCE(SUM(CASE WHEN lf.tipo = 'entrada' AND lf.status = 'confirmado' THEN lf.valor ELSE 0 END), 0) as total_entradas,
  COALESCE(SUM(CASE WHEN lf.tipo = 'saida' AND lf.status = 'confirmado' THEN lf.valor ELSE 0 END), 0) as total_saidas,
  COALESCE(SUM(CASE WHEN lf.tipo = 'entrada' AND lf.status = 'confirmado' THEN lf.valor ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN lf.tipo = 'saida' AND lf.status = 'confirmado' THEN lf.valor ELSE 0 END), 0) as saldo
FROM lancamentos_financeiros lf
WHERE lf.data_lancamento >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', lf.data_lancamento)
ORDER BY mes DESC;

CREATE VIEW vw_pendentes_financeiros AS
SELECT 
  v.id as venda_id,
  v.valor_total,
  v.status as venda_status,
  v.forma_pagamento,
  v.data_venda::text,
  c.nome as cliente_nome,
  o.numero_orcamento,
  o.data_vencimento::text,
  lf.status as lancamento_status,
  p.status as pagamento_status,
  p.data_pagamento::text
FROM vendas v
JOIN orcamentos o ON v.orcamento_id = o.id
JOIN clientes c ON o.cliente_id = c.id
LEFT JOIN lancamentos_financeiros lf ON v.id = lf.venda_id AND lf.tipo = 'entrada'
LEFT JOIN pagamentos p ON v.id = p.venda_id
WHERE v.status != 'cancelada' OR lf.status = 'pendente' OR p.status = 'pendente';

CREATE VIEW vw_kpis_financeiros AS
SELECT 
  COALESCE(SUM(CASE WHEN lf.tipo = 'entrada' AND lf.status = 'confirmado' THEN lf.valor ELSE 0 END), 0) as total_entradas,
  COALESCE(SUM(CASE WHEN lf.tipo = 'saida' AND lf.status = 'confirmado' THEN lf.valor ELSE 0 END), 0) as total_saidas,
  COALESCE(SUM(CASE WHEN lf.tipo = 'entrada' AND lf.status = 'confirmado' AND DATE_TRUNC('month', lf.data_lancamento) = DATE_TRUNC('month', CURRENT_DATE) THEN lf.valor ELSE 0 END), 0) as entradas_mes_atual,
  COALESCE(SUM(CASE WHEN lf.tipo = 'saida' AND lf.status = 'confirmado' AND DATE_TRUNC('month', lf.data_lancamento) = DATE_TRUNC('month', CURRENT_DATE) THEN lf.valor ELSE 0 END), 0) as saidas_mes_atual,
  COALESCE(SUM(CASE WHEN v.status = 'pendente' THEN v.valor_total ELSE 0 END), 0) as vendas_pendentes,
  COUNT(CASE WHEN p.status = 'pendente' THEN 1 END) as pagamentos_pendentes
FROM lancamentos_financeiros lf
FULL OUTER JOIN vendas v ON lf.venda_id = v.id
FULL OUTER JOIN pagamentos p ON v.id = p.venda_id;

-- 2. COMPLETAR DADOS DE TESTE
-- Inserir mais lançamentos financeiros e pagamentos para dados completos
INSERT INTO lancamentos_financeiros (venda_id, tipo, valor, status, descricao, data_lancamento, categoria, created_by) VALUES 
('55555555-5555-5555-5555-555555555555', 'entrada', 8000.00, 'confirmado', 'Pagamento website aprovado', '2025-09-10', 'Vendas', '7f51fb62-3886-4752-8b35-a20adf8b8416'),
('55555555-5555-5555-5555-555555555555', 'saida', 160.00, 'confirmado', 'Taxa processamento venda #55555555-5555-5555-5555-555555555555', '2025-09-10', 'Taxas', '7f51fb62-3886-4752-8b35-a20adf8b8416')
ON CONFLICT DO NOTHING;

INSERT INTO pagamentos (id, venda_id, valor_pago, status, data_pagamento, created_by) VALUES 
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 8000.00, 'confirmado', '2025-09-10', '7f51fb62-3886-4752-8b35-a20adf8b8416')
ON CONFLICT (id) DO NOTHING;

-- Adicionar alguns lançamentos históricos para testar fluxo de caixa
INSERT INTO lancamentos_financeiros (tipo, valor, status, descricao, data_lancamento, categoria, created_by) VALUES 
('entrada', 12000.00, 'confirmado', 'Vendas agosto', '2025-08-15', 'Vendas', '7f51fb62-3886-4752-8b35-a20adf8b8416'),
('saida', 3000.00, 'confirmado', 'Despesas operacionais agosto', '2025-08-20', 'Operacional', '7f51fb62-3886-4752-8b35-a20adf8b8416'),
('entrada', 15000.00, 'confirmado', 'Vendas julho', '2025-07-10', 'Vendas', '7f51fb62-3886-4752-8b35-a20adf8b8416'),
('saida', 2500.00, 'confirmado', 'Despesas operacionais julho', '2025-07-15', 'Operacional', '7f51fb62-3886-4752-8b35-a20adf8b8416')
ON CONFLICT DO NOTHING;

-- 3. CORRIGIR FUNÇÃO SEM SEARCH_PATH (verificar se existe alguma)
-- Atualizar função get_user_role para garantir search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role::text
  FROM public.usuarios u
  WHERE u.id = user_id
  LIMIT 1;
$function$;