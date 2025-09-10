import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface FluxoCaixa {
  mes: string;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
}

interface PendentesFinanceiros {
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
}

interface KPIsFinanceiros {
  entradas_mes_atual: number;
  saidas_mes_atual: number;
  vendas_pendentes: number;
  pagamentos_pendentes: number;
  total_entradas: number;
  total_saidas: number;
}

interface Pagamento {
  id: string;
  venda_id: string;
  valor_pago: number;
  data_pagamento: string;
  metodo: string;
  status: string;
  parcela_num: number;
  total_parcelas: number;
  created_at: string;
}

export const useFinanceiro = () => {
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixa[]>([]);
  const [pendentes, setPendentes] = useState<PendentesFinanceiros[]>([]);
  const [kpis, setKpis] = useState<KPIsFinanceiros | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchFluxoCaixa = async () => {
    const { data, error } = await supabase
      .from('vw_fluxo_caixa')
      .select('*')
      .limit(12);
    
    if (error) {
      console.error('Erro ao buscar fluxo de caixa:', error);
    } else {
      setFluxoCaixa(data || []);
    }
  };

  const fetchPendentes = async () => {
    const { data, error } = await supabase
      .from('vw_pendentes_financeiros')
      .select('*')
      .limit(50);
    
    if (error) {
      console.error('Erro ao buscar pendentes:', error);
    } else {
      setPendentes(data || []);
    }
  };

  const fetchKpis = async () => {
    const { data, error } = await supabase
      .from('vw_kpis_financeiros')
      .select('*')
      .single();
    
    if (error) {
      console.error('Erro ao buscar KPIs:', error);
    } else {
      setKpis(data);
    }
  };

  const fetchPagamentos = async () => {
    const { data, error } = await supabase
      .from('pagamentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Erro ao buscar pagamentos:', error);
    } else {
      setPagamentos(data || []);
    }
  };

  const confirmarVenda = async (vendaId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('notify-financeiro', {
        body: {
          evento: 'confirmar_venda',
          venda_id: vendaId
        }
      });

      if (error) throw error;

      toast({
        title: 'Venda confirmada',
        description: 'A venda foi confirmada com sucesso.',
      });

      // Recarregar dados
      await Promise.all([fetchPendentes(), fetchKpis(), fetchPagamentos()]);
      
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao confirmar venda.',
        variant: 'destructive',
      });
    }
  };

  const receberPagamento = async (vendaId: string, valor: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('notify-financeiro', {
        body: {
          evento: 'pagamento_confirmado',
          venda_id: vendaId,
          valor: valor,
          user_id: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: 'Pagamento recebido',
        description: `Pagamento de R$ ${valor.toFixed(2)} confirmado.`,
      });

      // Recarregar dados
      await Promise.all([fetchPendentes(), fetchKpis(), fetchPagamentos(), fetchFluxoCaixa()]);
      
    } catch (error) {
      console.error('Erro ao receber pagamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao confirmar pagamento.',
        variant: 'destructive',
      });
    }
  };

  const adicionarSaida = async (dados: {
    valor: number;
    descricao: string;
    categoria: string;
  }) => {
    try {
      const { error } = await supabase
        .from('lancamentos_financeiros')
        .insert({
          tipo: 'saida',
          valor: dados.valor,
          descricao: dados.descricao,
          categoria: dados.categoria,
          status: 'confirmado',
          data_lancamento: new Date().toISOString().split('T')[0],
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: 'Saída adicionada',
        description: 'Lançamento financeiro criado com sucesso.',
      });

      // Recarregar dados
      await Promise.all([fetchKpis(), fetchFluxoCaixa()]);
      
    } catch (error) {
      console.error('Erro ao adicionar saída:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar lançamento.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFluxoCaixa(),
        fetchPendentes(),
        fetchKpis(),
        fetchPagamentos()
      ]);
      setLoading(false);
    };

    loadData();

    // Configurar realtime para atualizações automáticas
    const channel = supabase
      .channel('financeiro-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vendas'
      }, () => {
        fetchPendentes();
        fetchKpis();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pagamentos'
      }, () => {
        fetchPagamentos();
        fetchKpis();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lancamentos_financeiros'
      }, () => {
        fetchFluxoCaixa();
        fetchKpis();
      })
      .subscribe();

    // Escutar notificações do PostgreSQL
    const notificationChannel = supabase
      .channel('financeiro-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notificacoes'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const notification = payload.new as any;
          if (notification.mensagem?.includes('venda') || notification.mensagem?.includes('pagamento')) {
            toast({
              title: 'Atualização financeira',
              description: notification.mensagem,
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(notificationChannel);
    };
  }, [toast]);

  return {
    fluxoCaixa,
    pendentes,
    kpis,
    pagamentos,
    loading,
    confirmarVenda,
    receberPagamento,
    adicionarSaida,
    refetch: async () => {
      await Promise.all([
        fetchFluxoCaixa(),
        fetchPendentes(),
        fetchKpis(),
        fetchPagamentos()
      ]);
    }
  };
};