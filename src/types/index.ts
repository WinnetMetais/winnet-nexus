// Core CRM Types
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  origem_lead?: string;
  status?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemOrcamento {
  id: string;
  orcamento_id: string;
  codigo?: string;
  descricao: string;
  quantidade: number;
  unidade?: string;
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
  numero_orcamento?: string;
  solicitado_por?: string;
  desconto_percentual?: number;
  subtotal?: number;
  forma_pagamento?: string;
  prazo_entrega?: string;
  garantia?: string;
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

export interface Pagamento {
  id: string;
  venda_id: string;
  valor_pago: number;
  data_pagamento: string;
  metodo: string;
  status: string;
  parcela_num: number;
  total_parcelas: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  vendas?: Venda;
  creator?: Usuario;
}

// Financial view interfaces matching database views
export interface FluxoCaixa {
  mes: string;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
}

export interface PendentesFinanceiros {
  venda_id: string;
  valor_total: number;
  venda_status: string;
  pagamento_status: string;
  forma_pagamento: string;
  data_pagamento: string;
  lancamento_status: string;
  numero_orcamento: string;
  cliente_nome: string;
  data_venda: string;
  data_vencimento?: string;
}

export interface KPIsFinanceiros {
  entradas_mes_atual: number;
  saidas_mes_atual: number;
  vendas_pendentes: number;
  pagamentos_pendentes: number;
  total_entradas: number;
  total_saidas: number;
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
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  origem_lead?: string;
  status?: string;
  observacoes?: string;
}

export interface CreateOrcamento {
  cliente_id: string;
  valor_total: number;
  data_vencimento: string;
  observacoes?: string;
  numero_orcamento?: string;
  solicitado_por?: string;
  desconto_percentual?: number;
  subtotal?: number;
  forma_pagamento?: string;
  prazo_entrega?: string;
  garantia?: string;
  itens: {
    codigo?: string;
    descricao: string;
    quantidade: number;
    unidade?: string;
    valor_unitario: number;
  }[];
}

export interface CreateUsuario {
  nome: string;
  email: string;
  role?: string;
}