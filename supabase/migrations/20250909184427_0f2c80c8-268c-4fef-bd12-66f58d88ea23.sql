-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create security definer function to get user role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT AS $$
  SELECT role FROM public.usuarios WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Tabela Usuários (extende auth.users do Supabase para roles)
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('ADM_MASTER', 'VENDEDOR', 'SUPORTE')) DEFAULT 'VENDEDOR',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Clientes
CREATE TABLE public.clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Orçamentos (sem referência circular)
CREATE TABLE public.orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'rejeitado')) DEFAULT 'rascunho',
  data_vencimento DATE NOT NULL,
  observacoes TEXT,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Itens de Orçamento (referencia orcamentos)
CREATE TABLE public.itens_orcamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1 CHECK (quantidade > 0),
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Vendas
CREATE TABLE public.vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID REFERENCES orcamentos(id) ON DELETE RESTRICT,
  data_venda DATE DEFAULT CURRENT_DATE,
  valor_total DECIMAL(10,2) NOT NULL,
  forma_pagamento TEXT DEFAULT 'À vista',
  status TEXT CHECK (status IN ('pendente', 'confirmada', 'cancelada')) DEFAULT 'pendente',
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela Lançamentos Financeiros
CREATE TABLE public.lancamentos_financeiros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('entrada', 'saida')) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_lancamento DATE DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  categoria TEXT DEFAULT 'Vendas',
  status TEXT CHECK (status IN ('pendente', 'confirmado', 'cancelado')) DEFAULT 'pendente',
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_created_by ON orcamentos(created_by);
CREATE INDEX idx_vendas_status ON vendas(status);
CREATE INDEX idx_vendas_created_by ON vendas(created_by);
CREATE INDEX idx_lancamentos_tipo ON lancamentos_financeiros(tipo);
CREATE INDEX idx_lancamentos_created_by ON lancamentos_financeiros(created_by);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_itens_orcamento_orcamento_id ON itens_orcamento(orcamento_id);

-- Enable Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY;

-- RLS Policies using security definer function
-- Usuários policies
CREATE POLICY "usuarios_policy" ON usuarios 
  FOR ALL USING (
    id = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
  );

-- Clientes policies (todos podem ver para CRM)
CREATE POLICY "clientes_policy" ON clientes 
  FOR ALL USING (true);

-- Orçamentos policies
CREATE POLICY "orcamentos_policy" ON orcamentos 
  FOR ALL USING (
    created_by = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
  );

-- Itens de orçamento policies
CREATE POLICY "itens_orcamento_policy" ON itens_orcamento 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orcamentos 
      WHERE id = orcamento_id AND (
        created_by = auth.uid() OR 
        public.get_user_role(auth.uid()) = 'ADM_MASTER'
      )
    )
  );

-- Vendas policies
CREATE POLICY "vendas_policy" ON vendas 
  FOR ALL USING (
    created_by = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
  );

-- Lançamentos financeiros policies
CREATE POLICY "lancamentos_policy" ON lancamentos_financeiros 
  FOR ALL USING (
    created_by = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'ADM_MASTER'
  );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trg_update_clientes 
  BEFORE UPDATE ON clientes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_update_orcamentos 
  BEFORE UPDATE ON orcamentos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to auto-approve workflow
CREATE OR REPLACE FUNCTION public.trigger_aprovar_orcamento()
RETURNS TRIGGER AS $$
DECLARE
  venda_id_var UUID;
BEGIN
  IF NEW.status = 'aprovado' AND OLD.status != 'aprovado' THEN
    -- Criar Venda
    INSERT INTO vendas (orcamento_id, valor_total, created_by)
    VALUES (NEW.id, NEW.valor_total, NEW.created_by)
    RETURNING id INTO venda_id_var;

    -- Criar Lançamento Financeiro (entrada)
    INSERT INTO lancamentos_financeiros (venda_id, tipo, valor, descricao, created_by)
    VALUES (
      venda_id_var,
      'entrada',
      NEW.valor_total,
      'Entrada de venda do orçamento #' || NEW.id,
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for approval workflow
CREATE TRIGGER trg_aprovar_orcamento
  AFTER UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION trigger_aprovar_orcamento();

-- Enable realtime for all tables
ALTER TABLE usuarios REPLICA IDENTITY FULL;
ALTER TABLE clientes REPLICA IDENTITY FULL;
ALTER TABLE orcamentos REPLICA IDENTITY FULL;
ALTER TABLE itens_orcamento REPLICA IDENTITY FULL;
ALTER TABLE vendas REPLICA IDENTITY FULL;
ALTER TABLE lancamentos_financeiros REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE usuarios, clientes, orcamentos, itens_orcamento, vendas, lancamentos_financeiros;