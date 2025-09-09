import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Cliente, CreateOrcamento, Orcamento } from '@/types';

const itemOrcamentoSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  valor_unitario: z.number().min(0, 'Valor deve ser positivo'),
});

const orcamentoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  observacoes: z.string().optional(),
  itens: z.array(itemOrcamentoSchema).min(1, 'Pelo menos um item é obrigatório'),
});

interface OrcamentoFormModalProps {
  orcamento?: Orcamento;
  clientes: Cliente[];
  onSubmit: (data: CreateOrcamento) => Promise<void>;
  trigger?: React.ReactNode;
}

export const OrcamentoFormModal: React.FC<OrcamentoFormModalProps> = ({
  orcamento,
  clientes,
  onSubmit,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clienteSearchOpen, setClienteSearchOpen] = useState(false);

  const form = useForm<CreateOrcamento>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      cliente_id: '',
      data_vencimento: '',
      observacoes: '',
      itens: [{ descricao: '', quantidade: 1, valor_unitario: 0 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens'
  });

  const watchedItens = form.watch('itens');
  const valorTotal = watchedItens?.reduce((acc, item) => 
    acc + (item.quantidade || 0) * (item.valor_unitario || 0), 0
  ) || 0;

  // Update form when orcamento prop changes
  useEffect(() => {
    if (orcamento) {
      const vencimento = new Date(orcamento.data_vencimento).toISOString().split('T')[0];
      form.reset({
        cliente_id: orcamento.cliente_id,
        data_vencimento: vencimento,
        observacoes: orcamento.observacoes || '',
        itens: orcamento.itens_orcamento?.length 
          ? orcamento.itens_orcamento.map(item => ({
              descricao: item.descricao,
              quantidade: item.quantidade,
              valor_unitario: item.valor_unitario
            }))
          : [{ descricao: '', quantidade: 1, valor_unitario: 0 }],
      });
    } else {
      form.reset({
        cliente_id: '',
        data_vencimento: '',
        observacoes: '',
        itens: [{ descricao: '', quantidade: 1, valor_unitario: 0 }],
      });
    }
  }, [orcamento, form]);

  const handleSubmit = async (data: CreateOrcamento) => {
    setLoading(true);
    try {
      const orcamentoData = {
        ...data,
        valor_total: valorTotal,
      };
      await onSubmit(orcamentoData);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving orcamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    append({ descricao: '', quantidade: 1, valor_unitario: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const selectedCliente = clientes.find(c => c.id === form.watch('cliente_id'));

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Novo Orçamento
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do orçamento. Clique em salvar quando finalizar.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Cliente Selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Cliente *</FormLabel>
                    <Popover open={clienteSearchOpen} onOpenChange={setClienteSearchOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedCliente 
                              ? `${selectedCliente.nome} - ${selectedCliente.email}`
                              : "Buscar Cliente"
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar cliente..." />
                          <CommandList>
                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                            <CommandGroup>
                              {clientes.map((cliente) => (
                                <CommandItem
                                  value={`${cliente.nome} ${cliente.email}`}
                                  key={cliente.id}
                                  onSelect={() => {
                                    form.setValue("cliente_id", cliente.id);
                                    setClienteSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      cliente.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <div className="font-medium">{cliente.nome}</div>
                                    <div className="text-sm text-muted-foreground">{cliente.email}</div>
                                    {cliente.empresa && (
                                      <div className="text-xs text-muted-foreground">{cliente.empresa}</div>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Válido até</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Itens do Orçamento */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Itens do Orçamento</h3>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.descricao`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input placeholder="Descrição do item" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`itens.${index}.quantidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qtd</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`itens.${index}.valor_unitario`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Unit.</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-medium">
                        Total: R$ {((watchedItens[index]?.quantidade || 0) * (watchedItens[index]?.valor_unitario || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total Geral: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais para o cliente..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : orcamento ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};