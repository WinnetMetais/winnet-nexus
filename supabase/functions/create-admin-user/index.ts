import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create the admin user in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'evandrinhop@gmail.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        nome: 'Administrador Geral'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user', details: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the usuarios table with the correct auth user ID
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({ id: authUser.user.id })
      .eq('email', 'evandrinhop@gmail.com')

    if (updateError) {
      console.error('Error updating usuarios table:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update usuarios table', details: updateError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user permissions with the correct user ID
    const { error: permissionsError } = await supabaseAdmin
      .from('user_permissions')
      .update({ user_id: authUser.user.id })
      .eq('user_id', 'a31c8219-a082-452d-8dfc-cd5e4e7dcb82')

    if (permissionsError) {
      console.error('Error updating permissions:', permissionsError)
    }

    // Log the successful creation
    await supabaseAdmin
      .from('logs')
      .insert({
        mensagem: `Admin user successfully created and linked: ${authUser.user.email}`,
        user_id: authUser.user.id
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authUser.user,
        message: 'Admin user created successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})