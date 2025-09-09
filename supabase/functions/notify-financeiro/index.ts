import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const payload = await req.json();
      const { evento, venda_id, valor, user_id } = payload;

      console.log('Processando evento financeiro:', evento, { venda_id, valor });

      if (evento === 'venda_criada') {
        // Criar notificação
        await supabase.from('notificacoes').insert({
          user_id: user_id,
          mensagem: `Nova venda pendente: R$ ${valor?.toFixed(2)}`,
        });

        // Mock Stripe: Simular criação de charge
        console.log('Mock Stripe charge criada para venda:', venda_id);
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Venda criada com sucesso' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });

      } else if (evento === 'pagamento_confirmado') {
        // Confirmar pagamento
        const { error } = await supabase
          .from('pagamentos')
          .update({ status: 'confirmado', data_pagamento: new Date().toISOString().split('T')[0] })
          .eq('venda_id', venda_id);

        if (error) {
          throw error;
        }

        // Criar notificação
        await supabase.from('notificacoes').insert({
          user_id: user_id,
          mensagem: `Pagamento confirmado: R$ ${valor?.toFixed(2)}`,
        });

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Pagamento confirmado com sucesso' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });

      } else if (evento === 'confirmar_venda') {
        // Confirmar venda manualmente
        const { error } = await supabase
          .from('vendas')
          .update({ status: 'confirmada' })
          .eq('id', venda_id);

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Venda confirmada com sucesso' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Método não permitido ou evento inválido' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    });

  } catch (error) {
    console.error('Erro na function notify-financeiro:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});