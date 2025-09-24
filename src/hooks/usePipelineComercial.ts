import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface PipelineStage {
  id: string;
  nome: string;
  ordem: number;
  cor: string;
  orcamentos: PipelineOrcamento[];
}

interface PipelineOrcamento {
  id: string;
  numero_orcamento: string;
  cliente_nome: string;
  valor_total: number;
  data_criacao: string;
  data_vencimento: string;
  status: string;
  probabilidade: number;
  dias_no_stage: number;
  proximo_contato: string | null;
  observacoes: string | null;
}

interface PipelineMetrics {
  total_oportunidades: number;
  valor_total_pipeline: number;
  taxa_conversao: number;
  tempo_medio_ciclo: number;
  valor_medio_negocio: number;
}

export const usePipelineComercial = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    total_oportunidades: 0,
    valor_total_pipeline: 0,
    taxa_conversao: 0,
    tempo_medio_ciclo: 0,
    valor_medio_negocio: 0
  });
  const [loading, setLoading] = useState(true);

  // Definir stages padrão do pipeline
  const defaultStages = [
    { id: 'lead', nome: 'Lead', ordem: 1, cor: '#94a3b8' },
    { id: 'qualificacao', nome: 'Qualificação', ordem: 2, cor: '#60a5fa' },
    { id: 'proposta', nome: 'Proposta', ordem: 3, cor: '#34d399' },
    { id: 'negociacao', nome: 'Negociação', ordem: 4, cor: '#fbbf24' },
    { id: 'fechado', nome: 'Fechado', ordem: 5, cor: '#10b981' },
    { id: 'perdido', nome: 'Perdido', ordem: 6, cor: '#ef4444' }
  ];

  useEffect(() => {
    if (user) {
      loadPipelineData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOrcamentos(),
        calculateMetrics()
      ]);
    } catch (error) {
      console.error('Erro ao carregar pipeline:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do pipeline',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrcamentos = async () => {
    const { data: orcamentos } = await supabase
      .from('orcamentos')
      .select(`
        *,
        cliente:clientes(nome),
        itens:itens_orcamento(*)
      `)
      .order('created_at', { ascending: false });

    if (orcamentos) {
      const stagesWithOrcamentos = defaultStages.map(stage => ({
        ...stage,
        orcamentos: orcamentos
          .filter(orc => mapStatusToStage(orc.status) === stage.id)
          .map(orc => ({
            id: orc.id,
            numero_orcamento: orc.numero_orcamento || `#${orc.id.slice(-6)}`,
            cliente_nome: orc.cliente?.nome || 'Cliente não identificado',
            valor_total: Number(orc.valor_total),
            data_criacao: orc.created_at,
            data_vencimento: orc.data_vencimento,
            status: orc.status,
            probabilidade: calculateProbability(orc.status, orc.data_vencimento),
            dias_no_stage: calculateDaysInStage(orc.updated_at),
            proximo_contato: null,
            observacoes: orc.observacoes
          }))
      }));

      setStages(stagesWithOrcamentos);
    }
  };

  const mapStatusToStage = (status: string): string => {
    switch (status) {
      case 'rascunho': return 'lead';
      case 'enviado': return 'proposta';
      case 'aprovado': return 'fechado';
      case 'rejeitado': return 'perdido';
      default: return 'qualificacao';
    }
  };

  const calculateProbability = (status: string, dataVencimento: string): number => {
    const baseProb = {
      'rascunho': 10,
      'enviado': 40,
      'aprovado': 100,
      'rejeitado': 0
    }[status] || 25;

    // Reduzir probabilidade se próximo do vencimento
    const diasParaVencimento = Math.ceil(
      (new Date(dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasParaVencimento < 0) return Math.max(0, baseProb - 50); // Vencido
    if (diasParaVencimento < 7) return Math.max(0, baseProb - 20); // Próximo ao vencimento
    
    return baseProb;
  };

  const calculateDaysInStage = (updatedAt: string): number => {
    return Math.ceil(
      (new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const calculateMetrics = async () => {
    try {
      // Buscar dados dos últimos 12 meses para métricas
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - 12);

      const { data: orcamentosHistorico } = await supabase
        .from('orcamentos')
        .select('*')
        .gte('created_at', dataLimite.toISOString());

      const { data: vendasHistorico } = await supabase
        .from('vendas')
        .select('*')
        .gte('created_at', dataLimite.toISOString());

      if (orcamentosHistorico && vendasHistorico) {
        const totalOportunidades = stages.reduce((total, stage) => 
          total + stage.orcamentos.length, 0
        );

        const valorTotalPipeline = stages.reduce((total, stage) =>
          total + stage.orcamentos.reduce((stageTotal, orc) => 
            stageTotal + orc.valor_total, 0
          ), 0
        );

        const orcamentosCriados = orcamentosHistorico.length;
        const vendasFechadas = vendasHistorico.filter(v => v.status === 'confirmada').length;
        const taxaConversao = orcamentosCriados > 0 ? (vendasFechadas / orcamentosCriados) * 100 : 0;

        const valorMedioNegocio = totalOportunidades > 0 ? valorTotalPipeline / totalOportunidades : 0;

        // Calcular tempo médio de ciclo (simplificado)
        const ciclosMedios = vendasHistorico
          .filter(v => v.status === 'confirmada')
          .map(v => {
            const orcamento = orcamentosHistorico.find(o => o.id === v.orcamento_id);
            if (orcamento) {
              return Math.ceil(
                (new Date(v.data_venda).getTime() - new Date(orcamento.created_at).getTime()) 
                / (1000 * 60 * 60 * 24)
              );
            }
            return 0;
          })
          .filter(ciclo => ciclo > 0);

        const tempoMedioCiclo = ciclosMedios.length > 0 
          ? ciclosMedios.reduce((a, b) => a + b, 0) / ciclosMedios.length 
          : 0;

        setMetrics({
          total_oportunidades: totalOportunidades,
          valor_total_pipeline: valorTotalPipeline,
          taxa_conversao: taxaConversao,
          tempo_medio_ciclo: tempoMedioCiclo,
          valor_medio_negocio: valorMedioNegocio
        });
      }
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
    }
  };

  const moveOrcamento = async (orcamentoId: string, targetStageId: string) => {
    try {
      // Mapear stage para status do banco
      const newStatus = mapStageToStatus(targetStageId);
      
      const { error } = await supabase
        .from('orcamentos')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orcamentoId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Orçamento movido no pipeline'
      });

      // Recarregar dados
      await loadPipelineData();
    } catch (error) {
      console.error('Erro ao mover orçamento:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao mover orçamento no pipeline',
        variant: 'destructive'
      });
    }
  };

  const mapStageToStatus = (stageId: string): string => {
    switch (stageId) {
      case 'lead': return 'rascunho';
      case 'qualificacao': return 'rascunho';
      case 'proposta': return 'enviado';
      case 'negociacao': return 'enviado';
      case 'fechado': return 'aprovado';
      case 'perdido': return 'rejeitado';
      default: return 'rascunho';
    }
  };

  const adicionarFollowUp = async (orcamentoId: string, data: string, observacao: string) => {
    try {
      // Adicionar follow-up como observação no orçamento
      const { error } = await supabase
        .from('orcamentos')
        .update({ 
          observacoes: observacao,
          updated_at: new Date().toISOString()
        })
        .eq('id', orcamentoId);

      if (error) throw error;

      // Criar notificação para o follow-up
      await supabase
        .from('notificacoes')
        .insert({
          user_id: user?.id,
          mensagem: `Follow-up agendado para ${data}: ${observacao}`
        });

      toast({
        title: 'Sucesso',
        description: 'Follow-up adicionado com sucesso'
      });

      await loadPipelineData();
    } catch (error) {
      console.error('Erro ao adicionar follow-up:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar follow-up',
        variant: 'destructive'
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('pipeline-comercial')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orcamentos' },
        () => {
          loadPipelineData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendas' },
        () => {
          calculateMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    stages,
    metrics,
    loading,
    moveOrcamento,
    adicionarFollowUp,
    refetch: loadPipelineData
  };
};