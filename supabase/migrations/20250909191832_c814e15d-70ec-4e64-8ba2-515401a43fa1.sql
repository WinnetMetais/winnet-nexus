-- RLS Refinements and Additional Triggers

-- Add notificacoes table for real-time notifications
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add logs table for audit trail
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Enhanced RLS Policies
-- Clientes: All can read, but only ADM/VENDEDOR can write
DROP POLICY IF EXISTS "clientes_policy" ON public.clientes;
CREATE POLICY "Clientes: Read all, write ADM/VENDEDOR" ON public.clientes 
FOR ALL USING (true) 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role IN ('ADM_MASTER', 'VENDEDOR'))
);

-- Orcamentos: SUPORTE read-only, no delete for non-ADM
CREATE POLICY "Orcamentos: SUPORTE read-only" ON public.orcamentos 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'SUPORTE')
);

CREATE POLICY "Orcamentos: No delete for non-ADM" ON public.orcamentos 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'ADM_MASTER')
);

-- Vendas: SUPORTE read-only
CREATE POLICY "Vendas: SUPORTE read-only" ON public.vendas 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'SUPORTE')
);

-- Lancamentos: No update for SUPORTE
CREATE POLICY "Lancamentos: No update for SUPORTE" ON public.lancamentos_financeiros 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role != 'SUPORTE')
);

-- Itens Orcamento: Access via orcamento owner
CREATE POLICY "Itens: Full via Orcamento RLS" ON public.itens_orcamento 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.orcamentos 
    WHERE id = itens_orcamento.orcamento_id 
    AND (
      orcamentos.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'ADM_MASTER')
    )
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orcamentos 
    WHERE id = itens_orcamento.orcamento_id 
    AND (
      orcamentos.created_by = auth.uid() OR 
      EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'ADM_MASTER')
    )
  )
);

-- Notificacoes: Users can only see their own
CREATE POLICY "Notificacoes: User own" ON public.notificacoes 
FOR ALL USING (user_id = auth.uid());

-- Logs: Only ADM_MASTER can read
CREATE POLICY "Logs: ADM only" ON public.logs 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'ADM_MASTER')
);

-- Additional Triggers

-- Trigger for rejected budgets
CREATE OR REPLACE FUNCTION public.trigger_rejeitar_orcamento()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejeitado' AND OLD.status != 'rejeitado' THEN
    INSERT INTO public.logs (id, mensagem) 
    VALUES (gen_random_uuid(), 'Orçamento #' || NEW.id || ' rejeitado por ' || NEW.created_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_rejeitar_orcamento
AFTER UPDATE ON public.orcamentos
FOR EACH ROW EXECUTE FUNCTION public.trigger_rejeitar_orcamento();

-- Trigger for confirmed sales
CREATE OR REPLACE FUNCTION public.trigger_confirmar_venda()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmada' AND OLD.status != 'confirmada' THEN
    UPDATE public.lancamentos_financeiros 
    SET status = 'confirmado' 
    WHERE venda_id = NEW.id AND status = 'pendente';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_confirmar_venda
AFTER UPDATE ON public.vendas
FOR EACH ROW EXECUTE FUNCTION public.trigger_confirmar_venda();

-- Trigger for user deactivation
CREATE OR REPLACE FUNCTION public.trigger_inativar_usuario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ativo = false AND OLD.ativo = true THEN
    PERFORM pg_notify('usuarios:inativados', json_build_object('user_id', NEW.id)::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_inativar_usuario
AFTER UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.trigger_inativar_usuario();

-- Add update_updated_at triggers for remaining tables
CREATE TRIGGER trg_update_vendas 
BEFORE UPDATE ON public.vendas 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_update_lancamentos 
BEFORE UPDATE ON public.lancamentos_financeiros 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_update_notificacoes 
BEFORE UPDATE ON public.notificacoes 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add realtime to new tables
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
ALTER TABLE public.logs REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs;