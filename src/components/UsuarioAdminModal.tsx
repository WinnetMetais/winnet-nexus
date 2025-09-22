import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserPlus, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import * as z from 'zod';

const usuarioSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(['ADM_MASTER', 'VENDEDOR', 'SUPORTE']),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface UsuarioAdminModalProps {
  onUsuarioCriado?: () => void;
}

export const UsuarioAdminModal: React.FC<UsuarioAdminModalProps> = ({ onUsuarioCriado }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      role: 'VENDEDOR',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: UsuarioFormData) => {
    setLoading(true);
    
    try {
      // Criar usuário na autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          nome: data.nome
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Falha ao criar usuário na autenticação');
      }

      // Criar registro na tabela usuarios
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          nome: data.nome,
          email: data.email,
          role: data.role,
          ativo: true
        });

      if (dbError) {
        // Se falhar ao criar na tabela, tentar deletar o usuário criado na auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw dbError;
      }

      toast({
        title: 'Usuário criado com sucesso!',
        description: `${data.nome} foi adicionado ao sistema com perfil ${data.role}.`,
      });

      form.reset();
      setOpen(false);
      onUsuarioCriado?.();

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      let errorMessage = 'Erro desconhecido ao criar usuário';
      
      if (error.message?.includes('duplicate key')) {
        errorMessage = 'Este email já está cadastrado no sistema';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Erro ao criar usuário',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover-scale">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário Administrativo</DialogTitle>
          <DialogDescription>
            Crie um novo usuário com acesso ao sistema. Certifique-se de usar um email real e válido.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="usuario@empresa.com"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADM_MASTER">ADM_MASTER - Acesso total</SelectItem>
                      <SelectItem value="VENDEDOR">VENDEDOR - Vendas e clientes</SelectItem>
                      <SelectItem value="SUPORTE">SUPORTE - Suporte técnico</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Temporária</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Mínimo 6 caracteres"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Repita a senha"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  'Criar Usuário'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};