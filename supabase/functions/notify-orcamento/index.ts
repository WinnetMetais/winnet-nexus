import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  orcamento_id: string;
  status: string;
  user_id: string;
  cliente_nome?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orcamento_id, status, user_id, cliente_nome }: NotificationRequest = await req.json();

    console.log('Processing notification:', { orcamento_id, status, user_id, cliente_nome });

    // Create notification message
    const mensagem = status === 'aprovado' 
      ? `Orçamento aprovado! ${cliente_nome ? `Cliente: ${cliente_nome}` : `ID: ${orcamento_id}`}`
      : `Orçamento rejeitado! ${cliente_nome ? `Cliente: ${cliente_nome}` : `ID: ${orcamento_id}`}`;

    // Insert notification into database
    const { data: notification, error: notificationError } = await supabase
      .from('notificacoes')
      .insert({
        user_id,
        mensagem,
        lida: false
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    console.log('Notification created successfully:', notification);

    // Also log the action for audit trail
    const { error: logError } = await supabase
      .from('logs')
      .insert({
        mensagem: `Orçamento ${orcamento_id} ${status} - Notificação enviada para usuário ${user_id}`
      });

    if (logError) {
      console.error('Error creating log:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification,
        message: 'Notification processed successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in notify-orcamento function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process notification'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);