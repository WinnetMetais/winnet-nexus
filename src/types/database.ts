// Database interfaces that match the Supabase schema

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string; // Will be 'ADM_MASTER' | 'VENDEDOR' | 'SUPORTE' from database
  ativo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  created_at: string;
  updated_at: string;
}

export interface Orcamento {
  id: string;
  cliente_id: string;
  valor_total: number;
  status: string; // Will be 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado' from database
  data_vencimento: string;
  observacoes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  cliente?: Cliente;
  itens?: ItemOrcamento[];
  creator?: Usuario;
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

export interface Venda {
  id: string;
  orcamento_id: string;
  data_venda: string;
  valor_total: number;
  forma_pagamento: string;
  status: string; // Will be 'pendente' | 'confirmada' | 'cancelada' from database
  created_by: string;
  created_at: string;
  // Relations
  orcamento?: Orcamento;
  creator?: Usuario;
}

export interface LancamentoFinanceiro {
  id: string;
  venda_id: string;
  tipo: string; // Will be 'entrada' | 'saida' from database
  valor: number;
  data_lancamento: string;
  descricao: string;
  categoria: string;
  status: string; // Will be 'pendente' | 'confirmado' | 'cancelado' from database
  created_by: string;
  created_at: string;
  // Relations
  venda?: Venda;
  creator?: Usuario;
}

// Form interfaces for creating/updating
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

export interface CreateCliente {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
}

export interface CreateUsuario {
  nome: string;
  email: string;
  role?: 'ADM_MASTER' | 'VENDEDOR' | 'SUPORTE';
}