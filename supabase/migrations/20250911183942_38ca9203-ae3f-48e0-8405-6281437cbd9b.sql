-- Remover constraint problemática e recriar corretamente
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_status_chk;

-- Criar constraint correta para status 
ALTER TABLE clientes ADD CONSTRAINT clientes_status_chk 
CHECK (status IN ('Ativo', 'Inativo', 'Prospecto', 'Cliente'));

-- Agora inserir dados de teste
INSERT INTO usuarios (id, nome, email, role, ativo) VALUES 
('7f51fb62-3886-4752-8b35-a20adf8b8416', 'Administrador Master', 'diretoria@winnet.com.br', 'ADM_MASTER', true)
ON CONFLICT (id) DO NOTHING;

-- Inserir clientes
INSERT INTO clientes (id, nome, email, telefone, empresa, endereco, cidade, estado, cep, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'João Silva', 'joao@empresa.com', '(11) 99999-9999', 'Empresa ABC', 'Rua A, 123', 'São Paulo', 'SP', '01234-567', 'Ativo'),
('22222222-2222-2222-2222-222222222222', 'Maria Santos', 'maria@empresa.com', '(11) 88888-8888', 'Empresa XYZ', 'Rua B, 456', 'Rio de Janeiro', 'RJ', '12345-678', 'Ativo');