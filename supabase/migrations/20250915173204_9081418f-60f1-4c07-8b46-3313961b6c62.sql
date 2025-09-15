-- ========================================
-- LIMPEZA COMPLETA DAS POLÍTICAS REDUNDANTES
-- ========================================

-- DROP todas as políticas existentes de todas as tabelas
DROP POLICY IF EXISTS "Clientes: delete" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: insert" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: read" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: update" ON public.clientes;

DROP POLICY IF EXISTS "Itens Orcamento: delete" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens Orcamento: insert" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens Orcamento: select" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens Orcamento: update" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens: DELETE" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens: INSERT" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens: SELECT via Orcamento" ON public.itens_orcamento;
DROP POLICY IF EXISTS "Itens: UPDATE" ON public.itens_orcamento;

DROP POLICY IF EXISTS "Lancamentos DELETE" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Lancamentos INSERT" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Lancamentos SELECT" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Lancamentos UPDATE" ON public.lancamentos_financeiros;
DROP POLICY IF EXISTS "Lancamentos: SUPORTE read" ON public.lancamentos_financeiros;

DROP POLICY IF EXISTS "Logs: ADM full read" ON public.logs;
DROP POLICY IF EXISTS "Logs: Own INSERT" ON public.logs;
DROP POLICY IF EXISTS "Logs: select" ON public.logs;

DROP POLICY IF EXISTS "Notif: DELETE" ON public.notificacoes;
DROP POLICY IF EXISTS "Notif: INSERT" ON public.notificacoes;
DROP POLICY IF EXISTS "Notif: SELECT" ON public.notificacoes;
DROP POLICY IF EXISTS "Notif: UPDATE" ON public.notificacoes;
DROP POLICY IF EXISTS "Notificacoes DELETE" ON public.notificacoes;
DROP POLICY IF EXISTS "Notificacoes INSERT" ON public.notificacoes;
DROP POLICY IF EXISTS "Notificacoes SELECT" ON public.notificacoes;
DROP POLICY IF EXISTS "Notificacoes UPDATE" ON public.notificacoes;

-- DROP todas as políticas de orcamentos (muitas duplicadas)
DROP POLICY IF EXISTS "Orcamentos DELETE" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos INSERT" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos SELECT" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos UPDATE" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: ADM full DELETE" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: ADM full INSERT" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: ADM full SELECT" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: ADM full UPDATE" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: SUPORTE read" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: VENDEDOR own DELETE" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: VENDEDOR own INSERT" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: VENDEDOR own SELECT" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: VENDEDOR own UPDATE" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: VENDEDOR select" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: VENDEDOR update" ON public.orcamentos;
DROP POLICY IF EXISTS "Orcamentos: VENDEDOR write" ON public.orcamentos;

-- DROP todas as políticas de pagamentos (muitas duplicadas)
DROP POLICY IF EXISTS "Pag: UPDATE" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos DELETE" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos INSERT" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos SELECT" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos UPDATE" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: ADM delete" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: ADM insert" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: ADM select" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: ADM update" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: SUPORTE read" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: VENDEDOR delete" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: VENDEDOR insert" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: VENDEDOR update" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: delete" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: insert" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: select" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: update" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: vendor modify own - delete" ON public.pagamentos;
DROP POLICY IF EXISTS "Pagamentos: vendor modify own - update" ON public.pagamentos;

-- DROP todas as políticas de usuarios (muitas duplicadas)
DROP POLICY IF EXISTS "Usuarios DELETE" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios INSERT" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios SELECT" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios UPDATE" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: ADM all" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: SUPORTE read-only" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: VENDEDOR/SUPORTE own DELETE" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: VENDEDOR/SUPORTE own INSERT" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: VENDEDOR/SUPORTE own SELECT" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios: VENDEDOR/SUPORTE own UPDATE" ON public.usuarios;

-- DROP todas as políticas de vendas (muitas duplicadas)
DROP POLICY IF EXISTS "Venda: DELETE" ON public.vendas;
DROP POLICY IF EXISTS "Venda: INSERT" ON public.vendas;
DROP POLICY IF EXISTS "Venda: SELECT" ON public.vendas;
DROP POLICY IF EXISTS "Venda: UPDATE" ON public.vendas;
DROP POLICY IF EXISTS "Vendas DELETE" ON public.vendas;
DROP POLICY IF EXISTS "Vendas INSERT" ON public.vendas;
DROP POLICY IF EXISTS "Vendas SELECT" ON public.vendas;
DROP POLICY IF EXISTS "Vendas UPDATE" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: ADM delete" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: ADM insert" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: ADM select" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: ADM update" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: SUPORTE read" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: VENDEDOR delete" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: VENDEDOR insert" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: VENDEDOR update" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: delete" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: insert" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: select" ON public.vendas;
DROP POLICY IF EXISTS "Vendas: update" ON public.vendas;

-- ========================================
-- CRIAÇÃO DE POLÍTICAS LIMPAS E ORGANIZADAS
-- ========================================

-- CLIENTES - Políticas limpas
CREATE POLICY "clientes_select" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "clientes_insert" ON public.clientes FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'VENDEDOR'])
);
CREATE POLICY "clientes_update" ON public.clientes FOR UPDATE USING (
  get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'VENDEDOR'])
) WITH CHECK (
  get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'VENDEDOR'])
);
CREATE POLICY "clientes_delete" ON public.clientes FOR DELETE USING (
  get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'VENDEDOR'])
);

-- ORCAMENTOS - Políticas limpas
CREATE POLICY "orcamentos_select" ON public.orcamentos FOR SELECT USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'SUPORTE'])
);
CREATE POLICY "orcamentos_insert" ON public.orcamentos FOR INSERT WITH CHECK (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "orcamentos_update" ON public.orcamentos FOR UPDATE USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "orcamentos_delete" ON public.orcamentos FOR DELETE USING (
  get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- ITENS ORCAMENTO - Políticas limpas
CREATE POLICY "itens_orcamento_select" ON public.itens_orcamento FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orcamentos o 
    WHERE o.id = itens_orcamento.orcamento_id 
    AND (o.created_by = auth.uid() OR get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'SUPORTE']))
  )
);
CREATE POLICY "itens_orcamento_insert" ON public.itens_orcamento FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orcamentos o 
    WHERE o.id = itens_orcamento.orcamento_id 
    AND (o.created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER')
  )
);
CREATE POLICY "itens_orcamento_update" ON public.itens_orcamento FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM orcamentos o 
    WHERE o.id = itens_orcamento.orcamento_id 
    AND (o.created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM orcamentos o 
    WHERE o.id = itens_orcamento.orcamento_id 
    AND (o.created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER')
  )
);
CREATE POLICY "itens_orcamento_delete" ON public.itens_orcamento FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM orcamentos o 
    WHERE o.id = itens_orcamento.orcamento_id 
    AND (o.created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER')
  )
);

-- VENDAS - Políticas limpas
CREATE POLICY "vendas_select" ON public.vendas FOR SELECT USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'SUPORTE'])
);
CREATE POLICY "vendas_insert" ON public.vendas FOR INSERT WITH CHECK (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "vendas_update" ON public.vendas FOR UPDATE USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "vendas_delete" ON public.vendas FOR DELETE USING (
  get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- LANCAMENTOS FINANCEIROS - Políticas limpas
CREATE POLICY "lancamentos_select" ON public.lancamentos_financeiros FOR SELECT USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'SUPORTE'])
);
CREATE POLICY "lancamentos_insert" ON public.lancamentos_financeiros FOR INSERT WITH CHECK (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "lancamentos_update" ON public.lancamentos_financeiros FOR UPDATE USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "lancamentos_delete" ON public.lancamentos_financeiros FOR DELETE USING (
  get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- PAGAMENTOS - Políticas limpas
CREATE POLICY "pagamentos_select" ON public.pagamentos FOR SELECT USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'SUPORTE'])
);
CREATE POLICY "pagamentos_insert" ON public.pagamentos FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'VENDEDOR'])
);
CREATE POLICY "pagamentos_update" ON public.pagamentos FOR UPDATE USING (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
  created_by = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "pagamentos_delete" ON public.pagamentos FOR DELETE USING (
  get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- USUARIOS - Políticas limpas
CREATE POLICY "usuarios_select" ON public.usuarios FOR SELECT USING (
  id = auth.uid() OR get_user_role(auth.uid()) = ANY(ARRAY['ADM_MASTER', 'SUPORTE'])
);
CREATE POLICY "usuarios_insert" ON public.usuarios FOR INSERT WITH CHECK (
  id = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "usuarios_update" ON public.usuarios FOR UPDATE USING (
  id = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
) WITH CHECK (
  id = auth.uid() OR get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "usuarios_delete" ON public.usuarios FOR DELETE USING (
  get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- LOGS - Políticas limpas
CREATE POLICY "logs_select" ON public.logs FOR SELECT USING (
  get_user_role(auth.uid()) = 'ADM_MASTER'
);
CREATE POLICY "logs_insert" ON public.logs FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- NOTIFICACOES - Políticas limpas  
CREATE POLICY "notificacoes_select" ON public.notificacoes FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "notificacoes_insert" ON public.notificacoes FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "notificacoes_update" ON public.notificacoes FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);
CREATE POLICY "notificacoes_delete" ON public.notificacoes FOR DELETE USING (
  get_user_role(auth.uid()) = 'ADM_MASTER'
);

-- ========================================
-- CONFIGURAÇÃO DE REALTIME CORRIGIDA
-- ========================================

-- Configurar REPLICA IDENTITY FULL para realtime
ALTER TABLE public.clientes REPLICA IDENTITY FULL;
ALTER TABLE public.orcamentos REPLICA IDENTITY FULL;
ALTER TABLE public.itens_orcamento REPLICA IDENTITY FULL;
ALTER TABLE public.vendas REPLICA IDENTITY FULL;
ALTER TABLE public.lancamentos_financeiros REPLICA IDENTITY FULL;
ALTER TABLE public.pagamentos REPLICA IDENTITY FULL;
ALTER TABLE public.notificacoes REPLICA IDENTITY FULL;
ALTER TABLE public.logs REPLICA IDENTITY FULL;
ALTER TABLE public.usuarios REPLICA IDENTITY FULL;

-- Adicionar tabelas ao publication apenas se não existirem
DO $$
BEGIN
  -- Verificar e adicionar tabelas ao publication apenas se necessário
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orcamentos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orcamentos;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'itens_orcamento'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_orcamento;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'vendas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'lancamentos_financeiros'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lancamentos_financeiros;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pagamentos'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pagamentos;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notificacoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.logs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'usuarios'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.usuarios;
  END IF;
END $$;

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices importantes para queries frequentes
CREATE INDEX IF NOT EXISTS idx_clientes_created_by ON public.clientes(created_by);
CREATE INDEX IF NOT EXISTS idx_orcamentos_created_by ON public.orcamentos(created_by);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON public.orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_created_by ON public.vendas(created_by);
CREATE INDEX IF NOT EXISTS idx_vendas_orcamento_id ON public.vendas(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON public.vendas(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_created_by ON public.lancamentos_financeiros(created_by);
CREATE INDEX IF NOT EXISTS idx_lancamentos_venda_id ON public.lancamentos_financeiros(venda_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_created_by ON public.pagamentos(created_by);
CREATE INDEX IF NOT EXISTS idx_pagamentos_venda_id ON public.pagamentos(venda_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);

-- Comentários das mudanças
COMMENT ON TABLE public.clientes IS 'Tabela de clientes com RLS limpo e realtime habilitado';
COMMENT ON TABLE public.orcamentos IS 'Tabela de orçamentos com RLS limpo e realtime habilitado';
COMMENT ON TABLE public.vendas IS 'Tabela de vendas com RLS limpo e realtime habilitado';
COMMENT ON TABLE public.lancamentos_financeiros IS 'Tabela de lançamentos financeiros com RLS limpo e realtime habilitado';
COMMENT ON TABLE public.pagamentos IS 'Tabela de pagamentos com RLS limpo e realtime habilitado';