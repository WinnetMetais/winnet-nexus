-- Fix security issues: Remove SECURITY DEFINER from views and add proper search_path to functions

-- Fix search_path for functions
ALTER FUNCTION public.get_user_role(uuid) SET search_path = public;
ALTER FUNCTION public.recalc_valor_total_orcamento() SET search_path = public;
ALTER FUNCTION public.trigger_aprovar_orcamento() SET search_path = public;
ALTER FUNCTION public.trigger_rejeitar_orcamento() SET search_path = public;
ALTER FUNCTION public.trigger_inativar_usuario() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.trigger_confirmar_venda() SET search_path = public;
ALTER FUNCTION public.trigger_adicionar_saida() SET search_path = public;