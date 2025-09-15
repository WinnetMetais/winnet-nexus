-- Refine RLS policies for usuarios and orcamentos to remove redundancies

-- Usuarios
DROP POLICY IF EXISTS "Usuarios: self select" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: self update" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: ADM all" ON public.usuarios;

CREATE POLICY "Usuarios: self select" ON public.usuarios
FOR SELECT USING (
    id = auth.uid()
);

CREATE POLICY "Usuarios: self update" ON public.usuarios
FOR UPDATE USING (
    id = auth.uid()
) WITH CHECK (
    id = auth.uid() AND role = (SELECT role FROM public.usuarios WHERE id = auth.uid())
);

CREATE POLICY "Usuarios: ADM all" ON public.usuarios
FOR ALL USING (
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- Orcamentos
DROP POLICY IF EXISTS "Orcamentos: select" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: insert" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: update" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: delete" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: self read" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: support read" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: self insert" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: self update" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: ADM all" ON public.orcamentos;

CREATE POLICY "Orcamentos: self read" ON public.orcamentos
FOR SELECT USING (
    created_by = auth.uid()
);

CREATE POLICY "Orcamentos: support read" ON public.orcamentos
FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'SUPORTE'
);

CREATE POLICY "Orcamentos: self insert" ON public.orcamentos
FOR INSERT WITH CHECK (
    created_by = auth.uid() AND public.get_user_role(auth.uid()) = 'VENDEDOR'
);

CREATE POLICY "Orcamentos: self update" ON public.orcamentos
FOR UPDATE USING (
    created_by = auth.uid() AND public.get_user_role(auth.uid()) = 'VENDEDOR'
) WITH CHECK (
    created_by = auth.uid() AND public.get_user_role(auth.uid()) = 'VENDEDOR'
);

CREATE POLICY "Orcamentos: ADM all" ON public.orcamentos
FOR ALL USING (
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
);
