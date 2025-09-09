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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Check, ChevronsUpDown, Calculator, FileText, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Cliente, CreateOrcamento, Orcamento } from '@/types';

const itemOrcamentoSchema = z.object({
  codigo: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unidade: z.string().optional(),
  valor_unitario: z.number().min(0, 'Valor deve ser positivo'),
});

const orcamentoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  solicitado_por: z.string().optional(),
  desconto_percentual: z.number().min(0).max(100).optional(),
  forma_pagamento: z.string().optional(),
  prazo_entrega: z.string().optional(),
  garantia: z.string().optional(),
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
      solicitado_por: '',
      desconto_percentual: 0,
      forma_pagamento: 'À vista',
      prazo_entrega: '15 dias úteis',
      garantia: '90 dias contra defeitos de fabricação',
      observacoes: '',
      itens: [{ codigo: '', descricao: '', quantidade: 1, unidade: 'UN', valor_unitario: 0 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens'
  });

  const watchedItens = form.watch('itens');
  const watchedDesconto = form.watch('desconto_percentual') || 0;
  
  const subtotal = watchedItens?.reduce((acc, item) => 
    acc + (item.quantidade || 0) * (item.valor_unitario || 0), 0
  ) || 0;
  
  const desconto = (subtotal * watchedDesconto) / 100;
  const valorTotal = subtotal - desconto;

  // Generate orcamento number
  const generateOrcamentoNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORC-${year}${month}${day}-${random}`;
  };

  // Update form when orcamento prop changes
  useEffect(() => {
    if (orcamento) {
      const vencimento = new Date(orcamento.data_vencimento).toISOString().split('T')[0];
      form.reset({
        cliente_id: orcamento.cliente_id,
        data_vencimento: vencimento,
        solicitado_por: orcamento.solicitado_por || '',
        desconto_percentual: orcamento.desconto_percentual || 0,
        forma_pagamento: orcamento.forma_pagamento || 'À vista',
        prazo_entrega: orcamento.prazo_entrega || '15 dias úteis',
        garantia: orcamento.garantia || '90 dias contra defeitos de fabricação',
        observacoes: orcamento.observacoes || '',
        itens: orcamento.itens_orcamento?.length 
          ? orcamento.itens_orcamento.map(item => ({
              codigo: item.codigo || '',
              descricao: item.descricao,
              quantidade: item.quantidade,
              unidade: item.unidade || 'UN',
              valor_unitario: item.valor_unitario
            }))
          : [{ codigo: '', descricao: '', quantidade: 1, unidade: 'UN', valor_unitario: 0 }],
      });
    } else {
      form.reset({
        cliente_id: '',
        data_vencimento: '',
        solicitado_por: '',
        desconto_percentual: 0,
        forma_pagamento: 'À vista',
        prazo_entrega: '15 dias úteis',
        garantia: '90 dias contra defeitos de fabricação',
        observacoes: '',
        itens: [{ codigo: '', descricao: '', quantidade: 1, unidade: 'UN', valor_unitario: 0 }],
      });
    }
  }, [orcamento, form]);

  const handleSubmit = async (data: CreateOrcamento) => {
    setLoading(true);
    try {
      const orcamentoData = {
        ...data,
        valor_total: valorTotal,
        subtotal,
        numero_orcamento: orcamento?.numero_orcamento || generateOrcamentoNumber(),
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
    append({ codigo: '', descricao: '', quantidade: 1, unidade: 'UN', valor_unitario: 0 });
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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do orçamento. Todos os campos são salvos automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Header Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Nº Orçamento</label>
                  <p className="text-lg font-mono bg-muted p-2 rounded">
                    {orcamento?.numero_orcamento || generateOrcamentoNumber()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data</label>
                  <p className="text-sm text-muted-foreground p-2">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
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
                <FormField
                  control={form.control}
                  name="solicitado_por"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitado por</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do solicitante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Cliente Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="cliente_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Buscar Cliente *</FormLabel>
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
                        <PopoverContent className="w-[500px] p-0">
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

                {selectedCliente && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{selectedCliente.nome}</p>
                      <p className="text-sm text-muted-foreground">{selectedCliente.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedCliente.telefone}</p>
                    </div>
                    <div>
                      {selectedCliente.empresa && (
                        <p className="text-sm"><strong>Empresa:</strong> {selectedCliente.empresa}</p>
                      )}
                      {selectedCliente.endereco && (
                        <p className="text-sm"><strong>Endereço:</strong> {selectedCliente.endereco}, {selectedCliente.cidade} - {selectedCliente.estado}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Itens do Orçamento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Itens do Orçamento</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.codigo`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código</FormLabel>
                            <FormControl>
                              <Input placeholder="COD001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                        name={`itens.${index}.unidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unid</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="UN" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UN">UN</SelectItem>
                                <SelectItem value="KG">KG</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="M²">M²</SelectItem>
                                <SelectItem value="M³">M³</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="PC">PC</SelectItem>
                                <SelectItem value="CX">CX</SelectItem>
                              </SelectContent>
                            </Select>
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

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <FormField
                      control={form.control}
                      name="desconto_percentual"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Desconto (%):</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100"
                              step="0.01"
                              className="w-20"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-red-600">-R$ {desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL GERAL:</span>
                    <span className="text-primary">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Complementares</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="forma_pagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione as condições" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="À vista">À vista</SelectItem>
                          <SelectItem value="30 dias">30 dias</SelectItem>
                          <SelectItem value="60 dias">60 dias</SelectItem>
                          <SelectItem value="90 dias">90 dias</SelectItem>
                          <SelectItem value="2x sem juros">2x sem juros</SelectItem>
                          <SelectItem value="3x sem juros">3x sem juros</SelectItem>
                          <SelectItem value="Parcelado">Parcelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prazo_entrega"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de Entrega</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 15 dias úteis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="garantia"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Garantia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 90 dias contra defeitos de fabricação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
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
              </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {fields.length} {fields.length === 1 ? 'item' : 'itens'} • 
                  Total: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex space-x-2">
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};