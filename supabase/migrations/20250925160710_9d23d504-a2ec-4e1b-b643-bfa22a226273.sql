-- Ensure all remaining functions have proper search_path

CREATE OR REPLACE FUNCTION public.log_activity(p_user_id uuid, p_event_type text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure the target user exists in public.admins
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'user % is not allowed to be logged as admin', p_user_id;
  END IF;

  INSERT INTO public.activity_log(user_id, event_type, metadata, created_at)
  VALUES (p_user_id, p_event_type, p_metadata, now());
END;
$$;

CREATE OR REPLACE FUNCTION public.set_app_889475991a_quotes_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := (SELECT auth.uid());
  END IF;
  IF NEW.created_by IS NULL THEN
    NEW.created_by := (SELECT auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.usuarios u WHERE u.id = user_id LIMIT 1;
$$;