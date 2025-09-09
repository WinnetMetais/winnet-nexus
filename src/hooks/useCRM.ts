import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import type { 
  Cliente, 
  Orcamento, 
  Venda, 
  LancamentoFinanceiro, 
  Usuario,
  CreateCliente,
  CreateOrcamento 
} from '@/types';

// Notification interface
export interface Notificacao {
  id: string;
  user_id: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
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
          data: {
            nome,
          }
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

// Notifications Hook
export const useNotificacoes = (userId?: string) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch initial notifications
    const fetchNotificacoes = async () => {
      try {
        const { data, error } = await supabase
          .from('notificacoes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        
        setNotificacoes(data || []);
        setUnreadCount(data?.filter(n => !n.lida).length || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificacoes();

    // Set up real-time subscription
    const channel = supabase
      .channel('notificacoes-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notificacoes',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          const newNotification = payload.new as Notificacao;
          setNotificacoes(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification using sonner
          toast(newNotification.mensagem, {
            duration: 5000,
          });
        }
      )
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'notificacoes',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notificacao;
          setNotificacoes(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
          if (updatedNotification.lida) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const marcarComoLida = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', userId)
        .eq('lida', false);

      if (error) throw error;
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notificacoes,
    loading,
    unreadCount,
    marcarComoLida,
    marcarTodasComoLidas,
  };
};

// Hook para Clientes
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
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();

    // Real-time subscription
    const channel = supabase
      .channel('clientes-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'clientes' }, 
        (payload) => {
          setClientes(prev => [payload.new as Cliente, ...prev]);
          toast({ title: 'Novo cliente adicionado!' });
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'clientes' }, 
        (payload) => {
          setClientes(prev => prev.map(c => c.id === payload.new.id ? payload.new as Cliente : c));
          toast({ title: 'Cliente atualizado!' });
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'clientes' }, 
        (payload) => {
          setClientes(prev => prev.filter(c => c.id !== payload.old.id));
          toast({ title: 'Cliente removido!' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const adicionarCliente = async (cliente: CreateCliente) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert(cliente)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast({
        title: 'Erro ao adicionar cliente',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const atualizarCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletarCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Erro ao deletar cliente',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { 
    clientes, 
    loading, 
    adicionarCliente, 
    atualizarCliente, 
    deletarCliente 
  };
};

// Hook para Orçamentos
export const useOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrcamentos = async () => {
      try {
        const { data, error } = await supabase
          .from('orcamentos')
          .select(`
            *,
            clientes(nome, email),
            itens_orcamento(id, descricao, quantidade, valor_unitario, total)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrcamentos(data || []);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrcamentos();

    // Set up real-time subscription with enhanced notifications
    const channel = supabase
      .channel('orcamentos-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orcamentos' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchOrcamentos(); // Refetch for joins
            toast({ title: 'Novo orçamento criado!' });
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrcamento = payload.new as Orcamento;
            fetchOrcamentos(); // Refetch for joins
            
            // Show specific toast for status changes
            if (payload.old.status !== updatedOrcamento.status) {
              if (updatedOrcamento.status === 'aprovado') {
                toast({ title: 'Orçamento aprovado! Venda criada automaticamente.' });
              } else if (updatedOrcamento.status === 'rejeitado') {
                toast({ title: 'Orçamento rejeitado.', variant: 'destructive' });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setOrcamentos(prev => prev.filter(o => o.id !== payload.old.id));
            toast({ title: 'Orçamento removido.' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const aprovarOrcamento = async (id: string) => {
    setLoading(true);
    try {
      // Get orcamento details for notification
      const { data: orcamento } = await supabase
        .from('orcamentos')
        .select('*, clientes(nome)')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'aprovado' })
        .eq('id', id);

      if (error) throw error;

      // Call notification edge function
      try {
        await supabase.functions.invoke('notify-orcamento', {
          body: {
            orcamento_id: id,
            status: 'aprovado',
            user_id: orcamento?.created_by,
            cliente_nome: orcamento?.clientes?.nome
          }
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue even if notification fails
      }
      
      toast({
        title: "Orçamento aprovado",
        description: "Venda e lançamento financeiro criados automaticamente.",
      });
    } catch (error: any) {
      console.error('Error approving budget:', error);
      toast({
        title: "Erro ao aprovar orçamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rejeitarOrcamento = async (id: string) => {
    setLoading(true);
    try {
      // Get orcamento details for notification
      const { data: orcamento } = await supabase
        .from('orcamentos')
        .select('*, clientes(nome)')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'rejeitado' })
        .eq('id', id);

      if (error) throw error;

      // Call notification edge function
      try {
        await supabase.functions.invoke('notify-orcamento', {
          body: {
            orcamento_id: id,
            status: 'rejeitado',
            user_id: orcamento?.created_by,
            cliente_nome: orcamento?.clientes?.nome
          }
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue even if notification fails
      }

      toast({
        title: "Orçamento rejeitado",
        description: "O cliente será notificado sobre a decisão.",
      });
    } catch (error: any) {
      console.error('Error rejecting budget:', error);
      toast({
        title: "Erro ao rejeitar orçamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarOrcamento = async (orcamento: CreateOrcamento) => {
    try {
      const { data: orcamentoData, error } = await supabase
        .from('orcamentos')
        .insert({
          cliente_id: orcamento.cliente_id,
          valor_total: orcamento.valor_total,
          subtotal: orcamento.subtotal,
          data_vencimento: orcamento.data_vencimento,
          observacoes: orcamento.observacoes,
          numero_orcamento: orcamento.numero_orcamento,
          solicitado_por: orcamento.solicitado_por,
          desconto_percentual: orcamento.desconto_percentual,
          forma_pagamento: orcamento.forma_pagamento,
          prazo_entrega: orcamento.prazo_entrega,
          garantia: orcamento.garantia,
        })
        .select()
        .single();

      if (error) throw error;

      // Add items
      if (orcamento.itens && orcamento.itens.length > 0) {
        const itens = orcamento.itens.map(item => ({
          orcamento_id: orcamentoData.id,
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade,
          valor_unitario: item.valor_unitario,
          total: item.quantidade * item.valor_unitario,
        }));

        const { error: itensError } = await supabase
          .from('itens_orcamento')
          .insert(itens);

        if (itensError) throw itensError;
      }

      return orcamentoData;
    } catch (error: any) {
      console.error('Error adding budget:', error);
      toast({
        title: 'Erro ao adicionar orçamento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const atualizarOrcamento = async (id: string, updates: Partial<Orcamento>) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      toast({
        title: 'Erro ao atualizar orçamento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletarOrcamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      toast({
        title: 'Erro ao deletar orçamento',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { 
    orcamentos, 
    loading, 
    aprovarOrcamento,
    rejeitarOrcamento,
    adicionarOrcamento,
    atualizarOrcamento,
    deletarOrcamento 
  };
};

// Hook para Vendas
export const useVendas = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const { data, error } = await supabase
          .from('vendas')
          .select(`
            *,
            orcamentos(*, clientes(nome, email))
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVendas(data || []);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendas();

    const channel = supabase
      .channel('vendas-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vendas' }, 
        () => {
          fetchVendas(); // Refetch for joins
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { vendas, loading };
};

// Hook para Lançamentos Financeiros
export const useLancamentosFinanceiros = () => {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLancamentos = async () => {
      try {
        const { data, error } = await supabase
          .from('lancamentos_financeiros')
          .select(`
            *,
            vendas(*, orcamentos(*, clientes(nome)))
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLancamentos(data || []);
      } catch (error) {
        console.error('Error fetching financial entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLancamentos();

    const channel = supabase
      .channel('lancamentos-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lancamentos_financeiros' }, 
        () => {
          fetchLancamentos(); // Refetch for joins
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { lancamentos, loading };
};

// Hook para Usuários
export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsuarios(data || []);

        // Check if current user can manage users
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const currentUser = data?.find(u => u.id === user.id);
          setCanManageUsers(currentUser?.role === 'ADM_MASTER');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();

    const channel = supabase
      .channel('usuarios-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'usuarios' }, 
        () => {
          fetchUsuarios(); // Refetch to update permissions
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleAtivo = async (id: string) => {
    try {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('ativo')
        .eq('id', id)
        .single();

      const novoAtivo = !usuario?.ativo;
      
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: novoAtivo })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: novoAtivo ? 'Usuário ativado' : 'Usuário desativado',
        description: `Status do usuário alterado com sucesso.`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
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
        title: 'Usuário atualizado',
        description: 'Dados do usuário alterados com sucesso.',
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Erro ao atualizar usuário',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return { 
    usuarios, 
    loading, 
    toggleAtivo, 
    atualizarUsuario, 
    canManageUsers 
  };
};