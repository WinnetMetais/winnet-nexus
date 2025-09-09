// Core CRM Types
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemOrcamento {
  id: string;
  orcamento_id: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  total: number;
  created_at: string;
}

export interface Orcamento {
  id: string;
  cliente_id: string;
  valor_total: number;
  status: string;
  data_vencimento: string;
  observacoes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  clientes?: Cliente;
  itens_orcamento?: ItemOrcamento[];
  creator?: Usuario;
}

export interface Venda {
  id: string;
  orcamento_id: string;
  data_venda: string;
  valor_total: number;
  forma_pagamento: string;
  status: string;
  created_by: string;
  created_at: string;
  // Relations
  orcamentos?: Orcamento;
  creator?: Usuario;
}

export interface LancamentoFinanceiro {
  id: string;
  venda_id: string;
  tipo: string;
  valor: number;
  data_lancamento: string;
  descricao: string;
  categoria: string;
  status: string;
  created_by: string;
  created_at: string;
  // Relations
  vendas?: Venda;
  creator?: Usuario;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  created_at: string;
}

// Form types
export interface CreateCliente {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
}

export interface CreateOrcamento {
  cliente_id: string;
  valor_total: number;
  data_vencimento: string;
  observacoes?: string;
  itens: {
    descricao: string;
    quantidade: number;
    valor_unitario: number;
  }[];
}

export interface CreateUsuario {
  nome: string;
  email: string;
  role?: string;
}