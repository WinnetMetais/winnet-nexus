import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Cliente, 
  Orcamento, 
  Venda, 
  LancamentoFinanceiro, 
  Usuario,
  CreateCliente,
  CreateOrcamento 
} from '@/types/database';

export const useSupabaseData = (userId?: string) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchAllData();
      setupRealtimeSubscriptions();
    }
  }, [userId]);

  const fetchAllData = async () => {
    try {
      const [clientesRes, orcamentosRes, vendasRes, lancamentosRes, usuariosRes] = await Promise.all([
        supabase.from('clientes').select('*').order('created_at', { ascending: false }),
        supabase.from('orcamentos').select(`
          *,
          cliente:clientes(*),
          creator:usuarios(*)
        `).order('created_at', { ascending: false }),
        supabase.from('vendas').select(`
          *,
          orcamento:orcamentos(*),
          creator:usuarios(*)
        `).order('created_at', { ascending: false }),
        supabase.from('lancamentos_financeiros').select(`
          *,
          venda:vendas(*),
          creator:usuarios(*)
        `).order('created_at', { ascending: false }),
        supabase.from('usuarios').select('*').order('created_at', { ascending: false }),
      ]);

      if (clientesRes.data) setClientes(clientesRes.data);
      if (orcamentosRes.data) setOrcamentos(orcamentosRes.data);
      if (vendasRes.data) setVendas(vendasRes.data);
      if (lancamentosRes.data) setLancamentos(lancamentosRes.data);
      if (usuariosRes.data) setUsuarios(usuariosRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channels = [
      supabase
        .channel('clientes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
          fetchClientes();
        })
        .subscribe(),

      supabase
        .channel('orcamentos-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orcamentos' }, () => {
          fetchOrcamentos();
        })
        .subscribe(),

      supabase
        .channel('vendas-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, () => {
          fetchVendas();
        })
        .subscribe(),

      supabase
        .channel('lancamentos-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lancamentos_financeiros' }, () => {
          fetchLancamentos();
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  };

  const fetchClientes = async () => {
    const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
    if (data) setClientes(data);
  };

  const fetchOrcamentos = async () => {
    const { data } = await supabase.from('orcamentos').select(`
      *,
      cliente:clientes(*),
      creator:usuarios(*)
    `).order('created_at', { ascending: false });
    if (data) setOrcamentos(data);
  };

  const fetchVendas = async () => {
    const { data } = await supabase.from('vendas').select(`
      *,
      orcamento:orcamentos(*),
      creator:usuarios(*)
    `).order('created_at', { ascending: false });
    if (data) setVendas(data);
  };

  const fetchLancamentos = async () => {
    const { data } = await supabase.from('lancamentos_financeiros').select(`
      *,
      venda:vendas(*),
      creator:usuarios(*)
    `).order('created_at', { ascending: false });
    if (data) setLancamentos(data);
  };

  // CRUD operations
  const createCliente = async (cliente: CreateCliente) => {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select();
    return { data, error };
  };

  const createOrcamento = async (orcamento: CreateOrcamento) => {
    const { data: orcamentoData, error: orcamentoError } = await supabase
      .from('orcamentos')
      .insert([{
        cliente_id: orcamento.cliente_id,
        valor_total: orcamento.valor_total,
        data_vencimento: orcamento.data_vencimento,
        observacoes: orcamento.observacoes,
        created_by: userId,
      }])
      .select()
      .single();

    if (orcamentoError || !orcamentoData) {
      return { data: null, error: orcamentoError };
    }

    // Create items
    const itemsData = orcamento.itens.map(item => ({
      orcamento_id: orcamentoData.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from('itens_orcamento')
      .insert(itemsData);

    return { data: orcamentoData, error: itemsError };
  };

  const updateOrcamento = async (id: string, updates: Partial<Orcamento>) => {
    const { data, error } = await supabase
      .from('orcamentos')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  };

  const deleteOrcamento = async (id: string) => {
    const { error } = await supabase
      .from('orcamentos')
      .delete()
      .eq('id', id);
    return { error };
  };

  return {
    clientes,
    orcamentos,
    vendas,
    lancamentos,
    usuarios,
    loading,
    createCliente,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    refetch: fetchAllData,
  };
};