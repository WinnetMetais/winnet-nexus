import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface FluxoCaixaProjection {
  mes: string;
  entrada_projetada: number;
  saida_projetada: number;
  saldo_projetado: number;
  status: 'positivo' | 'negativo' | 'critico';
}

interface ConciliacaoBancaria {
  id: string;
  data: string;
  descricao: string;
  valor_banco: number;
  valor_sistema: number;
  diferenca: number;
  conciliado: boolean;
}

export const useAdvancedFinanceiro = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [projecoes, setProjecoes] = useState<FluxoCaixaProjection[]>([]);
  const [conciliacoes, setConciliacoes] = useState<ConciliacaoBancaria[]>([]);
  const [alertasFluxo, setAlertasFluxo] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAdvancedData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const loadAdvancedData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProjecoes(),
        fetchConciliacoes(),
        checkAlertasFluxo()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados avançados:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados financeiros avançados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjecoes = async () => {
    // Buscar dados históricos e calcular projeções
    const { data: historico } = await supabase
      .from('vw_fluxo_caixa')
      .select('*')
      .order('mes', { ascending: false })
      .limit(12);

    if (historico) {
      const projecoesCalculadas = calculateProjections(historico);
      setProjecoes(projecoesCalculadas);
    }
  };

  const calculateProjections = (historico: any[]): FluxoCaixaProjection[] => {
    const projecoes: FluxoCaixaProjection[] = [];
    
    // Calcular média dos últimos 6 meses
    const ultimosSeisMeses = historico.slice(0, 6);
    const mediaEntradas = ultimosSeisMeses.reduce((acc, mes) => acc + mes.total_entradas, 0) / ultimosSeisMeses.length;
    const mediaSaidas = ultimosSeisMeses.reduce((acc, mes) => acc + mes.total_saidas, 0) / ultimosSeisMeses.length;

    // Projetar próximos 12 meses
    for (let i = 1; i <= 12; i++) {
      const dataProjecao = new Date();
      dataProjecao.setMonth(dataProjecao.getMonth() + i);
      
      // Aplicar sazonalidade (simplificada)
      const fatorSazonalidade = 1 + (Math.sin((dataProjecao.getMonth() + 1) * Math.PI / 6) * 0.1);
      
      const entradaProjetada = mediaEntradas * fatorSazonalidade;
      const saidaProjetada = mediaSaidas * 1.05; // Assumir inflação de 5%
      const saldoProjetado = entradaProjetada - saidaProjetada;

      let status: 'positivo' | 'negativo' | 'critico' = 'positivo';
      if (saldoProjetado < 0) status = 'negativo';
      if (saldoProjetado < -10000) status = 'critico';

      projecoes.push({
        mes: dataProjecao.toISOString().slice(0, 7),
        entrada_projetada: entradaProjetada,
        saida_projetada: saidaProjetada,
        saldo_projetado: saldoProjetado,
        status
      });
    }

    return projecoes;
  };

  const fetchConciliacoes = async () => {
    // Simular dados de conciliação bancária
    const mockConciliacoes: ConciliacaoBancaria[] = [
      {
        id: '1',
        data: '2025-01-22',
        descricao: 'Transferência PIX Cliente A',
        valor_banco: 5000,
        valor_sistema: 5000,
        diferenca: 0,
        conciliado: true
      },
      {
        id: '2',
        data: '2025-01-21',
        descricao: 'Pagamento Fornecedor B',
        valor_banco: -2300,
        valor_sistema: -2500,
        diferenca: 200,
        conciliado: false
      }
    ];
    
    setConciliacoes(mockConciliacoes);
  };

  const checkAlertasFluxo = async () => {
    const alertas: string[] = [];
    
    // Verificar saldo atual
    const { data: kpis } = await supabase
      .from('vw_kpis_financeiros')
      .select('*')
      .single();

    if (kpis) {
      const saldoAtual = kpis.total_entradas - kpis.total_saidas;
      
      if (saldoAtual < 10000) {
        alertas.push('Saldo baixo: Menos de R$ 10.000 em caixa');
      }
      
      if (kpis.pagamentos_pendentes > 5) {
        alertas.push(`${kpis.pagamentos_pendentes} pagamentos pendentes`);
      }
      
      if (kpis.vendas_pendentes > 50000) {
        alertas.push('Alto valor em vendas pendentes de confirmação');
      }
    }

    // Verificar projeções futuras
    const projecoesCriticas = projecoes.filter(p => p.status === 'critico');
    if (projecoesCriticas.length > 0) {
      alertas.push(`${projecoesCriticas.length} meses com projeção crítica`);
    }

    setAlertasFluxo(alertas);
  };

  const conciliarItem = async (itemId: string) => {
    try {
      // Marcar como conciliado
      setConciliacoes(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, conciliado: true } : item
        )
      );

      toast({
        title: 'Sucesso',
        description: 'Item conciliado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao conciliar:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao conciliar item',
        variant: 'destructive'
      });
    }
  };

  const gerarRelatorioMensal = async (mes: string) => {
    try {
      // Buscar dados do mês específico
      const { data: lancamentos } = await supabase
        .from('lancamentos_financeiros')
        .select(`
          *,
          venda:vendas(
            orcamento:orcamentos(
              cliente:clientes(nome)
            )
          )
        `)
        .gte('data_lancamento', `${mes}-01`)
        .lt('data_lancamento', `${mes}-31`)
        .order('data_lancamento');

      if (lancamentos) {
        // Processar dados para relatório
        const relatorio = {
          periodo: mes,
          total_entradas: lancamentos
            .filter(l => l.tipo === 'entrada')
            .reduce((sum, l) => sum + Number(l.valor), 0),
          total_saidas: lancamentos
            .filter(l => l.tipo === 'saida')
            .reduce((sum, l) => sum + Number(l.valor), 0),
          transacoes: lancamentos.length,
          clientes_ativos: new Set(
            lancamentos
              .filter(l => l.venda?.orcamento?.cliente)
              .map(l => l.venda?.orcamento?.cliente?.nome)
          ).size
        };

        return relatorio;
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao gerar relatório mensal',
        variant: 'destructive'
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('advanced-financeiro')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'lancamentos_financeiros' 
        },
        () => {
          // Recarregar dados quando houver mudanças
          fetchProjecoes();
          checkAlertasFluxo();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos' 
        },
        () => {
          checkAlertasFluxo();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    projecoes,
    conciliacoes,
    alertasFluxo,
    loading,
    conciliarItem,
    gerarRelatorioMensal,
    refetch: loadAdvancedData
  };
};