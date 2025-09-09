import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from '@/components/ui/tabs';
import { cn } from "@/lib/utils";
import { 
  User, FileText, CheckCircle, DollarSign, CreditCard, Plus, Edit, Eye, Settings, Home, 
  Moon, Sun, LogOut, Menu, X, Users, BarChart3, Search, TrendingUp, Calendar,
  Phone, Mail, MapPin, Trash2
} from 'lucide-react';

// TypeScript Interfaces
interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  observacoes: string;
}

interface ItemOrcamento {
  id: string;
  descricao: string;
  quantidade: number;
  valor: number;
}

interface Orcamento {
  id: string;
  clienteId: string;
  numero: string;
  data: string;
  validade: string;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  itens: ItemOrcamento[];
  observacoes: string;
  valorTotal: number;
}

interface Venda {
  id: string;
  orcamentoId: string;
  clienteId: string;
  numero: string;
  data: string;
  valorTotal: number;
  status: 'pendente' | 'pago' | 'cancelado';
}

interface LancamentoFinanceiro {
  id: string;
  vendaId: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  status: 'pendente' | 'pago' | 'vencido';
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: 'ADM_MASTER' | 'VENDEDOR' | 'SUPORTE';
  ativo: boolean;
}

// Mock Data
const mockSalesData = [
  { name: 'Jan', value: 4000 },
  { name: 'Fev', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Abr', value: 4500 },
  { name: 'Mai', value: 6000 },
  { name: 'Jun', value: 5500 },
];

const WinnetCRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Data States
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nome: 'Empresa Tech Ltda',
      email: 'contato@empresatech.com',
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      observacoes: 'Cliente preferencial'
    }
  ]);
  
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([
    {
      id: '1',
      clienteId: '1',
      numero: 'ORC-2024-001',
      data: '2024-01-15',
      validade: '2024-02-15',
      status: 'enviado',
      itens: [
        { id: '1', descricao: 'Desenvolvimento de Sistema', quantidade: 1, valor: 15000 }
      ],
      observacoes: 'Projeto urgente',
      valorTotal: 15000
    }
  ]);
  
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [lancamentosFinanceiros, setLancamentosFinanceiros] = useState<LancamentoFinanceiro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { 
      id: '1', 
      nome: 'Admin Winnet', 
      email: 'admin@winnet.com', 
      senha: 'hashed', 
      role: 'ADM_MASTER', 
      ativo: true 
    }
  ]);

  // Form States
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({});
  const [novoOrcamento, setNovoOrcamento] = useState<Partial<Orcamento>>({});
  const [novoUsuario, setNovoUsuario] = useState<Partial<Usuario>>({});
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Effects
  useEffect(() => {
    const root = window.document.documentElement;
    const saved = localStorage.getItem('darkMode') === 'true';
    setIsDark(saved);
    root.classList.toggle('dark', saved);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const toggleDarkMode = useCallback(() => {
    const root = window.document.documentElement;
    const newDark = !isDark;
    setIsDark(newDark);
    root.classList.toggle('dark', newDark);
    localStorage.setItem('darkMode', newDark.toString());
  }, [isDark]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const adicionarCliente = useCallback(async () => {
    if (novoCliente.nome && novoCliente.email) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock loading
      
      const cliente: Cliente = {
        id: Date.now().toString(),
        nome: novoCliente.nome as string,
        email: novoCliente.email as string,
        telefone: novoCliente.telefone || '',
        endereco: novoCliente.endereco || '',
        cidade: novoCliente.cidade || '',
        observacoes: novoCliente.observacoes || ''
      };
      
      setClientes(prev => [...prev, cliente]);
      setNovoCliente({});
      setIsLoading(false);
    }
  }, [novoCliente]);

  const aprovarOrcamento = useCallback((id: string) => {
    const orcamento = orcamentos.find(o => o.id === id);
    if (!orcamento) return;

    // Update budget status
    setOrcamentos(prev => 
      prev.map(o => o.id === id ? { ...o, status: 'aprovado' as const } : o)
    );

    // Auto-create sale
    const venda: Venda = {
      id: Date.now().toString(),
      orcamentoId: id,
      clienteId: orcamento.clienteId,
      numero: `VEN-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      valorTotal: orcamento.valorTotal,
      status: 'pendente'
    };
    setVendas(prev => [...prev, venda]);

    // Auto-create financial entry
    const lancamento: LancamentoFinanceiro = {
      id: Date.now().toString(),
      vendaId: venda.id,
      tipo: 'receita',
      descricao: `Receita da venda ${venda.numero}`,
      valor: venda.valorTotal,
      data: venda.data,
      categoria: 'Vendas',
      status: 'pendente'
    };
    setLancamentosFinanceiros(prev => [...prev, lancamento]);
  }, [orcamentos]);

  const adicionarUsuario = useCallback(async () => {
    if (novoUsuario.nome && novoUsuario.email && novoUsuario.role) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const usuario: Usuario = {
        id: Date.now().toString(),
        nome: novoUsuario.nome as string,
        email: novoUsuario.email as string,
        senha: 'hashed-' + Date.now(),
        role: novoUsuario.role as Usuario['role'],
        ativo: true
      };
      
      setUsuarios(prev => [...prev, usuario]);
      setNovoUsuario({});
      setIsLoading(false);
    }
  }, [novoUsuario]);

  const editarUsuario = useCallback((usuario: Usuario) => {
    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, ...usuario } : u));
    setEditandoUsuario(null);
  }, []);

  const deletarUsuario = useCallback((id: string) => {
    if (confirm('Confirmar exclusão do usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  }, []);

  const toggleAtivo = useCallback((id: string) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ativo: !u.ativo } : u));
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const variants: Record<string, any> = {
      'rascunho': 'secondary',
      'enviado': 'default',
      'aprovado': 'default',
      'rejeitado': 'destructive',
      'pendente': 'secondary',
      'pago': 'default',
      'cancelado': 'destructive',
      'vencido': 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  }, []);

  // Memoized Components
  const Metrics = memo(() => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="hover-scale bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Clientes</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{clientes.length}</p>
                <p className="text-xs text-blue-500">+2 este mês</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="hover-scale bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Orçamentos Pendentes</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {orcamentos.filter(o => o.status === 'enviado').length}
                </p>
                <p className="text-xs text-emerald-500">Aguardando aprovação</p>
              </div>
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="hover-scale bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Vendas Hoje</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">R$ 10.500</p>
                <p className="text-xs text-amber-500">+15% vs ontem</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="hover-scale bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Receita Mensal</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">R$ 45.200</p>
                <p className="text-xs text-purple-500">+8% vs mês anterior</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  ));

  const navigationItems = [
    { tab: 'dashboard', icon: Home, label: 'Dashboard' },
    { tab: 'clientes', icon: Users, label: 'Clientes' },
    { tab: 'orcamentos', icon: FileText, label: 'Orçamentos' },
    { tab: 'aprovacoes', icon: CheckCircle, label: 'Aprovações' },
    { tab: 'vendas', icon: DollarSign, label: 'Vendas' },
    { tab: 'financeiro', icon: CreditCard, label: 'Financeiro' },
    { tab: 'configuracoes', icon: Settings, label: 'Configurações' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "bg-sidebar dark:bg-sidebar-dark border-r border-sidebar-border flex flex-col transition-all duration-300",
              isMobile ? "fixed inset-y-0 left-0 z-50 w-64" : "w-64",
              !isSidebarOpen && !isMobile && "w-16"
            )}
          >
            <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
              <motion.div 
                className="flex items-center gap-3"
                layout
              >
                <div className="winnet-logo w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  W
                </div>
                <AnimatePresence>
                  {(isSidebarOpen || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-xl font-bold text-primary"
                    >
                      WINNET
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigationItems.map(({ tab, icon: Icon, label }) => (
                <motion.div key={tab} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={activeTab === tab ? 'secondary' : 'ghost'}
                    className={cn(
                      "w-full justify-start gap-3 h-11",
                      activeTab === tab && "bg-primary text-primary-foreground shadow-md",
                      !isSidebarOpen && !isMobile && "px-2"
                    )}
                    onClick={() => {
                      setActiveTab(tab);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <AnimatePresence>
                      {(isSidebarOpen || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="font-medium"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              ))}
            </nav>

            <div className="p-3 border-t border-sidebar-border">
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10">
                <LogOut className="w-5 h-5" />
                <AnimatePresence>
                  {(isSidebarOpen || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Sair
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="w-5 h-5" />
              </Button>
            )}
            
            <motion.h1 
              className="text-2xl font-bold text-primary hidden sm:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Winnet CRM
            </motion.h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Buscar..." 
                className="w-64 pl-10 bg-muted/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleDarkMode}
                className="hover-scale"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            <Button variant="ghost" size="icon" className="hover-scale">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-gradient-to-br from-background to-muted/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Dashboard Content */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                      <p className="text-muted-foreground">Bem-vindo ao painel de controle do Winnet CRM</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date().toLocaleDateString('pt-BR')}
                    </div>
                  </motion.div>

                  <Metrics />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          Vendas Mensais
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockSalesData}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value) => [`R$ ${value}`, 'Vendas']}
                                labelFormatter={(label) => `Mês: ${label}`}
                              />
                              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Atividades Recentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { action: 'Novo cliente cadastrado', time: '2 min atrás', type: 'cliente' },
                            { action: 'Orçamento aprovado', time: '1 hora atrás', type: 'orcamento' },
                            { action: 'Venda finalizada', time: '3 horas atrás', type: 'venda' }
                          ].map((activity, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                activity.type === 'cliente' && "bg-blue-500",
                                activity.type === 'orcamento' && "bg-green-500",
                                activity.type === 'venda' && "bg-amber-500"
                              )} />
                              <div className="flex-1">
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">{activity.time}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Clientes Content */}
              {activeTab === 'clientes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">Clientes</h2>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Novo Cliente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Adicionar Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="nome">Nome</Label>
                            <Input
                              id="nome"
                              value={novoCliente.nome || ''}
                              onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                              placeholder="Nome do cliente"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={novoCliente.email || ''}
                              onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                              placeholder="email@exemplo.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                              id="telefone"
                              value={novoCliente.telefone || ''}
                              onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                              placeholder="(11) 99999-9999"
                            />
                          </div>
                          <div>
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input
                              id="endereco"
                              value={novoCliente.endereco || ''}
                              onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                              placeholder="Rua, número"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cidade">Cidade</Label>
                            <Input
                              id="cidade"
                              value={novoCliente.cidade || ''}
                              onChange={(e) => setNovoCliente({...novoCliente, cidade: e.target.value})}
                              placeholder="Cidade"
                            />
                          </div>
                          <div>
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea
                              id="observacoes"
                              value={novoCliente.observacoes || ''}
                              onChange={(e) => setNovoCliente({...novoCliente, observacoes: e.target.value})}
                              placeholder="Observações sobre o cliente"
                            />
                          </div>
                          <Button 
                            onClick={adicionarCliente} 
                            disabled={isLoading}
                            className="w-full"
                          >
                            {isLoading ? 'Adicionando...' : 'Adicionar Cliente'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Input
                          placeholder="Buscar clientes..."
                          className="max-w-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {clientes
                          .filter(cliente => 
                            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((cliente) => (
                          <motion.div
                            key={cliente.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {cliente.email}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {cliente.telefone}
                                  </div>
                                  {cliente.endereco && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4" />
                                      {cliente.endereco}, {cliente.cidade}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Configurações Content */}
              {activeTab === 'configuracoes' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">Configurações</h2>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Gerenciamento de Usuários
                        </CardTitle>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Novo Usuário
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {editandoUsuario ? 'Editar' : 'Adicionar'} Usuário
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="nomeUsuario">Nome</Label>
                                <Input
                                  id="nomeUsuario"
                                  value={novoUsuario.nome || editandoUsuario?.nome || ''}
                                  onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="emailUsuario">Email</Label>
                                <Input
                                  id="emailUsuario"
                                  type="email"
                                  value={novoUsuario.email || editandoUsuario?.email || ''}
                                  onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="roleUsuario">Permissão</Label>
                                <Select
                                  value={novoUsuario.role || editandoUsuario?.role || 'VENDEDOR'}
                                  onValueChange={(value) => setNovoUsuario({...novoUsuario, role: value as Usuario['role']})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma permissão" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ADM_MASTER">ADM MASTER</SelectItem>
                                    <SelectItem value="VENDEDOR">VENDEDOR</SelectItem>
                                    <SelectItem value="SUPORTE">SUPORTE</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={() => editandoUsuario ? editarUsuario({...editandoUsuario, ...novoUsuario} as Usuario) : adicionarUsuario()}
                                disabled={isLoading}
                                className="w-full"
                              >
                                {isLoading ? 'Processando...' : editandoUsuario ? 'Salvar' : 'Adicionar'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="pb-3 font-semibold">Nome</th>
                              <th className="pb-3 font-semibold">Email</th>
                              <th className="pb-3 font-semibold">Permissão</th>
                              <th className="pb-3 font-semibold">Status</th>
                              <th className="pb-3 font-semibold">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usuarios.map((usuario) => (
                              <motion.tr
                                key={usuario.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b hover:bg-muted/50 transition-colors"
                              >
                                <td className="py-3">{usuario.nome}</td>
                                <td className="py-3">{usuario.email}</td>
                                <td className="py-3">
                                  <Badge variant="secondary">{usuario.role}</Badge>
                                </td>
                                <td className="py-3">
                                  <Badge variant={usuario.ativo ? 'default' : 'destructive'}>
                                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditandoUsuario(usuario);
                                        setNovoUsuario(usuario);
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleAtivo(usuario.id)}
                                    >
                                      {usuario.ativo ? 'Desativar' : 'Ativar'}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => deletarUsuario(usuario.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Other tabs would go here with similar structure */}
              {['orcamentos', 'aprovacoes', 'vendas', 'financeiro'].includes(activeTab) && (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-2">Em Desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      A seção "{navigationItems.find(item => item.tab === activeTab)?.label}" está sendo desenvolvida.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default WinnetCRM;
