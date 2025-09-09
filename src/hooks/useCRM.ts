import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { 
  Cliente, 
  Orcamento, 
  Venda, 
  LancamentoFinanceiro, 
  Usuario,
  CreateCliente,
  CreateOrcamento 
} from '@/types';

// Auth Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile data
          setTimeout(async () => {
            try {
              const { data: userData } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              setUsuario(userData);
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }, 0);
        } else {
          setUsuario(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description: error.message,
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { nome }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Cadastro realizado!',
        description: 'Verifique seu email para confirmar a conta.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Até logo!',
        description: 'Logout realizado com sucesso.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: error.message,
      });
      return { error };
    }
  };

  return {
    user,
    session,
    usuario,
    loading,
    signIn,
    signUp,
    signOut,
  };
};

// Hook para Clientes (CRUD + Realtime)
export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch inicial
    const fetchClientes = async () => {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setClientes(data || []);
      } catch (error: any) {
        console.error('Error fetching clientes:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao carregar clientes.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientes();

    // Realtime: Inserts/Updates/Deletes
    const channel = supabase
      .channel('clientes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clientes' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClientes(prev => [payload.new as Cliente, ...prev]);
            toast({
              title: 'Novo cliente',
              description: `Cliente ${(payload.new as Cliente).nome} foi adicionado.`,
            });
          }
          if (payload.eventType === 'UPDATE') {
            setClientes(prev => prev.map(c => 
              c.id === payload.new.id ? payload.new as Cliente : c
            ));
          }
          if (payload.eventType === 'DELETE') {
            setClientes(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  const adicionarCliente = async (cliente: CreateCliente) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Cliente adicionado com sucesso!',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding cliente:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao adicionar cliente.',
      });
      return null;
    }
  };

  const atualizarCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso!',
      });
    } catch (error: any) {
      console.error('Error updating cliente:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar cliente.',
      });
    }
  };

  const deletarCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Cliente removido com sucesso!',
      });
    } catch (error: any) {
      console.error('Error deleting cliente:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao remover cliente.',
      });
    }
  };

  return { clientes, loading, adicionarCliente, atualizarCliente, deletarCliente };
};

// Hook para Orçamentos (com join para cliente e itens)
export const useOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchOrcamentos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          clientes(nome, email),
          itens_orcamento(descricao, quantidade, valor_unitario, total)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrcamentos(data || []);
    } catch (error: any) {
      console.error('Error fetching orcamentos:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar orçamentos.',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchOrcamentos();
    setLoading(false);

    const channel = supabase
      .channel('orcamentos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orcamentos' }, 
        (payload) => {
          fetchOrcamentos(); // Refetch para joins complexos
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'aprovado') {
            toast({
              title: '🎉 Orçamento Aprovado!',
              description: 'Venda e lançamento financeiro foram criados automaticamente.',
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrcamentos, toast]);

  const aprovarOrcamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'aprovado' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Processando aprovação...',
        description: 'O sistema criará automaticamente a venda e lançamento financeiro.',
      });
    } catch (error: any) {
      console.error('Error approving orcamento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao aprovar orçamento.',
      });
    }
  };

  const adicionarOrcamento = async (orcamento: CreateOrcamento) => {
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Usuário não autenticado.',
      });
      return null;
    }

    try {
      const { data: orcamentoData, error: orcamentoError } = await supabase
        .from('orcamentos')
        .insert([{
          cliente_id: orcamento.cliente_id,
          valor_total: orcamento.valor_total,
          data_vencimento: orcamento.data_vencimento,
          observacoes: orcamento.observacoes,
          created_by: user.id,
        }])
        .select()
        .single();

      if (orcamentoError) throw orcamentoError;

      // Create items
      const itemsData = orcamento.itens.map(item => ({
        orcamento_id: orcamentoData.id,
        ...item,
      }));

      const { error: itemsError } = await supabase
        .from('itens_orcamento')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      toast({
        title: 'Sucesso',
        description: 'Orçamento criado com sucesso!',
      });

      return orcamentoData;
    } catch (error: any) {
      console.error('Error creating orcamento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao criar orçamento.',
      });
      return null;
    }
  };

  return { orcamentos, loading, aprovarOrcamento, adicionarOrcamento };
};

// Hook para Vendas
export const useVendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const { data, error } = await supabase
          .from('vendas')
          .select(`
            *,
            orcamentos(valor_total),
            usuarios(nome)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setVendas(data || []);
      } catch (error: any) {
        console.error('Error fetching vendas:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao carregar vendas.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendas();

    const channel = supabase
      .channel('vendas-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vendas' }, 
        () => {
          fetchVendas(); // Refetch for joins
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  return { vendas, loading };
};

// Hook para Lançamentos Financeiros
export const useLancamentosFinanceiros = () => {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLancamentos = async () => {
      try {
        const { data, error } = await supabase
          .from('lancamentos_financeiros')
          .select(`
            *,
            vendas(valor_total),
            usuarios(nome)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLancamentos(data || []);
      } catch (error: any) {
        console.error('Error fetching lancamentos:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao carregar lançamentos financeiros.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLancamentos();

    const channel = supabase
      .channel('lancamentos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos_financeiros' }, 
        () => {
          fetchLancamentos();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  return { lancamentos, loading };
};

// Hook para Usuários
export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { usuario: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUsuarios(data || []);
      } catch (error: any) {
        console.error('Error fetching usuarios:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao carregar usuários.',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsuarios();

    const channel = supabase
      .channel('usuarios-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'usuarios' }, 
        () => {
          fetchUsuarios();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [toast]);

  const toggleAtivo = async (id: string) => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('ativo')
        .eq('id', id)
        .maybeSingle();
      
      const novoAtivo = !data?.ativo;
      
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: novoAtivo })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: `Usuário ${novoAtivo ? 'ativado' : 'desativado'} com sucesso!`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao alterar status do usuário.',
      });
    }
  };

  const atualizarUsuario = async (id: string, updates: Partial<Usuario>) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso!',
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar usuário.',
      });
    }
  };

  const canManageUsers = currentUser?.role === 'ADM_MASTER';

  return { 
    usuarios, 
    loading, 
    toggleAtivo: canManageUsers ? toggleAtivo : undefined,
    atualizarUsuario: canManageUsers ? atualizarUsuario : undefined,
    canManageUsers 
  };
};