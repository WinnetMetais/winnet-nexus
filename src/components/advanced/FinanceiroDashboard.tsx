import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Target
} from 'lucide-react';
import { useAdvancedFinanceiro } from '@/hooks/useAdvancedFinanceiro';
import { formatCurrency } from '@/lib/utils';

export const FinanceiroDashboard = () => {
  const { 
    projecoes, 
    conciliacoes, 
    alertasFluxo, 
    loading, 
    conciliarItem, 
    gerarRelatorioMensal 
  } = useAdvancedFinanceiro();
  
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const getStatusColor = (status: 'positivo' | 'negativo' | 'critico') => {
    switch (status) {
      case 'positivo': return 'text-green-600';
      case 'negativo': return 'text-yellow-600';
      case 'critico': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: 'positivo' | 'negativo' | 'critico') => {
    switch (status) {
      case 'positivo': return <TrendingUp className="h-4 w-4" />;
      case 'negativo': return <TrendingDown className="h-4 w-4" />;
      case 'critico': return <AlertTriangle className="h-4 w-4" />;
    }
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
      {/* Alertas */}
      {alertasFluxo.length > 0 && (
        <div className="space-y-2">
          {alertasFluxo.map((alerta, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alerta}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="projecoes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projecoes">Projeções</TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliação</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="projecoes" className="space-y-6">
          {/* Gráfico de Projeções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Projeção de Fluxo de Caixa - Próximos 12 Meses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={projecoes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="entrada_projetada" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Entradas Projetadas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saida_projetada" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Saídas Projetadas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saldo_projetado" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Saldo Projetado"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cards de Status das Projeções */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projecoes.slice(0, 3).map((projecao, index) => (
              <Card key={projecao.mes}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(projecao.mes).toLocaleDateString('pt-BR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className={`text-lg font-semibold ${getStatusColor(projecao.status)}`}>
                        {formatCurrency(projecao.saldo_projetado)}
                      </p>
                    </div>
                    <div className={getStatusColor(projecao.status)}>
                      {getStatusIcon(projecao.status)}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">Entradas:</span>
                      <span>{formatCurrency(projecao.entrada_projetada)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-600">Saídas:</span>
                      <span>{formatCurrency(projecao.saida_projetada)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conciliacao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Conciliação Bancária</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conciliacoes.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.descricao}</span>
                        {item.conciliado ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Conciliado
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.data} • Banco: {formatCurrency(item.valor_banco)} • 
                        Sistema: {formatCurrency(item.valor_sistema)}
                      </div>
                      {item.diferenca !== 0 && (
                        <div className="mt-1 text-sm text-red-600">
                          Diferença: {formatCurrency(Math.abs(item.diferenca))}
                        </div>
                      )}
                    </div>
                    {!item.conciliado && (
                      <Button 
                        size="sm" 
                        onClick={() => conciliarItem(item.id)}
                        disabled={item.diferenca !== 0}
                      >
                        Conciliar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Relatórios Mensais</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                  <Button 
                    onClick={() => gerarRelatorioMensal(selectedMonth)}
                    disabled={!selectedMonth}
                  >
                    Gerar Relatório
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Receitas</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Despesas</p>
                          <p className="text-lg font-semibold text-red-600">
                            {formatCurrency(0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Resultado</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatCurrency(0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Margem</p>
                          <p className="text-lg font-semibold text-purple-600">0%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};