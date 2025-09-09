-- Add new columns to orcamentos table
ALTER TABLE orcamentos 
ADD COLUMN IF NOT EXISTS numero_orcamento TEXT,
ADD COLUMN IF NOT EXISTS solicitado_por TEXT,
ADD COLUMN IF NOT EXISTS desconto_percentual NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
ADD COLUMN IF NOT EXISTS prazo_entrega TEXT,
ADD COLUMN IF NOT EXISTS garantia TEXT;

-- Add new columns to itens_orcamento table
ALTER TABLE itens_orcamento
ADD COLUMN IF NOT EXISTS codigo TEXT,
ADD COLUMN IF NOT EXISTS unidade TEXT DEFAULT 'UN';