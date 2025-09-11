-- Criar usuário de teste primeiro (necessário para RLS)
INSERT INTO usuarios (id, nome, email, role, ativo) VALUES 
('7f51fb62-3886-4752-8b35-a20adf8b8416', 'Administrador Master', 'diretoria@winnet.com.br', 'ADM_MASTER', true);

-- Inserir dados de teste para validar integração completa
INSERT INTO clientes (id, nome, email, telefone, empresa, endereco, cidade, estado, cep) VALUES 
('11111111-1111-1111-1111-111111111111', 'João Silva', 'joao@empresa.com', '(11) 99999-9999', 'Empresa ABC', 'Rua A, 123', 'São Paulo', 'SP', '01234-567'),
('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria@empresa.com', '(11) 88888-8888', 'Empresa XYZ', 'Rua B, 456', 'Rio de Janeiro', 'RJ', '12345-678');

-- Inserir orçamentos de teste
INSERT INTO orcamentos (id, cliente_id, valor_total, status, data_vencimento, observacoes, created_by) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 5000.00, 'enviado', '2025-12-31', 'Orçamento para sistema CRM', '7f51fb62-3886-4752-8b35-a20adf8b8416'),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 8000.00, 'aprovado', '2025-11-30', 'Orçamento para website', '7f51fb62-3886-4752-8b35-a20adf8b8416');

-- Inserir itens de orçamento
INSERT INTO itens_orcamento (orcamento_id, descricao, quantidade, valor_unitario, total) VALUES 
('33333333-3333-3333-3333-333333333333', 'Desenvolvimento CRM', 1, 5000.00, 5000.00),
('44444444-4444-4444-4444-444444444444', 'Website Responsivo', 1, 8000.00, 8000.00);