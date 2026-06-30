import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401)
    }

    // Verify the caller is an admin using their own JWT (anon key client)
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return json({ error: 'Unauthorized' }, 401)

    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Admin access required' }, 403)
    }

    // Parse request
    const {
      email,
      password,
      full_name,
      role = 'member',
      can_access_mediagen = false,
      can_access_fyc = false,
    } = await req.json()

    if (!email || !password || !full_name) {
      return json({ error: 'email, password, and full_name are required' }, 400)
    }

    // Use service role key to create the auth user
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) return json({ error: authError.message }, 400)

    // Admins always get access to all tools regardless of what was sent
    const resolvedMediagen = role === 'admin' ? true : can_access_mediagen
    const resolvedFyc = role === 'admin' ? true : can_access_fyc

    // Insert profile row
    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name,
      role,
      can_access_mediagen: resolvedMediagen,
      can_access_fyc: resolvedFyc,
    })

    if (profileError) {
      // Rollback auth user if profile insert fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return json({ error: profileError.message }, 400)
    }

    return json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        full_name,
        role,
        can_access_mediagen: resolvedMediagen,
        can_access_fyc: resolvedFyc,
      },
    }, 200)
  } catch (err) {
    return json({ error: err.message }, 500)
  }
})

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
