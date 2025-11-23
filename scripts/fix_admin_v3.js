const { createClient } = require('@supabase/supabase-js');

// Configuration
const PROJECT_URL = 'https://jqrwunmxblzebmvmugju.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxcnd1bm14Ymx6ZWJtdm11Z2p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzczODA2NiwiZXhwIjoyMDc5MzE0MDY2fQ.nHeaptGDRi0MAYHcYvtsxcy_Xwc0gYBwj8l6gpbOwtU';

async function fixAndSeed() {
    const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('🔧 Fixing Admin User (Attempt 3 - Auth First)...');

    // 1. Create user in Supabase Auth first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@mjchauffage.com',
        password: 'Admin123!', // Set a default password
        email_confirm: true,
        user_metadata: {
            first_name: 'Admin',
            last_name: 'User',
            role: 'ADMIN'
        }
    });

    if (authError) {
        console.error('⚠️ Auth user creation failed (might already exist):', authError.message);
        // If user exists, we need their ID.
        // We can't list users easily without pagination, but let's try to find them in public.users if sync worked?
        // Or just proceed to upsert public.users with the ID if we can get it.
    } else {
        console.log('✅ Auth user created:', authUser.user.id);

        // 2. Now create/update the public.users record with the SAME ID
        const { error: publicError } = await supabase
            .from('users')
            .upsert({
                id: authUser.user.id, // CRITICAL: Must match auth.users.id
                email: 'admin@mjchauffage.com',
                role: 'ADMIN',
                first_name: 'Admin',
                last_name: 'User',
                is_active: true
            });

        if (publicError) console.error('❌ Error creating public user profile:', publicError);
        else console.log('✅ Public user profile synced.');
    }
}

fixAndSeed();
