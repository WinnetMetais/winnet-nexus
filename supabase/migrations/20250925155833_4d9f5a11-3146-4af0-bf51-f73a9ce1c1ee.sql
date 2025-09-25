-- Add missing database functions referenced in the code

-- Function to update pipeline stage for orcamentos
CREATE OR REPLACE FUNCTION public.fn_update_pipeline_stage(orcamento_id uuid, new_stage text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.orcamentos 
  SET status = new_stage, updated_at = now()
  WHERE id = orcamento_id;
END;
$$;

-- Function to calculate discount
CREATE OR REPLACE FUNCTION public.fn_calculate_discount(base_value numeric, discount_percent numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN base_value * (1 - discount_percent / 100);
END;
$$;

-- Function to send automatic notifications
CREATE OR REPLACE FUNCTION public.fn_send_automatic_notification(target_user_id uuid, notification_message text, notification_type text DEFAULT 'info')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notificacoes (user_id, mensagem, created_at)
  VALUES (target_user_id, notification_message, now())
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger for expired orcamentos
CREATE OR REPLACE FUNCTION public.trigger_orcamento_vencido()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if orcamento is past due date and status is still 'enviado'
  IF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'enviado' THEN
    -- Update status to expired
    NEW.status = 'vencido';
    
    -- Send notification
    PERFORM fn_send_automatic_notification(
      NEW.created_by, 
      'Orçamento #' || NEW.numero_orcamento || ' venceu e foi automaticamente marcado como vencido.',
      'warning'
    );
    
    -- Log the event
    INSERT INTO public.logs (mensagem, user_id, created_at)
    VALUES ('Orçamento vencido automaticamente: ' || NEW.id, NEW.created_by, now());
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for orcamento expiry check
DROP TRIGGER IF EXISTS tr_check_orcamento_vencido ON public.orcamentos;
CREATE TRIGGER tr_check_orcamento_vencido
  BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_orcamento_vencido();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_data_vencimento ON public.orcamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON public.vendas(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON public.lancamentos_financeiros(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON public.pagamentos(status);