-- Fix security warnings by setting search_path for functions

-- Update get_user_role function with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT AS $$
  SELECT role FROM public.usuarios WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Update trigger_aprovar_orcamento function with proper search_path  
CREATE OR REPLACE FUNCTION public.trigger_aprovar_orcamento()
RETURNS TRIGGER AS $$
DECLARE
  venda_id_var UUID;
BEGIN
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    -- Criar Venda
    INSERT INTO vendas (orcamento_id, valor_total, created_by)
    VALUES (NEW.id, NEW.valor_total, NEW.created_by)
    RETURNING id INTO venda_id_var;

    -- Criar Lançamento Financeiro (entrada)
    INSERT INTO lancamentos_financeiros (venda_id, tipo, valor, descricao, created_by)
    VALUES (
      venda_id_var,
      'entrada',
      NEW.valor_total,
      'Entrada de venda do orçamento #' || NEW.id,
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;