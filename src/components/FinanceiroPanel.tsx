import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, Download, Plus, CheckCircle, AlertCircle, CreditCard, Receipt } from 'lucide-react';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Papa from 'papaparse';

export const FinanceiroPanel: React.FC = () => {
  const { fluxoCaixa, pendentes, kpis, pagamentos, loading, confirmarVenda, receberPagamento, adicionarSaida } = useFinanceiro();
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [novoLancamento, setNovoLancamento] = useState({
    valor: '',
    descricao: '',
    categoria: 'Despesas'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmado':
      case 'confirmada':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'pendente':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'falhou':
      case 'cancelada':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const exportarCSV = (dados: any[], filename: string) => {
    const csv = Papa.unparse(dados);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdicionarSaida = async () => {
    if (!novoLancamento.valor || !novoLancamento.descricao) return;
    
    await adicionarSaida({
      valor: parseFloat(novoLancamento.valor),
      descricao: novoLancamento.descricao,
      categoria: novoLancamento.categoria
    });

    setNovoLancamento({ valor: '', descricao: '', categoria: 'Despesas' });
  };

  const pendentesFiltrados = pendentes.filter(p => {
    if (filtroStatus === 'todos') return true;
    return p.venda_status === filtroStatus || p.pagamento_status === filtroStatus || p.lancamento_status === filtroStatus;
  });

  // Preparar dados para gráficos
  const dadosFluxo = fluxoCaixa.map(f => ({
    mes: format(parseISO(f.mes), 'MMM/yyyy', { locale: ptBR }),
    entradas: f.total_entradas,
    saidas: f.total_saidas,
    saldo: f.saldo
  }));

  // Calcular estatísticas adicionais
  const totalEntradas = dadosFluxo.reduce((sum, d) => sum + d.entradas, 0);
  const totalSaidas = dadosFluxo.reduce((sum, d) => sum + d.saidas, 0);
  const saldoTotal = totalEntradas - totalSaidas;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entradas (Mês)</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis?.entradas_mes_atual || 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saídas (Mês)</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis?.saidas_mes_atual || 0)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas Pendentes</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis?.vendas_pendentes || 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((kpis?.total_entradas || 0) - (kpis?.total_saidas || 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de Caixa (12 meses)</CardTitle>
            <CardDescription>Evolução das entradas e saídas mensais</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="entradas" stroke="hsl(var(--primary))" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="saidas" stroke="hsl(var(--destructive))" strokeWidth={2} name="Saídas" />
                <Line type="monotone" dataKey="saldo" stroke="hsl(var(--accent))" strokeWidth={2} name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo Mensal</CardTitle>
            <CardDescription>Entradas vs Saídas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="entradas" fill="hsl(var(--primary))" name="Entradas" />
                <Bar dataKey="saidas" fill="hsl(var(--destructive))" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lançamentos Financeiros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Lançamentos Financeiros
              </CardTitle>
              <CardDescription>Histórico de entradas e saídas</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => exportarCSV(pagamentos, 'pagamentos')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Valor</th>
                    <th className="text-left p-2">Método</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Parcela</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.slice(0, 10).map((pagamento) => (
                    <tr key={pagamento.id} className="hover:bg-muted/50 border-b">
                      <td className="p-2">
                        {format(parseISO(pagamento.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-2 font-semibold">
                        {formatCurrency(pagamento.valor_pago)}
                      </td>
                      <td className="p-2">{pagamento.metodo}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(pagamento.status)}>
                          {pagamento.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {pagamento.parcela_num}/{pagamento.total_parcelas}
                      </td>
                      <td className="p-2">
                        {pagamento.status === 'pendente' && (
                          <Button
                            onClick={() => receberPagamento(pagamento.venda_id, pagamento.valor_pago)}
                            size="sm"
                            variant="outline"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagamentos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pagamento registrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pendentes Financeiros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pendências Financeiras</CardTitle>
              <CardDescription>Vendas e pagamentos aguardando confirmação</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => exportarCSV(pendentesFiltrados, 'pendencias-financeiras')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Saída
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Saída</DialogTitle>
                    <DialogDescription>
                      Registre uma nova despesa ou saída financeira
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="valor">Valor</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={novoLancamento.valor}
                        onChange={(e) => setNovoLancamento({...novoLancamento, valor: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select 
                        value={novoLancamento.categoria} 
                        onValueChange={(value) => setNovoLancamento({...novoLancamento, categoria: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Despesas">Despesas</SelectItem>
                          <SelectItem value="Taxas">Taxas</SelectItem>
                          <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                          <SelectItem value="Salários">Salários</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={novoLancamento.descricao}
                        onChange={(e) => setNovoLancamento({...novoLancamento, descricao: e.target.value})}
                        placeholder="Descreva a saída..."
                      />
                    </div>
                    <Button onClick={handleAdicionarSaida} className="w-full">
                      Adicionar Saída
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendentesFiltrados.map((pendente) => (
              <div key={pendente.venda_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">{pendente.numero_orcamento}</span>
                    <Badge className={getStatusColor(pendente.venda_status)}>
                      {pendente.venda_status}
                    </Badge>
                    <Badge className={getStatusColor(pendente.pagamento_status)}>
                      Pagamento: {pendente.pagamento_status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Cliente: {pendente.cliente_nome}</span>
                    <Separator orientation="vertical" className="mx-2 inline-block h-4" />
                    <span>Valor: {formatCurrency(pendente.valor_total)}</span>
                    <Separator orientation="vertical" className="mx-2 inline-block h-4" />
                    <span>Data: {format(parseISO(pendente.data_venda), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {pendente.venda_status === 'pendente' && (
                    <Button
                      onClick={() => confirmarVenda(pendente.venda_id)}
                      size="sm"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Venda
                    </Button>
                  )}
                  {pendente.pagamento_status === 'pendente' && (
                    <Button
                      onClick={() => receberPagamento(pendente.venda_id, pendente.valor_total)}
                      size="sm"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Receber Pagamento
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {pendentesFiltrados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma pendência financeira encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};