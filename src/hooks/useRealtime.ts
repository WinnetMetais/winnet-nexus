import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onError?: (error: any) => void;
}

export const useRealtime = ({
  table,
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onError,
}: UseRealtimeOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create unique channel name
    const channelName = `realtime-${table}-${Date.now()}`;
    
    // Create channel
    channelRef.current = supabase.channel(channelName);

    // Configure event listeners
    if (onInsert) {
      channelRef.current.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema,
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          try {
            onInsert(payload);
          } catch (error) {
            console.error(`Error handling INSERT for ${table}:`, error);
            onError?.(error);
          }
        }
      );
    }

    if (onUpdate) {
      channelRef.current.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema,
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          try {
            onUpdate(payload);
          } catch (error) {
            console.error(`Error handling UPDATE for ${table}:`, error);
            onError?.(error);
          }
        }
      );
    }

    if (onDelete) {
      channelRef.current.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema,
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          try {
            onDelete(payload);
          } catch (error) {
            console.error(`Error handling DELETE for ${table}:`, error);
            onError?.(error);
          }
        }
      );
    }

    // Subscribe to channel
    channelRef.current.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to ${table} realtime updates`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Failed to subscribe to ${table} realtime updates`);
        toast({
          title: 'Erro de Conexão',
          description: `Falha ao conectar atualizações em tempo real para ${table}`,
          variant: 'destructive',
        });
        onError?.(new Error(`Channel error for ${table}`));
      } else if (status === 'TIMED_OUT') {
        console.warn(`⏰ Timeout subscribing to ${table} realtime updates`);
        onError?.(new Error(`Timeout for ${table}`));
      }
    });

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log(`🔌 Unsubscribed from ${table} realtime updates`);
      }
    };
  }, [table, schema, filter, onInsert, onUpdate, onDelete, onError, toast]);

  // Return channel reference for manual operations if needed
  return {
    channel: channelRef.current,
    isConnected: channelRef.current?.state === 'joined',
  };
};

// Hook específico para Vendas com realtime
export const useVendasRealtime = (
  onVendaCreated?: (venda: any) => void,
  onVendaUpdated?: (venda: any) => void,
  onVendaDeleted?: (vendaId: string) => void
) => {
  const { toast } = useToast();

  return useRealtime({
    table: 'vendas',
    onInsert: (payload) => {
      toast({
        title: 'Nova Venda',
        description: `Venda de R$ ${payload.new.valor_total} criada!`,
      });
      onVendaCreated?.(payload.new);
    },
    onUpdate: (payload) => {
      const statusChanged = payload.old.status !== payload.new.status;
      if (statusChanged) {
        let title = 'Venda Atualizada';
        let description = '';
        
        switch (payload.new.status) {
          case 'confirmada':
            title = 'Venda Confirmada';
            description = `Venda de R$ ${payload.new.valor_total} foi confirmada!`;
            break;
          case 'cancelada':
            title = 'Venda Cancelada';
            description = `Venda de R$ ${payload.new.valor_total} foi cancelada.`;
            break;
          default:
            description = `Status da venda alterado para: ${payload.new.status}`;
        }
        
        toast({ title, description });
      }
      onVendaUpdated?.(payload.new);
    },
    onDelete: (payload) => {
      toast({
        title: 'Venda Removida',
        description: 'Uma venda foi removida do sistema.',
        variant: 'destructive',
      });
      onVendaDeleted?.(payload.old.id);
    },
  });
};

// Hook específico para Orçamentos com realtime
export const useOrcamentosRealtime = (
  onOrcamentoCreated?: (orcamento: any) => void,
  onOrcamentoUpdated?: (orcamento: any) => void,
  onOrcamentoDeleted?: (orcamentoId: string) => void
) => {
  const { toast } = useToast();

  return useRealtime({
    table: 'orcamentos',
    onInsert: (payload) => {
      toast({
        title: 'Novo Orçamento',
        description: `Orçamento de R$ ${payload.new.valor_total} criado!`,
      });
      onOrcamentoCreated?.(payload.new);
    },
    onUpdate: (payload) => {
      const statusChanged = payload.old.status !== payload.new.status;
      if (statusChanged) {
        let title = 'Orçamento Atualizado';
        let description = '';
        
        switch (payload.new.status) {
          case 'aprovado':
            title = 'Orçamento Aprovado';
            description = `Orçamento de R$ ${payload.new.valor_total} foi aprovado! Venda criada automaticamente.`;
            break;
          case 'rejeitado':
            title = 'Orçamento Rejeitado';
            description = `Orçamento de R$ ${payload.new.valor_total} foi rejeitado.`;
            break;
          case 'enviado':
            title = 'Orçamento Enviado';
            description = `Orçamento de R$ ${payload.new.valor_total} foi enviado ao cliente.`;
            break;
          default:
            description = `Status do orçamento alterado para: ${payload.new.status}`;
        }
        
        toast({ 
          title, 
          description,
          variant: payload.new.status === 'rejeitado' ? 'destructive' : 'default'
        });
      }
      onOrcamentoUpdated?.(payload.new);
    },
    onDelete: (payload) => {
      toast({
        title: 'Orçamento Removido',
        description: 'Um orçamento foi removido do sistema.',
        variant: 'destructive',
      });
      onOrcamentoDeleted?.(payload.old.id);
    },
  });
};

// Hook específico para Financeiro com realtime
export const useFinanceiroRealtime = (
  onFinanceiroUpdated?: () => void,
  onPagamentoRecebido?: (pagamento: any) => void
) => {
  const { toast } = useToast();

  // Listen to multiple tables for financial updates
  const lancamentosRealtime = useRealtime({
    table: 'lancamentos_financeiros',
    onInsert: (payload) => {
      if (payload.new.tipo === 'entrada') {
        toast({
          title: 'Nova Entrada',
          description: `Entrada de R$ ${payload.new.valor} registrada!`,
        });
      } else if (payload.new.tipo === 'saida' && payload.new.valor > 1000) {
        toast({
          title: 'Saída Significativa',
          description: `Saída de R$ ${payload.new.valor} registrada.`,
          variant: 'destructive',
        });
      }
      onFinanceiroUpdated?.();
    },
    onUpdate: (payload) => {
      if (payload.old.status !== payload.new.status && payload.new.status === 'confirmado') {
        toast({
          title: 'Lançamento Confirmado',
          description: `${payload.new.tipo === 'entrada' ? 'Entrada' : 'Saída'} de R$ ${payload.new.valor} confirmada.`,
        });
      }
      onFinanceiroUpdated?.();
    },
  });

  const pagamentosRealtime = useRealtime({
    table: 'pagamentos',
    onInsert: (payload) => {
      toast({
        title: 'Novo Pagamento',
        description: `Pagamento de R$ ${payload.new.valor_pago} registrado!`,
      });
      onPagamentoRecebido?.(payload.new);
      onFinanceiroUpdated?.();
    },
    onUpdate: (payload) => {
      if (payload.old.status !== payload.new.status && payload.new.status === 'confirmado') {
        toast({
          title: 'Pagamento Confirmado',
          description: `Pagamento de R$ ${payload.new.valor_pago} confirmado!`,
        });
        onPagamentoRecebido?.(payload.new);
      }
      onFinanceiroUpdated?.();
    },
  });

  return {
    lancamentosChannel: lancamentosRealtime.channel,
    pagamentosChannel: pagamentosRealtime.channel,
    isConnected: lancamentosRealtime.isConnected && pagamentosRealtime.isConnected,
  };
};

// Hook para presença de usuários online
export const useUserPresence = (roomId: string = 'crm-main') => {
  const { user } = { user: null }; // Replace with actual auth hook
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(roomId);
    channelRef.current = channel;

    const userStatus = {
      user_id: user.id,
      online_at: new Date().toISOString(),
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Online users:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userStatus);
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, roomId]);

  return {
    channel: channelRef.current,
    isConnected: channelRef.current?.state === 'joined',
  };
};