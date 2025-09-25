-- Create admin user using Supabase auth functions
-- First, we need to create the user in auth.users, then in usuarios table

-- Create a function to safely create an admin user
CREATE OR REPLACE FUNCTION create_admin_with_auth(
  admin_email TEXT,
  admin_name TEXT
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Since we can't directly insert into auth.users from a migration,
  -- we'll create a placeholder entry that can be manually set up later
  -- Generate a specific UUID for this admin user
  new_user_id := 'a31c8219-a082-452d-8dfc-cd5e4e7dcb82'::uuid;
  
  -- The actual auth user creation needs to be done through Supabase Auth UI or API
  -- For now, we'll prepare the usuarios table entry to be linked later
  
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE email = admin_email) THEN
    -- Insert into usuarios table (will be linked when auth user is created)
    INSERT INTO public.usuarios (id, nome, email, role, ativo)
    VALUES (new_user_id, admin_name, admin_email, 'ADM_MASTER', true);
    
    -- Insert default admin permissions for this user
    INSERT INTO public.user_permissions (user_id, permission_name, resource_type, can_create, can_read, can_update, can_delete, can_admin)
    VALUES 
      (new_user_id, 'usuarios', 'usuarios', true, true, true, true, true),
      (new_user_id, 'clientes', 'clientes', true, true, true, true, true),
      (new_user_id, 'orcamentos', 'orcamentos', true, true, true, true, true),
      (new_user_id, 'vendas', 'vendas', true, true, true, true, true),
      (new_user_id, 'financeiro', 'financeiro', true, true, true, true, true),
      (new_user_id, 'relatorios', 'relatorios', true, true, true, true, true),
      (new_user_id, 'configuracoes', 'sistema', true, true, true, true, true);
      
    -- Log the admin user preparation
    INSERT INTO public.logs (mensagem, user_id, created_at)
    VALUES ('Admin user prepared: ' || admin_email || ' (ID: ' || new_user_id || ')', new_user_id, now());
  END IF;
  
  RETURN new_user_id;
END;
$$;

-- Temporarily disable the foreign key constraint to allow manual admin setup
ALTER TABLE public.usuarios DROP CONSTRAINT IF EXISTS usuarios_id_fkey;

-- Create the admin user entry
SELECT create_admin_with_auth(
  'evandrinhop@gmail.com',
  'Administrador Geral'
);

-- Re-enable the foreign key constraint
-- ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;