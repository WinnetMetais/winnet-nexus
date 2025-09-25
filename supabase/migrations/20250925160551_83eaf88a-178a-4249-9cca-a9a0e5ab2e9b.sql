-- Fix security warnings by setting search_path for all functions that are missing it

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.audit_clientes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO logs(mensagem, created_at)
  VALUES (format('clientes %s by %s at %s', TG_OP, current_uid(), now()), now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_inativar_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.ativo = false AND OLD.ativo = true THEN
    INSERT INTO logs (mensagem, user_id) VALUES ('Usuário inativado: ' || NEW.id, NEW.id);
    INSERT INTO notificacoes (user_id, mensagem) VALUES (NEW.id, 'Sua conta foi inativada.');
    PERFORM pg_notify('usuarios:inativados', json_build_object('user_id', NEW.id)::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_rejeitar_orcamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'rejeitado' AND OLD.status != 'rejeitado' THEN
    INSERT INTO logs (mensagem, user_id) VALUES ('Rejeição: ' || NEW.id, NEW.created_by);
    INSERT INTO notificacoes (user_id, mensagem) VALUES (NEW.created_by, 'Orçamento rejeitado.');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_adicionar_saida()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tipo = 'saida' AND NEW.valor > 1000 THEN
    INSERT INTO notificacoes (user_id, mensagem) VALUES (NEW.created_by, 'Saída alta detectada: R$ ' || NEW.valor);
    PERFORM pg_notify('financeiro:saida_alta', json_build_object('lancamento_id', NEW.id)::text);
  END IF;
  INSERT INTO logs (mensagem, user_id) VALUES ('Nova saída: ' || NEW.descricao, NEW.created_by);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO app_889475991a_activities (entity_type, entity_id, activity_type, title, description, created_by)
        VALUES (
            TG_TABLE_NAME,
            NEW.id,
            'status_change',
            'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || COALESCE(NEW.status, 'null'),
            'Automatic status change log',
            NEW.updated_at
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_invoice_amounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update paid amount and remaining amount
        UPDATE app_889475991a_invoices 
        SET 
            paid_amount = paid_amount + NEW.amount,
            remaining_amount = total_amount - (paid_amount + NEW.amount),
            status = CASE 
                WHEN (paid_amount + NEW.amount) >= total_amount THEN 'paid'
                WHEN (paid_amount + NEW.amount) > 0 THEN 'partial'
                ELSE status
            END,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = NEW.invoice_id;
        
        -- Create cash flow entry for income
        INSERT INTO app_889475991a_cash_flow (
            transaction_type, category, description, amount, transaction_date, 
            payment_method, reference_id, reference_type, created_by
        ) VALUES (
            'income', 'Sales', 'Payment received for invoice', NEW.amount, NEW.payment_date,
            NEW.payment_method, NEW.invoice_id, 'invoice', NEW.created_by
        );
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the payment
        UPDATE app_889475991a_invoices 
        SET 
            paid_amount = paid_amount - OLD.amount,
            remaining_amount = total_amount - (paid_amount - OLD.amount),
            status = CASE 
                WHEN (paid_amount - OLD.amount) >= total_amount THEN 'paid'
                WHEN (paid_amount - OLD.amount) > 0 THEN 'partial'
                ELSE 'pending'
            END,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = OLD.invoice_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_orcamento(o_id bigint, uid uuid, usr_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  owner_id uuid;
BEGIN
  -- fetch created_by from orcamentos
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

CREATE OR REPLACE FUNCTION public.create_notification(target_user_id uuid, notification_title character varying, notification_message text, notification_type character varying DEFAULT 'info'::character varying, entity_type character varying DEFAULT NULL::character varying, entity_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO app_889475991a_notifications (
        user_id, title, message, type, entity_type, entity_id
    ) VALUES (
        target_user_id, notification_title, notification_message, 
        notification_type, entity_type, entity_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_opportunity_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        -- Notify assigned user
        PERFORM create_notification(
            NEW.assigned_to,
            'Oportunidade atualizada',
            'A oportunidade "' || NEW.title || '" mudou para o estágio: ' || NEW.stage,
            'info',
            'opportunity',
            NEW.id
        );
        
        -- If closed won, create notification for financial team
        IF NEW.stage = 'closed_won' THEN
            PERFORM create_notification(
                NEW.created_by,
                'Venda fechada!',
                'Parabéns! A oportunidade "' || NEW.title || '" foi fechada com sucesso no valor de R$ ' || NEW.value::text,
                'success',
                'opportunity',
                NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_invoice_overdue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'overdue' THEN
        PERFORM create_notification(
            NEW.created_by,
            'Fatura vencida',
            'A fatura ' || NEW.invoice_number || ' está vencida. Valor: R$ ' || NEW.remaining_amount::text,
            'warning',
            'invoice',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_payment_received()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    invoice_record RECORD;
BEGIN
    -- Get invoice information
    SELECT * INTO invoice_record 
    FROM app_889475991a_invoices 
    WHERE id = NEW.invoice_id;
    
    IF FOUND THEN
        PERFORM create_notification(
            invoice_record.created_by,
            'Pagamento recebido',
            'Pagamento de R$ ' || NEW.amount::text || ' recebido para a fatura ' || invoice_record.invoice_number,
            'success',
            'payment',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_address_by_cep(cep_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result JSON;
BEGIN
    -- This is a placeholder for CEP API integration
    -- In production, this would call an external API like ViaCEP
    result := json_build_object(
        'street', 'Rua Exemplo',
        'neighborhood', 'Centro',
        'city', 'São Paulo',
        'state', 'SP'
    );
    RETURN result;
END;
$$;