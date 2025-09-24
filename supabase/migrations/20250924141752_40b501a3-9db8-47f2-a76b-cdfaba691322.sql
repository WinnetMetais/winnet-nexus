-- =========================================
-- CORREÇÃO DE VIEWS E FUNÇÕES FALTANTES
-- =========================================

-- Dropar e recriar as views corretamente
DROP VIEW IF EXISTS public.vw_kpis_financeiros;
DROP VIEW IF EXISTS public.vw_pendentes_financeiros;
DROP VIEW IF EXISTS public.vw_fluxo_caixa;

-- Recriar view de fluxo de caixa
CREATE VIEW public.vw_fluxo_caixa AS
SELECT 
  DATE_TRUNC('month', l.data_lancamento) as mes,
  SUM(CASE WHEN l.tipo = 'entrada' THEN l.valor ELSE 0 END) as total_entradas,
  SUM(CASE WHEN l.tipo = 'saida' THEN l.valor ELSE 0 END) as total_saidas,
  SUM(CASE WHEN l.tipo = 'entrada' THEN l.valor ELSE -l.valor END) as saldo
FROM public.lancamentos_financeiros l
WHERE l.status = 'confirmado'
GROUP BY DATE_TRUNC('month', l.data_lancamento)
ORDER BY mes DESC;

-- Recriar view de KPIs financeiros
CREATE VIEW public.vw_kpis_financeiros AS
SELECT 
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros WHERE tipo = 'entrada' AND status = 'confirmado') as total_entradas,
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros WHERE tipo = 'saida' AND status = 'confirmado') as total_saidas,
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros WHERE tipo = 'entrada' AND status = 'confirmado' AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)) as entradas_mes_atual,
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros WHERE tipo = 'saida' AND status = 'confirmado' AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)) as saidas_mes_atual,
  (SELECT COUNT(*) FROM public.pagamentos WHERE status = 'pendente') as pagamentos_pendentes,
  (SELECT COALESCE(SUM(valor_total), 0) FROM public.vendas WHERE status = 'pendente') as vendas_pendentes;

-- Recriar view de pendentes financeiros
CREATE VIEW public.vw_pendentes_financeiros AS
SELECT 
  v.id as venda_id,
  c.nome as cliente_nome,
  o.numero_orcamento,
  v.data_venda::text,
  o.data_vencimento::text,
  v.valor_total,
  v.status as venda_status,
  v.forma_pagamento,
  l.status as lancamento_status,
  p.status as pagamento_status,
  p.data_pagamento::text
FROM public.vendas v
LEFT JOIN public.orcamentos o ON v.orcamento_id = o.id
LEFT JOIN public.clientes c ON o.cliente_id = c.id
LEFT JOIN public.lancamentos_financeiros l ON v.id = l.venda_id
LEFT JOIN public.pagamentos p ON v.id = p.venda_id
WHERE v.status = 'pendente' OR l.status = 'pendente' OR p.status = 'pendente';

-- Corrigir funções restantes sem search_path (apenas as que ainda não foram corrigidas)
ALTER FUNCTION public.log_access_attempt(text, text, uuid) SET search_path = public;
ALTER FUNCTION public.validate_security_config() SET search_path = public;

-- Políticas RLS para tabelas que precisam
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_log_admin_access" ON public.activity_log;
CREATE POLICY "activity_log_admin_access" ON public.activity_log
  FOR ALL USING (fn_validate_user_permissions(ARRAY['ADM_MASTER']));

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_admin_access" ON public.admins;
CREATE POLICY "admins_admin_access" ON public.admins
  FOR ALL USING (fn_validate_user_permissions(ARRAY['ADM_MASTER']));

-- Habilitar replica identity para realtime
ALTER TABLE public.clientes REPLICA IDENTITY FULL;
ALTER TABLE public.orcamentos REPLICA IDENTITY FULL;
ALTER TABLE public.itens_orcamento REPLICA IDENTITY FULL;
ALTER TABLE public.vendas REPLICA IDENTITY FULL;
ALTER TABLE public.lancamentos_financeiros REPLICA IDENTITY FULL;
ALTER TABLE public.pagamentos REPLICA IDENTITY FULL;  
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
ALTER TABLE public.usuarios REPLICA IDENTITY FULL;