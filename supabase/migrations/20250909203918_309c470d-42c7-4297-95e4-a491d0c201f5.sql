-- Tabela Pagamentos (para entradas parciais em vendas)
CREATE TABLE public.pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10,2) NOT NULL,
  data_pagamento DATE DEFAULT CURRENT_DATE,
  metodo TEXT DEFAULT 'Cartão',
  status TEXT CHECK (status IN ('pendente', 'confirmado', 'falhou')) DEFAULT 'pendente',
  parcela_num INTEGER DEFAULT 1,
  total_parcelas INTEGER DEFAULT 1,
  created_by UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pagamentos_venda ON public.pagamentos(venda_id);
CREATE INDEX idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX idx_pagamentos_data ON public.pagamentos(data_pagamento);

-- RLS
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pagamentos: ADM/VENDEDOR manage" ON public.pagamentos 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role IN ('ADM_MASTER', 'VENDEDOR'))
);

CREATE POLICY "Pagamentos: SUPORTE read-only" ON public.pagamentos 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'SUPORTE')
);

-- Trigger update_updated_at para pagamentos
CREATE TRIGGER trg_update_pagamentos 
BEFORE UPDATE ON public.pagamentos 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Expandir trigger_aprovar_orcamento: Crie venda + lançamento pendente + pagamento pendente
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

-- Expandir trigger_confirmar_venda: Confirme lançamento + pagamento + adicione saída taxa
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

-- Trigger para saídas altas
CREATE OR REPLACE FUNCTION public.trigger_adicionar_saida()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'saida' AND NEW.valor > 1000 THEN
    PERFORM pg_notify('financeiro:saida_alta', json_build_object('lancamento_id', NEW.id, 'valor', NEW.valor)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_adicionar_saida
AFTER INSERT ON public.lancamentos_financeiros
FOR EACH ROW WHEN (NEW.tipo = 'saida') EXECUTE FUNCTION public.trigger_adicionar_saida();

-- View: Fluxo Caixa Mensal
CREATE VIEW public.vw_fluxo_caixa AS
SELECT 
  DATE_TRUNC('month', data_lancamento) AS mes,
  COALESCE(SUM(CASE WHEN tipo = 'entrada' AND status = 'confirmado' THEN valor ELSE 0 END), 0) AS total_entradas,
  COALESCE(SUM(CASE WHEN tipo = 'saida' AND status = 'confirmado' THEN valor ELSE 0 END), 0) AS total_saidas,
  (COALESCE(SUM(CASE WHEN tipo = 'entrada' AND status = 'confirmado' THEN valor ELSE 0 END), 0) - 
   COALESCE(SUM(CASE WHEN tipo = 'saida' AND status = 'confirmado' THEN valor ELSE 0 END), 0)) AS saldo
FROM public.lancamentos_financeiros 
WHERE data_lancamento >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY mes
ORDER BY mes DESC;

-- View: Pendentes Financeiros
CREATE VIEW public.vw_pendentes_financeiros AS
SELECT 
  v.id AS venda_id,
  v.valor_total,
  v.status AS venda_status,
  p.status AS pagamento_status,
  p.metodo AS forma_pagamento,
  p.data_pagamento,
  l.status AS lancamento_status,
  o.numero_orcamento,
  c.nome AS cliente_nome,
  v.created_at AS data_venda
FROM public.vendas v
JOIN public.orcamentos o ON v.orcamento_id = o.id
JOIN public.clientes c ON o.cliente_id = c.id
LEFT JOIN public.pagamentos p ON v.id = p.venda_id AND p.parcela_num = 1
LEFT JOIN public.lancamentos_financeiros l ON v.id = l.venda_id AND l.tipo = 'entrada'
WHERE v.status IN ('pendente', 'confirmada') OR p.status = 'pendente' OR l.status = 'pendente'
ORDER BY v.created_at DESC;

-- View: KPIs Financeiros
CREATE VIEW public.vw_kpis_financeiros AS
SELECT 
  -- Mês atual
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros 
   WHERE tipo = 'entrada' AND status = 'confirmado' 
   AND DATE_TRUNC('month', data_lancamento) = DATE_TRUNC('month', CURRENT_DATE)) AS entradas_mes_atual,
  
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros 
   WHERE tipo = 'saida' AND status = 'confirmado' 
   AND DATE_TRUNC('month', data_lancamento) = DATE_TRUNC('month', CURRENT_DATE)) AS saidas_mes_atual,
   
  -- Pendentes
  (SELECT COALESCE(SUM(valor_total), 0) FROM public.vendas WHERE status = 'pendente') AS vendas_pendentes,
  
  (SELECT COUNT(*) FROM public.pagamentos WHERE status = 'pendente') AS pagamentos_pendentes,
  
  -- Total geral
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros 
   WHERE tipo = 'entrada' AND status = 'confirmado') AS total_entradas,
   
  (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros 
   WHERE tipo = 'saida' AND status = 'confirmado') AS total_saidas;