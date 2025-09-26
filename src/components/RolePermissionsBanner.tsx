import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ROLE_PERMISSIONS = {
  'ADM_MASTER': {
    name: 'Administrador Geral',
    color: 'destructive',
    permissions: [
      'Gerenciar usuários e configurações',
      'Acesso completo a clientes',
      'Controle total de orçamentos',
      'Gerenciar vendas e financeiro',
      'Relatórios avançados',
      'Configurações do sistema'
    ],
    restrictions: []
  },
  'VENDEDOR': {
    name: 'Time Comercial',
    color: 'default',
    permissions: [
      'Visualizar e criar clientes',
      'Criar e editar orçamentos',
      'Fechar vendas (conversão comercial)',
      'Acesso ao pipeline de vendas',
      'Visualizar relatórios básicos'
    ],
    restrictions: [
      'Não pode gerenciar usuários',
      'Não pode acessar configurações',
      'Acesso limitado ao financeiro'
    ]
  },
  'SUPORTE': {
    name: 'Suporte Técnico',
    color: 'secondary',
    permissions: [
      'Visualizar dados de clientes',
      'Consultar orçamentos e vendas',
      'Acessar logs do sistema',
      'Suporte ao usuário'
    ],
    restrictions: [
      'Não pode criar/editar dados',
      'Não pode gerenciar usuários',
      'Acesso apenas de visualização'
    ]
  }
};

export const RolePermissionsBanner: React.FC = () => {
  const { usuario } = useAuth();

  if (!usuario?.role) return null;

  const roleConfig = ROLE_PERMISSIONS[usuario.role as keyof typeof ROLE_PERMISSIONS];
  
  if (!roleConfig) return null;

  return (
    <Alert className="mb-6">
      <Shield className="h-4 w-4" />
      <AlertTitle className="flex items-center space-x-2">
        <span>Seu Perfil de Acesso:</span>
        <Badge variant={roleConfig.color as any} className="ml-2">
          {roleConfig.name}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Permissões</span>
            </h4>
            <ul className="space-y-1">
              {roleConfig.permissions.map((permission, index) => (
                <li key={index} className="text-sm flex items-center space-x-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </div>

          {roleConfig.restrictions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-orange-500" />
                <span>Restrições</span>
              </h4>
              <ul className="space-y-1">
                {roleConfig.restrictions.map((restriction, index) => (
                  <li key={index} className="text-sm flex items-center space-x-2">
                    <Lock className="h-3 w-3 text-orange-500 flex-shrink-0" />
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Para o Time Comercial:</strong> Você pode fechar vendas convertendo orçamentos aprovados. 
            Isso automaticamente reflete o resultado financeiro como uma entrada no sistema.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};