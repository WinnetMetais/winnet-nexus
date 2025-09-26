import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  Edit3,
  Trash2,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCog,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useUsuarios } from '@/hooks/useCRM';
import { UsuarioAdminModal } from './UsuarioAdminModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UserPermission {
  id: string;
  user_id: string;
  permission_name: string;
  resource_type: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_admin: boolean;
}

interface RoleConfig {
  name: string;
  color: string;
  description: string;
  permissions: string[];
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  'ADM_MASTER': {
    name: 'Administrador Geral',
    color: 'destructive',
    description: 'Acesso total ao sistema. Pode gerenciar usuários, configurações e todos os módulos.',
    permissions: [
      'Gerenciar usuários e permissões',
      'Acesso total a clientes',
      'Gerenciar orçamentos (CRUD)',
      'Gerenciar vendas (CRUD)', 
      'Controle financeiro completo',
      'Relatórios avançados',
      'Configurações do sistema'
    ]
  },
  'VENDEDOR': {
    name: 'Time Comercial',
    color: 'default',
    description: 'Acesso ao pipeline comercial. Pode gerenciar clientes, orçamentos e fechar vendas.',
    permissions: [
      'Visualizar e gerenciar clientes',
      'Criar e editar orçamentos',
      'Fechar vendas (conversão)',
      'Visualizar pipeline comercial',
      'Relatórios de vendas básicos'
    ]
  },
  'SUPORTE': {
    name: 'Suporte Técnico',
    color: 'secondary',
    description: 'Acesso de visualização e suporte. Pode consultar dados mas com edição limitada.',
    permissions: [
      'Visualizar clientes',
      'Visualizar orçamentos',
      'Visualizar vendas',
      'Acesso a logs do sistema',
      'Suporte ao usuário'
    ]
  }
};

interface UserPermissionsSettingsProps {
  currentUserRole?: string;
}

export const UserPermissionsSettings: React.FC<UserPermissionsSettingsProps> = ({ 
  currentUserRole = 'VENDEDOR' 
}) => {
  const { usuario } = useAuth();
  const { usuarios, loading: loadingUsuarios, toggleAtivo, atualizarUsuario } = useUsuarios();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [editingUser, setEditingUser] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isAdmin = usuario?.role === 'ADM_MASTER';

  useEffect(() => {
    if (isAdmin) {
      fetchPermissions();
    }
  }, [isAdmin]);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isAdmin) {
      toast({
        title: 'Acesso negado',
        description: 'Apenas administradores podem alterar perfis de usuário.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update permissions based on new role
      await updateUserPermissionsForRole(userId, newRole);

      toast({
        title: 'Perfil atualizado',
        description: `Usuário alterado para ${ROLE_CONFIGS[newRole]?.name || newRole} com sucesso.`,
      });

      setEditingUser('');
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPermissionsForRole = async (userId: string, role: string) => {
    try {
      // Delete existing permissions for user
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Add permissions based on role
      const newPermissions = getPermissionsForRole(role, userId);
      
      if (newPermissions.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(newPermissions);

        if (error) throw error;
      }

      await fetchPermissions();
    } catch (error) {
      console.error('Error updating user permissions:', error);
    }
  };

  const getPermissionsForRole = (role: string, userId: string): Omit<UserPermission, 'id'>[] => {
    switch (role) {
      case 'ADM_MASTER':
        return [
          {
            user_id: userId,
            permission_name: 'usuarios',
            resource_type: 'usuarios',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
            can_admin: true
          },
          {
            user_id: userId,
            permission_name: 'clientes',
            resource_type: 'clientes',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
            can_admin: true
          },
          {
            user_id: userId,
            permission_name: 'orcamentos',
            resource_type: 'orcamentos',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
            can_admin: true
          },
          {
            user_id: userId,
            permission_name: 'vendas',
            resource_type: 'vendas',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
            can_admin: true
          },
          {
            user_id: userId,
            permission_name: 'financeiro',
            resource_type: 'financeiro',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
            can_admin: true
          }
        ];

      case 'VENDEDOR':
        return [
          {
            user_id: userId,
            permission_name: 'clientes',
            resource_type: 'clientes',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: false,
            can_admin: false
          },
          {
            user_id: userId,
            permission_name: 'orcamentos',
            resource_type: 'orcamentos',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: false,
            can_admin: false
          },
          {
            user_id: userId,
            permission_name: 'vendas',
            resource_type: 'vendas',
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: false,
            can_admin: false
          }
        ];

      case 'SUPORTE':
        return [
          {
            user_id: userId,
            permission_name: 'clientes',
            resource_type: 'clientes',
            can_create: false,
            can_read: true,
            can_update: false,
            can_delete: false,
            can_admin: false
          },
          {
            user_id: userId,
            permission_name: 'orcamentos',
            resource_type: 'orcamentos',
            can_create: false,
            can_read: true,
            can_update: false,
            can_delete: false,
            can_admin: false
          },
          {
            user_id: userId,
            permission_name: 'vendas',
            resource_type: 'vendas',
            can_create: false,
            can_read: true,
            can_update: false,
            can_delete: false,
            can_admin: false
          }
        ];

      default:
        return [];
    }
  };

  const getUserPermissions = (userId: string) => {
    return permissions.filter(p => p.user_id === userId);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acesso Limitado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar configurações de usuário. Apenas administradores podem gerenciar usuários e permissões.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Informações do seu usuário atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {usuario?.nome?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{usuario?.nome}</h3>
                <p className="text-sm text-muted-foreground">{usuario?.email}</p>
                <Badge 
                  variant={ROLE_CONFIGS[usuario?.role || 'VENDEDOR']?.color as any || 'default'}
                  className="mt-2"
                >
                  {ROLE_CONFIGS[usuario?.role || 'VENDEDOR']?.name || usuario?.role}
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <h4 className="text-sm font-medium mb-2">Suas Permissões:</h4>
              <ul className="space-y-1">
                {ROLE_CONFIGS[usuario?.role || 'VENDEDOR']?.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie usuários, perfis de acesso e permissões do sistema
          </p>
        </div>
        <UsuarioAdminModal onUsuarioCriado={fetchPermissions} />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Perfis de Acesso</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gerenciar Usuários</span>
              </CardTitle>
              <CardDescription>
                Liste e gerencie todos os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsuarios ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {usuarios.map((user) => (
                    <motion.div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback 
                            className={cn(
                              "text-white",
                              user.ativo ? "bg-green-500" : "bg-gray-400"
                            )}
                          >
                            {user.nome.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{user.nome}</h3>
                            <Badge 
                              variant={ROLE_CONFIGS[user.role]?.color as any || 'default'}
                              className="text-xs"
                            >
                              {ROLE_CONFIGS[user.role]?.name || user.role}
                            </Badge>
                            {!user.ativo && (
                              <Badge variant="outline" className="text-xs">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {editingUser === user.id ? (
                          <div className="flex items-center space-x-2">
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Selecionar perfil" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    {config.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleRoleChange(user.id, newRole)}
                              disabled={loading || !newRole}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingUser('')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser(user.id);
                                setNewRole(user.role);
                              }}
                              disabled={user.id === usuario?.id}
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
                              Editar Perfil
                            </Button>
                            
                            <Button
                              variant={user.ativo ? "outline" : "default"}
                              size="sm"
                              onClick={() => toggleAtivo(user.id)}
                              disabled={user.id === usuario?.id}
                            >
                              {user.ativo ? (
                                <Lock className="h-4 w-4 mr-1" />
                              ) : (
                                <Unlock className="h-4 w-4 mr-1" />
                              )}
                              {user.ativo ? 'Desativar' : 'Ativar'}
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(ROLE_CONFIGS).map(([key, config]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5" />
                    <span>{config.name}</span>
                  </CardTitle>
                  <Badge variant={config.color as any} className="w-fit">
                    {key}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {config.description}
                  </p>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Permissões:</h4>
                    <ul className="space-y-1">
                      {config.permissions.map((permission, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Usuários com este perfil: {usuarios.filter(u => u.role === key).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings2 className="h-5 w-5" />
                <span>Matriz de Permissões</span>
              </CardTitle>
              <CardDescription>
                Visualize as permissões detalhadas por usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {usuarios.map((user) => {
                  const userPermissions = getUserPermissions(user.id);
                  
                  return (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {user.nome.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{user.nome}</h3>
                            <Badge variant={ROLE_CONFIGS[user.role]?.color as any || 'default'} className="text-xs">
                              {ROLE_CONFIGS[user.role]?.name || user.role}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {userPermissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {userPermissions.map((permission) => (
                            <div key={permission.id} className="border rounded p-3 space-y-2">
                              <h4 className="font-medium text-sm capitalize">
                                {permission.resource_type}
                              </h4>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className={`flex items-center space-x-1 ${permission.can_create ? 'text-green-600' : 'text-gray-400'}`}>
                                  {permission.can_create ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  <span>Criar</span>
                                </div>
                                <div className={`flex items-center space-x-1 ${permission.can_read ? 'text-green-600' : 'text-gray-400'}`}>
                                  {permission.can_read ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                  <span>Ler</span>
                                </div>
                                <div className={`flex items-center space-x-1 ${permission.can_update ? 'text-green-600' : 'text-gray-400'}`}>
                                  {permission.can_update ? <Edit3 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  <span>Editar</span>
                                </div>
                                <div className={`flex items-center space-x-1 ${permission.can_delete ? 'text-green-600' : 'text-gray-400'}`}>
                                  {permission.can_delete ? <Trash2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  <span>Excluir</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma permissão específica configurada
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};