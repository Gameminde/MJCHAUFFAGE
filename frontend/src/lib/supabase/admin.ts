import { createClient } from '@supabase/supabase-js'

// Note: This client should ONLY be used in server-side contexts (Server Actions, API routes)
// NEVER import this in a client component.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase URL or Service Role Key is missing. Admin operations may fail.')
}

export const supabaseAdmin = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
