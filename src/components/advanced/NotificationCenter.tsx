import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter, 
  Search,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
  tipo?: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica';
}

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, searchTerm, typeFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        // Classificar notificações por tipo e prioridade
        const enrichedNotifications = data.map(notification => ({
          ...notification,
          tipo: detectNotificationType(notification.mensagem),
          prioridade: detectNotificationPriority(notification.mensagem)
        }));
        
        setNotifications(enrichedNotifications);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar notificações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const detectNotificationType = (mensagem: string): string => {
    const msg = mensagem.toLowerCase();
    if (msg.includes('venda') || msg.includes('pagamento')) return 'financeiro';
    if (msg.includes('orçamento') || msg.includes('proposta')) return 'vendas';
    if (msg.includes('cliente')) return 'clientes';
    if (msg.includes('usuário') || msg.includes('conta')) return 'sistema';
    return 'geral';
  };

  const detectNotificationPriority = (mensagem: string): 'baixa' | 'media' | 'alta' | 'critica' => {
    const msg = mensagem.toLowerCase();
    if (msg.includes('crítico') || msg.includes('vencido') || msg.includes('erro')) return 'critica';
    if (msg.includes('urgente') || msg.includes('importante')) return 'alta';
    if (msg.includes('lembrete') || msg.includes('aprovação')) return 'media';
    return 'baixa';
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filtro por status de leitura
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.lida);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.lida);
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.tipo === typeFilter);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao marcar notificação como lida',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.lida).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, lida: true }))
      );

      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas'
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao marcar todas as notificações como lidas',
        variant: 'destructive'
      });
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notificacoes',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          const newNotification = {
            ...payload.new as Notification,
            tipo: detectNotificationType(payload.new.mensagem),
            prioridade: detectNotificationPriority(payload.new.mensagem)
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Mostrar toast para notificação em tempo real
          toast({
            title: 'Nova Notificação',
            description: newNotification.mensagem
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'financeiro': return <DollarSign className="h-4 w-4" />;
      case 'vendas': return <CheckCircle className="h-4 w-4" />;
      case 'clientes': return <Users className="h-4 w-4" />;
      case 'sistema': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (prioridade: 'baixa' | 'media' | 'alta' | 'critica') => {
    switch (prioridade) {
      case 'critica': return 'border-l-red-500 bg-red-50';
      case 'alta': return 'border-l-orange-500 bg-orange-50';
      case 'media': return 'border-l-yellow-500 bg-yellow-50';
      case 'baixa': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (prioridade: 'baixa' | 'media' | 'alta' | 'critica') => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.lida).length;
  const typeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'clientes', label: 'Clientes' },
    { value: 'sistema', label: 'Sistema' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Central de Notificações</span>
              {unreadCount > 0 && (
                <Badge className="ml-2">{unreadCount}</Badge>
              )}
            </CardTitle>
            <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar Todas como Lidas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">
                Todas ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Não Lidas ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read">
                Lidas ({notifications.length - unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 rounded-lg transition-colors ${
                        notification.lida ? 'bg-muted/30' : getPriorityColor(notification.prioridade!)
                      } ${!notification.lida ? 'shadow-sm' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getNotificationIcon(notification.tipo!)}
                            <Badge 
                              className={getPriorityBadgeColor(notification.prioridade!)}
                              variant="secondary"
                            >
                              {notification.prioridade?.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {notification.tipo}
                            </Badge>
                            {!notification.lida && (
                              <Badge className="bg-blue-100 text-blue-800">Nova</Badge>
                            )}
                          </div>
                          
                          <p className={`text-sm ${notification.lida ? 'text-muted-foreground' : 'font-medium'}`}>
                            {notification.mensagem}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </div>
                        </div>

                        {!notification.lida && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="ml-4"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};