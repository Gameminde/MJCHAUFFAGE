const { createClient } = require('@supabase/supabase-js');

// Configuration
const PROJECT_URL = 'https://jqrwunmxblzebmvmugju.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxcnd1bm14Ymx6ZWJtdm11Z2p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzczODA2NiwiZXhwIjoyMDc5MzE0MDY2fQ.nHeaptGDRi0MAYHcYvtsxcy_Xwc0gYBwj8l6gpbOwtU';

async function fixAndSeed() {
    const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('🔧 Fixing Admin User...');

    // Since we can't alter table (DDL) via client, we'll check if user exists first
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@mjchauffage.com')
        .single();

    if (existingUser) {
        console.log('✅ Admin user already exists. Updating role...');
        const { error } = await supabase
            .from('users')
            .update({ role: 'ADMIN', is_active: true })
            .eq('id', existingUser.id);

        if (error) console.error('❌ Error updating admin:', error);
        else console.log('✅ Admin updated.');
    } else {
        console.log('➕ Creating new Admin user...');
        const { error } = await supabase
            .from('users')
            .insert({
                email: 'admin@mjchauffage.com',
                role: 'ADMIN',
                first_name: 'Admin',
                last_name: 'User',
                is_active: true
            });

        if (error) console.error('❌ Error creating admin:', error);
        else console.log('✅ Admin created.');
    }
}

fixAndSeed();
