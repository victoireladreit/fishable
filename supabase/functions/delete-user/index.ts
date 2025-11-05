import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const userSupabaseClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user } } = await userSupabaseClient.auth.getUser()
        if (!user) {
            throw new Error("User not found");
        }

        const adminSupabaseClient = createClient(
            Deno.env.get(process.env.EXPO_PUBLIC_SUPABASE_URL)!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { error } = await adminSupabaseClient.auth.admin.deleteUser(user.id)
        if (error) {
            throw error
        }

        return new Response(JSON.stringify({ message: "User deleted successfully" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
})
    