import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, DollarSign, Clock, Users, TrendingUp, Eye } from 'lucide-react';
import { usePipelineComercial } from '@/hooks/usePipelineComercial';
import { formatCurrency } from '@/lib/utils';

export const PipelineBoard = () => {
  const { stages, metrics, loading, moveOrcamento, adicionarFollowUp } = usePipelineComercial();
  const [selectedOrcamento, setSelectedOrcamento] = useState<string | null>(null);
  const [followUpData, setFollowUpData] = useState('');
  const [followUpObservacao, setFollowUpObservacao] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (orcamentoId: string) => {
    setDraggedItem(orcamentoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedItem) {
      await moveOrcamento(draggedItem, targetStageId);
      setDraggedItem(null);
    }
  };

  const handleFollowUpSubmit = async () => {
    if (selectedOrcamento && followUpData && followUpObservacao) {
      await adicionarFollowUp(selectedOrcamento, followUpData, followUpObservacao);
      setSelectedOrcamento(null);
      setFollowUpData('');
      setFollowUpObservacao('');
    }
  };

  const getProbabilityColor = (probability: number): string => {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-yellow-500';
    if (probability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas do Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
                <p className="text-lg font-semibold">{metrics.total_oportunidades}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Valor Pipeline</p>
                <p className="text-lg font-semibold">{formatCurrency(metrics.valor_total_pipeline)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                <p className="text-lg font-semibold">{metrics.taxa_conversao.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ciclo Médio</p>
                <p className="text-lg font-semibold">{Math.round(metrics.tempo_medio_ciclo)}d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-lg font-semibold">{formatCurrency(metrics.valor_medio_negocio)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Board do Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 min-h-[600px]">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="space-y-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle 
                  className="text-sm font-medium flex items-center justify-between"
                  style={{ color: stage.cor }}
                >
                  {stage.nome}
                  <Badge variant="secondary" className="ml-2">
                    {stage.orcamentos.length}
                  </Badge>
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(
                    stage.orcamentos.reduce((sum, orc) => sum + orc.valor_total, 0)
                  )}
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-2">
              {stage.orcamentos.map((orcamento) => (
                <Card
                  key={orcamento.id}
                  className="cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(orcamento.id)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {orcamento.cliente_nome}
                        </h4>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detalhes da Oportunidade</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Cliente</label>
                                <p className="text-sm text-muted-foreground">{orcamento.cliente_nome}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Valor</label>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(orcamento.valor_total)}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Probabilidade</label>
                                <div className="flex items-center space-x-2">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${getProbabilityColor(orcamento.probabilidade)}`}
                                      style={{ width: `${orcamento.probabilidade}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">{orcamento.probabilidade}%</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Observações</label>
                                <p className="text-sm text-muted-foreground">
                                  {orcamento.observacoes || 'Nenhuma observação'}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {orcamento.numero_orcamento}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(orcamento.valor_total)}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${getProbabilityColor(orcamento.probabilidade)}`}
                          title={`${orcamento.probabilidade}% de probabilidade`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{orcamento.dias_no_stage}d no stage</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => setSelectedOrcamento(orcamento.id)}
                            >
                              Follow-up
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Agendar Follow-up</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Data do Follow-up</label>
                                <Input
                                  type="date"
                                  value={followUpData}
                                  onChange={(e) => setFollowUpData(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Observações</label>
                                <Textarea
                                  placeholder="Descreva o que será tratado no follow-up..."
                                  value={followUpObservacao}
                                  onChange={(e) => setFollowUpObservacao(e.target.value)}
                                />
                              </div>
                              <Button onClick={handleFollowUpSubmit} className="w-full">
                                Agendar Follow-up
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};