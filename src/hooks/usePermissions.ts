import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Permission {
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

export const usePermissions = () => {
  const { usuario } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario?.id) {
      fetchUserPermissions();
    }
  }, [usuario?.id]);

  const fetchUserPermissions = async () => {
    if (!usuario?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', usuario.id);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to check specific permissions
  const hasPermission = (
    resourceType: string, 
    action: 'create' | 'read' | 'update' | 'delete' | 'admin'
  ): boolean => {
    // ADM_MASTER always has all permissions
    if (usuario?.role === 'ADM_MASTER') {
      return true;
    }

    const permission = permissions.find(p => p.resource_type === resourceType);
    if (!permission) return false;

    switch (action) {
      case 'create': return permission.can_create;
      case 'read': return permission.can_read;
      case 'update': return permission.can_update;
      case 'delete': return permission.can_delete;
      case 'admin': return permission.can_admin;
      default: return false;
    }
  };

  // Specific permission checkers
  const canManageUsers = () => {
    return usuario?.role === 'ADM_MASTER' || hasPermission('usuarios', 'admin');
  };

  const canCreateCliente = () => {
    return hasPermission('clientes', 'create');
  };

  const canEditCliente = () => {
    return hasPermission('clientes', 'update');
  };

  const canDeleteCliente = () => {
    return hasPermission('clientes', 'delete');
  };

  const canViewClientes = () => {
    return hasPermission('clientes', 'read');
  };

  const canCreateOrcamento = () => {
    return hasPermission('orcamentos', 'create');
  };

  const canEditOrcamento = () => {
    return hasPermission('orcamentos', 'update');
  };

  const canDeleteOrcamento = () => {
    return hasPermission('orcamentos', 'delete');
  };

  const canViewOrcamentos = () => {
    return hasPermission('orcamentos', 'read');
  };

  const canCreateVenda = () => {
    return hasPermission('vendas', 'create');
  };

  const canEditVenda = () => {
    return hasPermission('vendas', 'update');
  };

  const canDeleteVenda = () => {
    return hasPermission('vendas', 'delete');
  };

  const canViewVendas = () => {
    return hasPermission('vendas', 'read');
  };

  // Commercial team specific: can close sales (convert orcamento to venda)
  const canCloseSale = () => {
    return (usuario?.role === 'VENDEDOR' || usuario?.role === 'ADM_MASTER') && 
           (canCreateVenda() || canEditVenda());
  };

  const canAccessFinanceiro = () => {
    return hasPermission('financeiro', 'read');
  };

  const canManageFinanceiro = () => {
    return hasPermission('financeiro', 'admin');
  };

  // Role-based access
  const isAdmin = () => usuario?.role === 'ADM_MASTER';
  const isVendedor = () => usuario?.role === 'VENDEDOR';
  const isSuporte = () => usuario?.role === 'SUPORTE';

  // Commercial pipeline access (for VENDEDOR role)
  const canAccessCommercialPipeline = () => {
    return isVendedor() || isAdmin();
  };

  return {
    permissions,
    loading,
    hasPermission,
    
    // User management
    canManageUsers,
    
    // Client permissions
    canCreateCliente,
    canEditCliente,
    canDeleteCliente,
    canViewClientes,
    
    // Budget/Quote permissions
    canCreateOrcamento,
    canEditOrcamento,
    canDeleteOrcamento,
    canViewOrcamentos,
    
    // Sales permissions
    canCreateVenda,
    canEditVenda,
    canDeleteVenda,
    canViewVendas,
    canCloseSale,
    
    // Financial permissions
    canAccessFinanceiro,
    canManageFinanceiro,
    
    // Commercial pipeline
    canAccessCommercialPipeline,
    
    // Role checks
    isAdmin,
    isVendedor,
    isSuporte,
    
    // Current user info
    currentRole: usuario?.role,
    userId: usuario?.id
  };
};