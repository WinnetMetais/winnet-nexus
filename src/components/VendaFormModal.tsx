import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

import { Calendar as CalendarIcon, DollarSign, FileText, User, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useVendas, useOrcamentos } from '@/hooks/useCRM';
import { Venda, Orcamento } from '@/types';

const vendaSchema = z.object({
  orcamento_id: z.string().min(1, 'Selecione um orçamento'),
  data_venda: z.date({
    required_error: 'Selecione a data da venda',
  }),
  forma_pagamento: z.string().min(1, 'Informe a forma de pagamento'),
  status: z.enum(['pendente', 'confirmada', 'cancelada']),
});

type VendaFormData = z.infer<typeof vendaSchema>;

interface VendaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  venda?: Venda | null;
}

export const VendaFormModal = ({ isOpen, onClose, venda }: VendaFormModalProps) => {
  const { toast } = useToast();
  const { createVenda, updateVenda } = useVendas();
  const { orcamentos } = useOrcamentos();
  const [loading, setLoading] = useState(false);

  // Filtrar apenas orçamentos aprovados que não têm venda associada
  const orcamentosDisponiveis = orcamentos.filter(orc => 
    orc.status === 'aprovado' && (!venda || orc.id === venda.orcamento_id)
  );

  const form = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      orcamento_id: '',
      data_venda: new Date(),
      forma_pagamento: '',
      status: 'pendente',
    },
  });

  const selectedOrcamento = orcamentosDisponiveis.find(
    orc => orc.id === form.watch('orcamento_id')
  );

  // Resetar formulário quando abrir/fechar modal
  useEffect(() => {
    if (isOpen) {
      if (venda) {
        // Modo edição
        form.reset({
          orcamento_id: venda.orcamento_id,
          data_venda: new Date(venda.data_venda),
          forma_pagamento: venda.forma_pagamento,
          status: venda.status as 'pendente' | 'confirmada' | 'cancelada',
        });
      } else {
        // Modo criação
        form.reset({
          orcamento_id: '',
          data_venda: new Date(),
          forma_pagamento: 'À vista',
          status: 'pendente',
        });
      }
    }
  }, [isOpen, venda, form]);

  const onSubmit = async (data: VendaFormData) => {
    setLoading(true);
    try {
      const orcamento = orcamentosDisponiveis.find(orc => orc.id === data.orcamento_id);
      
      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      const vendaData = {
        orcamento_id: data.orcamento_id,
        data_venda: format(data.data_venda, 'yyyy-MM-dd'),
        valor_total: orcamento.valor_total,
        forma_pagamento: data.forma_pagamento,
        status: data.status,
      };

      if (venda) {
        // Atualizar venda existente
        await updateVenda(venda.id, vendaData);
        toast({
          title: "Sucesso",
          description: "Venda atualizada com sucesso!",
        });
      } else {
        // Criar nova venda
        await createVenda(vendaData);
        toast({
          title: "Sucesso",
          description: "Venda criada com sucesso!",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: venda ? "Erro ao atualizar venda" : "Erro ao criar venda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formasPagamento = [
    'À vista',
    'Cartão de Crédito',
    'Cartão de Débito',
    'PIX',
    'Transferência Bancária',
    'Boleto',
    'Parcelado',
    'Outro'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {venda ? 'Editar Venda' : 'Nova Venda'}
          </DialogTitle>
          <DialogDescription>
            {venda 
              ? 'Edite as informações da venda selecionada.' 
              : 'Crie uma nova venda a partir de um orçamento aprovado.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seleção de Orçamento */}
            <FormField
              control={form.control}
              name="orcamento_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Orçamento
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!!venda} // Não permitir trocar orçamento ao editar
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um orçamento aprovado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orcamentosDisponiveis.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Nenhum orçamento aprovado disponível
                        </div>
                      ) : (
                        orcamentosDisponiveis.map((orcamento) => (
                          <SelectItem key={orcamento.id} value={orcamento.id}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {orcamento.numero_orcamento || `#${orcamento.id.slice(0, 8)}`}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {orcamento.clientes?.nome}
                                </span>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                R$ {Number(orcamento.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detalhes do orçamento selecionado */}
            {selectedOrcamento && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Detalhes do Orçamento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente:</p>
                    <p className="font-medium">{selectedOrcamento.clientes?.nome}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email:</p>
                    <p>{selectedOrcamento.clientes?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Total:</p>
                    <p className="font-semibold text-green-600">
                      R$ {Number(selectedOrcamento.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimento:</p>
                    <p>{new Date(selectedOrcamento.data_vencimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {selectedOrcamento.observacoes && (
                  <div>
                    <p className="text-muted-foreground">Observações:</p>
                    <p className="text-sm">{selectedOrcamento.observacoes}</p>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data da Venda */}
              <FormField
                control={form.control}
                name="data_venda"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Data da Venda
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status da Venda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pendente">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            Pendente
                          </div>
                        </SelectItem>
                        <SelectItem value="confirmada">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Confirmada
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelada">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            Cancelada
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Forma de Pagamento */}
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Forma de Pagamento
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formasPagamento.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (venda ? 'Atualizar' : 'Criar Venda')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};