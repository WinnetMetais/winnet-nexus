-- Autenticar todos os usuários atuais como administradores gerais
UPDATE public.usuarios 
SET role = 'ADM_MASTER' 
WHERE role != 'ADM_MASTER' OR role IS NULL;

-- Criar tabela de permissões específicas
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    permission_name TEXT NOT NULL,
    resource_type TEXT, -- 'clientes', 'orcamentos', 'vendas', 'financeiro', etc.
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_admin BOOLEAN DEFAULT false, -- permissão de administrador para o recurso específico
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, permission_name, resource_type)
);

-- Habilitar RLS na tabela de permissões
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que ADM_MASTER vejam todas as permissões
CREATE POLICY "user_permissions_admin_access" 
ON public.user_permissions 
FOR ALL 
USING (fn_validate_user_permissions(ARRAY['ADM_MASTER'::text]));

-- Política para usuários verem suas próprias permissões
CREATE POLICY "user_permissions_own_access" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

-- Criar função para verificar permissões específicas
CREATE OR REPLACE FUNCTION public.fn_has_permission(
    p_user_id UUID,
    p_permission_name TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_action TEXT DEFAULT 'read' -- 'create', 'read', 'update', 'delete', 'admin'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    has_perm BOOLEAN := false;
    user_role TEXT;
BEGIN
    -- ADM_MASTER sempre tem todas as permissões
    SELECT role INTO user_role FROM public.usuarios WHERE id = p_user_id;
    IF user_role = 'ADM_MASTER' THEN
        RETURN true;
    END IF;
    
    -- Verificar permissões específicas na tabela
    CASE p_action
        WHEN 'create' THEN
            SELECT can_create INTO has_perm 
            FROM public.user_permissions 
            WHERE user_id = p_user_id 
                AND permission_name = p_permission_name 
                AND (resource_type = p_resource_type OR resource_type IS NULL)
            LIMIT 1;
        WHEN 'read' THEN
            SELECT can_read INTO has_perm 
            FROM public.user_permissions 
            WHERE user_id = p_user_id 
                AND permission_name = p_permission_name 
                AND (resource_type = p_resource_type OR resource_type IS NULL)
            LIMIT 1;
        WHEN 'update' THEN
            SELECT can_update INTO has_perm 
            FROM public.user_permissions 
            WHERE user_id = p_user_id 
                AND permission_name = p_permission_name 
                AND (resource_type = p_resource_type OR resource_type IS NULL)
            LIMIT 1;
        WHEN 'delete' THEN
            SELECT can_delete INTO has_perm 
            FROM public.user_permissions 
            WHERE user_id = p_user_id 
                AND permission_name = p_permission_name 
                AND (resource_type = p_resource_type OR resource_type IS NULL)
            LIMIT 1;
        WHEN 'admin' THEN
            SELECT can_admin INTO has_perm 
            FROM public.user_permissions 
            WHERE user_id = p_user_id 
                AND permission_name = p_permission_name 
                AND (resource_type = p_resource_type OR resource_type IS NULL)
            LIMIT 1;
    END CASE;
    
    RETURN COALESCE(has_perm, false);
END;
$$;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON public.user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Inserir permissões padrão para todos os usuários ADM_MASTER existentes
WITH admin_users AS (
    SELECT id FROM public.usuarios WHERE role = 'ADM_MASTER'
),
permissions AS (
    SELECT 'system_admin' as perm, 'all' as resource UNION ALL
    SELECT 'user_management', 'usuarios' UNION ALL
    SELECT 'client_management', 'clientes' UNION ALL
    SELECT 'quote_management', 'orcamentos' UNION ALL
    SELECT 'sales_management', 'vendas' UNION ALL
    SELECT 'financial_management', 'financeiro'
)
INSERT INTO public.user_permissions (user_id, permission_name, resource_type, can_create, can_read, can_update, can_delete, can_admin)
SELECT 
    u.id,
    p.perm,
    p.resource,
    true, true, true, true, true
FROM admin_users u
CROSS JOIN permissions p
ON CONFLICT (user_id, permission_name, resource_type) DO NOTHING;