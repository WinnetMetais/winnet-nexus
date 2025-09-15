-- Update RLS policies to enforce least privilege and remove redundancies

-- Usuarios: prevent self role escalation
DROP POLICY IF EXISTS "usuarios_policy" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: self select" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: self update" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: ADM all" ON public.usuarios;

CREATE POLICY "Usuarios: self select" ON public.usuarios
FOR SELECT USING (
    id = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

CREATE POLICY "Usuarios: self update" ON public.usuarios
FOR UPDATE USING (
    id = auth.uid()
) WITH CHECK (
    (id = auth.uid() AND role = (SELECT role FROM public.usuarios WHERE id = auth.uid()))
    OR public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

CREATE POLICY "Usuarios: ADM all" ON public.usuarios
FOR ALL USING (
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- Clientes: public read, restricted write
DROP POLICY IF EXISTS "Clientes: ADM/VENDEDOR manage" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: Read all, write ADM/VENDEDOR" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: insert" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: update" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: delete" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: write" ON public.clientes;

CREATE POLICY "Clientes: read" ON public.clientes
FOR SELECT USING (true);

CREATE POLICY "Clientes: write" ON public.clientes
FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('ADM_MASTER', 'VENDEDOR')
) WITH CHECK (
    public.get_user_role(auth.uid()) IN ('ADM_MASTER', 'VENDEDOR')
);

-- Orcamentos: support read-only, delete only ADM
DROP POLICY IF EXISTS "orcamentos_policy" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: SUPORTE read-only" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: No delete for non-ADM" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: select" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: insert" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: update" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: delete" ON public.orcamentos;

CREATE POLICY "Orcamentos: select" ON public.orcamentos
FOR SELECT USING (
    created_by = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('ADM_MASTER', 'SUPORTE')
);

CREATE POLICY "Orcamentos: insert" ON public.orcamentos
FOR INSERT WITH CHECK (
    created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

CREATE POLICY "Orcamentos: update" ON public.orcamentos
FOR UPDATE USING (
    created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
    created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

CREATE POLICY "Orcamentos: delete" ON public.orcamentos
FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- Itens de Orcamento: access via related orcamento; suporte read-only
DROP POLICY IF EXISTS "itens_orcamento_policy" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens: Full via Orcamento RLS" ON public.itens_orcamento;

CREATE POLICY "Itens Orcamento: select" ON public.itens_orcamento
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orcamentos o
        WHERE o.id = itens_orcamento.orcamento_id
          AND (
            o.created_by = auth.uid() OR
            public.get_user_role(auth.uid()) = 'ADM_MASTER'
          )
    )
    OR public.get_user_role(auth.uid()) = 'SUPORTE'
);

CREATE POLICY "Itens Orcamento: insert" ON public.itens_orcamento
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orcamentos o
        WHERE o.id = itens_orcamento.orcamento_id
          AND (
            o.created_by = auth.uid() OR
            public.get_user_role(auth.uid()) = 'ADM_MASTER'
          )
    )
);

CREATE POLICY "Itens Orcamento: update" ON public.itens_orcamento
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.orcamentos o
        WHERE o.id = itens_orcamento.orcamento_id
          AND (
            o.created_by = auth.uid() OR
            public.get_user_role(auth.uid()) = 'ADM_MASTER'
          )
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orcamentos o
        WHERE o.id = itens_orcamento.orcamento_id
          AND (
            o.created_by = auth.uid() OR
            public.get_user_role(auth.uid()) = 'ADM_MASTER'
          )
    )
);

CREATE POLICY "Itens Orcamento: delete" ON public.itens_orcamento
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.orcamentos o
        WHERE o.id = itens_orcamento.orcamento_id
          AND (
            o.created_by = auth.uid() OR
            public.get_user_role(auth.uid()) = 'ADM_MASTER'
          )
    )
);

-- Lancamentos financeiros: suporte read-only, owner or ADM manage
DROP POLICY IF EXISTS "lancamentos_policy" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Lancamentos: No update for SUPORTE" ON public.lancamentos_financeiros;

CREATE POLICY "Lancamentos: select" ON public.lancamentos_financeiros
FOR SELECT USING (
    created_by = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('ADM_MASTER', 'SUPORTE')
);

CREATE POLICY "Lancamentos: insert" ON public.lancamentos_financeiros
FOR INSERT WITH CHECK (
    created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

CREATE POLICY "Lancamentos: update" ON public.lancamentos_financeiros
FOR UPDATE USING (
    (created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER')
    AND public.get_user_role(auth.uid()) <> 'SUPORTE'
) WITH CHECK (
    (created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER')
    AND public.get_user_role(auth.uid()) <> 'SUPORTE'
);

CREATE POLICY "Lancamentos: delete" ON public.lancamentos_financeiros
FOR DELETE USING (
    created_by = auth.uid() OR public.get_user_role(auth.uid()) = 'ADM_MASTER'
);

