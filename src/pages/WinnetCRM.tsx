import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Menu,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Calendar,
  LogOut,
  Home,
  Loader2,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  useAuth, 
  useClientes, 
  useOrcamentos, 
  useVendas, 
  useLancamentosFinanceiros, 
  useUsuarios 
} from '@/hooks/useCRM';
import { Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const WinnetCRM: React.FC = () => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL LOGIC BEFORE HOOKS
  
  // Auth and user data
  const { user, usuario, signOut, loading: authLoading } = useAuth();
  
  // Data hooks with realtime
  const { clientes, loading: loadingClientes, adicionarCliente } = useClientes();
  const { orcamentos, loading: loadingOrcamentos, aprovarOrcamento } = useOrcamentos();
  const { vendas, loading: loadingVendas } = useVendas();
  const { lancamentos, loading: loadingLancamentos } = useLancamentosFinanceiros();
  const { usuarios, loading: loadingUsuarios, toggleAtivo, canManageUsers } = useUsuarios();
  
  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [buttonLoading, setButtonLoading] = useState<Record<string, boolean>>({});

  // Computed metrics using real data - ALL MEMOS MUST BE CALLED BEFORE CONDITIONS
  const totalVendas = useMemo(() => 
    vendas.filter(v => v.status === 'confirmada').reduce((acc, v) => acc + v.valor_total, 0), 
    [vendas]
  );
  
  const totalOrcamentos = useMemo(() => orcamentos.length, [orcamentos]);
  const orcamentosAprovados = useMemo(() => orcamentos.filter(o => o.status === 'aprovado').length, [orcamentos]);
  const orcamentosPendentes = useMemo(() => orcamentos.filter(o => o.status === 'enviado').length, [orcamentos]);
  const totalClientes = useMemo(() => clientes.length, [clientes]);
  const usuariosAtivos = useMemo(() => usuarios.filter(u => u.ativo).length, [usuarios]);
  
  // Recent activities based on real data
  const recentActivities = useMemo(() => {
    const activities = [
      ...orcamentos.slice(0, 3).map(o => ({
        id: o.id,
        type: 'orcamento' as const,
        message: `Novo orçamento para ${o.clientes?.nome || 'Cliente'}`,
        time: new Date(o.created_at).toLocaleString('pt-BR'),
        status: o.status
      })),
      ...vendas.slice(0, 2).map(v => ({
        id: v.id,
        type: 'venda' as const,
        message: `Venda confirmada - R$ ${v.valor_total.toLocaleString('pt-BR')}`,
        time: new Date(v.created_at).toLocaleString('pt-BR'),
        status: v.status
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    return activities.slice(0, 5);
  }, [orcamentos, vendas]);

  // Sales data for charts
  const salesData = useMemo(() => {
    const monthlyData = vendas.reduce((acc, venda) => {
      const month = new Date(venda.created_at).toLocaleDateString('pt-BR', { month: 'short' });
      acc[month] = (acc[month] || 0) + venda.valor_total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData).map(([month, value]) => ({ month, value }));
  }, [vendas]);

  // NOW CONDITIONAL LOGIC CAN HAPPEN AFTER ALL HOOKS
  
  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Main loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Handlers
  const handleApproveOrcamento = async (orcamentoId: string) => {
    setButtonLoading(prev => ({ ...prev, [orcamentoId]: true }));
    try {
      await aprovarOrcamento(orcamentoId);
    } finally {
      setButtonLoading(prev => ({ ...prev, [orcamentoId]: false }));
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    if (!toggleAtivo) return;
    
    setButtonLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await toggleAtivo(userId);
    } finally {
      setButtonLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
      case 'confirmada':
        return 'bg-green-500';
      case 'enviado':
      case 'pendente':
        return 'bg-yellow-500';
      case 'rejeitado':
      case 'cancelada':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const navigationItems = [
    { tab: 'dashboard', icon: Home, label: 'Dashboard' },
    { tab: 'clientes', icon: Users, label: 'Clientes' },
    { tab: 'orcamentos', icon: FileText, label: 'Orçamentos' },
    { tab: 'vendas', icon: DollarSign, label: 'Vendas' },
    { tab: 'financeiro', icon: BarChart3, label: 'Financeiro' },
    { tab: 'configuracoes', icon: Settings, label: 'Configurações' }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="bg-card border-r border-border shadow-lg flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="winnet-logo p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    WINNET CRM
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <motion.button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors",
                activeTab === item.tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="h-5 w-5" />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="hover-scale"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Bem-vindo, <span className="font-medium text-foreground">{usuario?.nome}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 w-64 bg-background/50 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="ghost" size="sm" className="hover-scale">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="hover-scale">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {usuario?.nome?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{usuario?.nome || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {usuario?.email || 'email@exemplo.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('configuracoes')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                          <p className="text-3xl font-bold">{totalClientes}</p>
                        </div>
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Orçamentos Pendentes</p>
                          <p className="text-3xl font-bold">{orcamentosPendentes}</p>
                          <p className="text-xs text-orange-500">Aguardando aprovação</p>
                        </div>
                        <FileText className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Vendas</p>
                          <p className="text-3xl font-bold">R$ {totalVendas.toLocaleString('pt-BR')}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                          <p className="text-3xl font-bold">{usuariosAtivos}</p>
                          <p className="text-xs text-green-500">
                            <Badge variant="outline" className="text-xs">
                              {usuario?.role}
                            </Badge>
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts and Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vendas por Mês</CardTitle>
                      <CardDescription>
                        {loadingVendas ? 'Carregando...' : `Total: R$ ${totalVendas.toLocaleString('pt-BR')}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingVendas ? (
                        <div className="flex items-center justify-center h-[300px]">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Atividades Recentes</CardTitle>
                      <CardDescription>
                        Últimas movimentações do sistema
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loadingOrcamentos || loadingVendas ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                          <motion.div 
                            key={activity.id} 
                            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(activity.status))} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.message}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Nenhuma atividade recente</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'clientes' && (
              <motion.div
                key="clientes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Clientes ({clientes.length})</CardTitle>
                      <CardDescription>Gerencie seus clientes</CardDescription>
                    </div>
                    <Button className="hover-scale">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingClientes ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : clientes.length > 0 ? (
                      <div className="space-y-4">
                        {clientes.filter(c => 
                          c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((cliente) => (
                          <motion.div 
                            key={cliente.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {cliente.nome.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{cliente.nome}</h3>
                                  <p className="text-sm text-muted-foreground">{cliente.email}</p>
                                  {cliente.empresa && (
                                    <p className="text-xs text-muted-foreground">{cliente.empresa}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="hover-scale">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="hover-scale">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                        <Button className="mt-4 hover-scale">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Primeiro Cliente
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'orcamentos' && (
              <motion.div
                key="orcamentos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Orçamentos ({orcamentos.length})</CardTitle>
                      <CardDescription>
                        Gerencie seus orçamentos • {orcamentosPendentes} pendentes
                      </CardDescription>
                    </div>
                    <Button className="hover-scale">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Orçamento
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingOrcamentos ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : orcamentos.length > 0 ? (
                      <div className="space-y-4">
                        {orcamentos.filter(o => 
                          o.clientes?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((orcamento) => (
                          <motion.div 
                            key={orcamento.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium">Orçamento #{orcamento.id.slice(-6)}</h3>
                                  <p className="text-sm text-muted-foreground">{orcamento.clientes?.nome}</p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <p className="text-lg font-bold text-primary">
                                      R$ {orcamento.valor_total.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Vence: {new Date(orcamento.data_vencimento).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={
                                  orcamento.status === 'aprovado' ? 'default' : 
                                  orcamento.status === 'enviado' ? 'secondary' :
                                  orcamento.status === 'rejeitado' ? 'destructive' : 'outline'
                                }
                                className="animate-fade-in"
                              >
                                {orcamento.status}
                              </Badge>
                              {orcamento.status === 'enviado' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleApproveOrcamento(orcamento.id)}
                                  disabled={buttonLoading[orcamento.id]}
                                  className="hover-scale"
                                >
                                  {buttonLoading[orcamento.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Aprovar
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="hover-scale">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
                        <Button className="mt-4 hover-scale">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Orçamento
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'configuracoes' && canManageUsers && (
              <motion.div
                key="configuracoes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Usuários do Sistema</CardTitle>
                    <CardDescription>
                      Gerencie usuários e permissões • Apenas ADM_MASTER
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingUsuarios ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : usuarios.length > 0 ? (
                      <div className="space-y-4">
                        {usuarios.map((user) => (
                          <motion.div 
                            key={user.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={cn(
                                  "text-white",
                                  user.ativo ? "bg-green-500" : "bg-gray-400"
                                )}>
                                  {user.nome.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">{user.nome}</h3>
                                  <Badge 
                                    variant={
                                      user.role === 'ADM_MASTER' ? 'default' :
                                      user.role === 'VENDEDOR' ? 'secondary' : 'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {user.role}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={user.ativo ? "outline" : "default"}
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id)}
                                disabled={buttonLoading[user.id] || user.id === usuario?.id}
                                className="hover-scale"
                              >
                                {buttonLoading[user.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : user.ativo ? (
                                  <UserX className="h-4 w-4 mr-2" />
                                ) : (
                                  <UserCheck className="h-4 w-4 mr-2" />
                                )}
                                {user.ativo ? 'Desativar' : 'Ativar'}
                              </Button>
                              <Button variant="ghost" size="sm" className="hover-scale">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Placeholder for other tabs */}
            {['vendas', 'financeiro'].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</CardTitle>
                    <CardDescription>Esta seção está em desenvolvimento.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">🚧</div>
                      <p className="text-muted-foreground">
                        A seção {activeTab} será implementada em breve.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4 hover-scale"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        Voltar ao Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'configuracoes' && !canManageUsers && (
              <motion.div
                key="no-permission"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Acesso Negado</CardTitle>
                    <CardDescription>Você não tem permissão para acessar esta seção.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">
                        Apenas usuários com perfil <Badge variant="outline">ADM_MASTER</Badge> podem gerenciar usuários.
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Seu perfil atual: <Badge variant="secondary">{usuario?.role}</Badge>
                      </p>
                      <Button 
                        variant="outline" 
                        className="hover-scale"
                        onClick={() => setActiveTab('dashboard')}
                      >
                        Voltar ao Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default WinnetCRM;