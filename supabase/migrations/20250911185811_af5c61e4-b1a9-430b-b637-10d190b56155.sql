-- Inserir dados sem a coluna total (é calculada automaticamente)
INSERT INTO orcamentos (id, cliente_id, valor_total, status, data_vencimento, observacoes, created_by) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 5000.00, 'enviado', '2025-12-31', 'Orçamento para sistema CRM', '7f51fb62-3886-4752-8b35-a20adf8b8416'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 8000.00, 'aprovado', '2025-11-30', 'Orçamento para website', '7f51fb62-3886-4752-8b35-a20adf8b8416')
ON CONFLICT (id) DO NOTHING;

-- Inserir itens de orçamento (sem coluna total)
INSERT INTO itens_orcamento (orcamento_id, descricao, quantidade, valor_unitario) VALUES 
('33333333-3333-3333-3333-333333333333', 'Desenvolvimento CRM', 1, 5000.00),
('44444444-4444-4444-4444-444444444444', 'Website Responsivo', 1, 8000.00)
ON CONFLICT (id) DO NOTHING;

-- Inserir vendas
INSERT INTO vendas (id, orcamento_id, valor_total, status, created_by) VALUES 
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 8000.00, 'confirmada', '7f51fb62-3886-4752-8b35-a20adf8b8416')
ON CONFLICT (id) DO NOTHING;