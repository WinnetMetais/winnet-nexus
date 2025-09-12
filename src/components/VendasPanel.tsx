import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  CreditCard,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { useVendas } from '@/hooks/useCRM';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { Venda } from '@/types';
import { VendaFormModal } from './VendaFormModal';

export const VendasPanel = () => {
  const { toast } = useToast();
  const { vendas, loading: loadingVendas, deleteVenda } = useVendas();
  const { confirmarVenda, receberPagamento, loading: loadingFinanceiro } = useFinanceiro();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);

  // Filtrar vendas baseado na busca e filtros
  const filteredVendas = vendas.filter(venda => {
    const matchesSearch = 
      venda.orcamentos?.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.orcamentos?.numero_orcamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.forma_pagamento.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || venda.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Métricas das vendas
  const metricas = {
    total: vendas.length,
    pendentes: vendas.filter(v => v.status === 'pendente').length,
    confirmadas: vendas.filter(v => v.status === 'confirmada').length,
    canceladas: vendas.filter(v => v.status === 'cancelada').length,
    valorTotal: vendas.reduce((acc, v) => acc + Number(v.valor_total), 0),
    valorPendente: vendas.filter(v => v.status === 'pendente').reduce((acc, v) => acc + Number(v.valor_total), 0)
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { variant: 'secondary' as const, icon: Clock, color: 'text-orange-600' },
      'confirmada': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'cancelada': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleConfirmarVenda = async (vendaId: string) => {
    try {
      await confirmarVenda(vendaId);
      toast({
        title: "Sucesso",
        description: "Venda confirmada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar venda",
        variant: "destructive",
      });
    }
  };

  const handleReceberPagamento = async (vendaId: string, valor: number) => {
    try {
      await receberPagamento(vendaId, valor);
      toast({
        title: "Sucesso", 
        description: "Pagamento recebido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao receber pagamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVenda = async (vendaId: string) => {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await deleteVenda(vendaId);
        toast({
          title: "Sucesso",
          description: "Venda excluída com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir venda",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditVenda = (venda: Venda) => {
    setSelectedVenda(venda);
    setIsModalOpen(true);
  };

  const handleNewVenda = () => {
    setSelectedVenda(null);
    setIsModalOpen(true);
  };

  if (loadingVendas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{metricas.total}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{metricas.pendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {metricas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Pendente</p>
                <p className="text-2xl font-bold text-orange-600">R$ {metricas.valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestão de Vendas</CardTitle>
              <CardDescription>
                Gerencie todas as vendas do sistema
              </CardDescription>
            </div>
            <Button onClick={handleNewVenda} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Venda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, orçamento ou forma de pagamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de vendas */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Data da Venda</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredVendas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchTerm || statusFilter ? 'Nenhuma venda encontrada com os filtros aplicados.' : 'Nenhuma venda encontrada.'}
                          </p>
                          {!searchTerm && !statusFilter && (
                            <Button onClick={handleNewVenda} variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Criar primeira venda
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendas.map((venda) => (
                      <TableRow
                        key={venda.id}
                        className="hover:bg-muted/50"
                      >
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{venda.orcamentos?.clientes?.nome || 'Cliente não encontrado'}</p>
                                <p className="text-sm text-muted-foreground">{venda.orcamentos?.clientes?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{venda.orcamentos?.numero_orcamento || `#${venda.orcamento_id?.slice(0, 8)}`}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              R$ {Number(venda.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              {venda.forma_pagamento}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(venda.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditVenda(venda)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                {venda.status === 'pendente' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleConfirmarVenda(venda.id)}
                                    disabled={loadingFinanceiro}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirmar Venda
                                  </DropdownMenuItem>
                                )}
                                {venda.status === 'confirmada' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleReceberPagamento(venda.id, Number(venda.valor_total))}
                                    disabled={loadingFinanceiro}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Receber Pagamento
                                  </DropdownMenuItem>
                                )}
                                <Separator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteVenda(venda.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      </TableRow>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de venda */}
      <VendaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVenda(null);
        }}
        venda={selectedVenda}
      />
    </div>
  );
};