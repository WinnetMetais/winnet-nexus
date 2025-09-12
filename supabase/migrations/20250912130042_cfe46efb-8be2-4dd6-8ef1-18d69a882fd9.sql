-- Corrigir funções restantes sem search_path
CREATE OR REPLACE FUNCTION public.trigger_aprovar_orcamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  venda_id UUID;
BEGIN
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    INSERT INTO vendas (orcamento_id, valor_total, status, created_by)
    VALUES (NEW.id, NEW.valor_total, 'pendente', NEW.created_by)
    RETURNING id INTO venda_id;

    INSERT INTO lancamentos_financeiros (venda_id, tipo, valor, status, descricao, created_by)
    VALUES (venda_id, 'entrada', NEW.valor_total, 'pendente', 'Entrada pendente orçamento #' || NEW.id, NEW.created_by);

    INSERT INTO pagamentos (venda_id, valor_pago, total_parcelas, created_by)
    VALUES (venda_id, NEW.valor_total, 1, NEW.created_by);

    INSERT INTO notificacoes (user_id, mensagem) VALUES (NEW.created_by, 'Orçamento aprovado e venda criada!');

    INSERT INTO logs (mensagem, user_id) VALUES ('Aprovação auto-fluxo: ' || NEW.id, NEW.created_by);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_confirmar_venda()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  taxa_saida DECIMAL;
BEGIN
  IF NEW.status = 'confirmada' AND OLD.status != 'confirmada' THEN
    UPDATE lancamentos_financeiros SET status = 'confirmado', data_lancamento = CURRENT_DATE
    WHERE venda_id = NEW.id AND tipo = 'entrada' AND status = 'pendente';

    UPDATE pagamentos SET status = 'confirmado', data_pagamento = CURRENT_DATE
    WHERE venda_id = NEW.id AND status = 'pendente';

    taxa_saida := NEW.valor_total * 0.02;
    INSERT INTO lancamentos_financeiros (venda_id, tipo, valor, status, descricao, data_lancamento, created_by)
    VALUES (NEW.id, 'saida', taxa_saida, 'confirmado', 'Taxa processamento venda #' || NEW.id, CURRENT_DATE, NEW.created_by);

    INSERT INTO notificacoes (user_id, mensagem) VALUES (NEW.created_by, 'Venda confirmada e entrada processada!');

    INSERT INTO logs (mensagem, user_id) VALUES ('Confirmação venda: ' || NEW.id, NEW.created_by);

    PERFORM pg_notify('financeiro:confirmado', json_build_object('venda_id', NEW.id, 'valor', NEW.valor_total)::text);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;