const { createClient } = require('@supabase/supabase-js');

// Configuration for MJ CHAUFFAGE
const PROJECT_URL = 'https://jqrwunmxblzebmvmugju.supabase.co';
// Using ANON KEY since Service Key failed
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxcnd1bm14Ymx6ZWJtdm11Z2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzgwNjYsImV4cCI6MjA3OTMxNDA2Nn0.WdEjsc1kFqWjonVGKF3_6wPkk6xgnObK0I63QWr62iU';

async function runMigration() {
    try {
        console.log('🔄 Initializing Supabase Client (Anon)...');
        const supabase = createClient(PROJECT_URL, ANON_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Create Admin User (Public Sign Up)
        console.log('🌱 creating Admin User via Sign Up...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'admin@mjchauffage.com',
            password: 'Admin123!',
            options: {
                data: {
                    first_name: 'Admin',
                    last_name: 'User',
                    // We try to set role here, but backend might ignore it if not configured
                    role: 'ADMIN'
                }
            }
        });

        if (authError) {
            console.log('ℹ️ Sign up result:', authError.message);
        } else {
            console.log('✅ Admin signed up. ID:', authData.user?.id);
            // Note: The role might still be CUSTOMER. User needs to update it manually or we need SQL.
        }

        // 2. Seed Categories
        console.log('🌱 Seeding Categories...');
        const categories = [
            { name: 'Chaudières', slug: 'chaudieres', description: 'Chaudières à gaz et électriques' },
            { name: 'Chauffe-bains', slug: 'chauffe-bains', description: 'Chauffe-bains pour eau chaude sanitaire' },
            { name: 'Radiateurs', slug: 'radiateurs', description: 'Radiateurs aluminium et fonte' },
            { name: 'Pièces de rechange', slug: 'pieces-de-rechange', description: 'Pièces détachées pour chaudières' },
            { name: 'Accessoires', slug: 'accessoires', description: 'Accessoires d\'installation' }
        ];

        for (const cat of categories) {
            const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
            if (error) {
                console.error(`Error seeding category ${cat.name}:`, error.message);
                if (error.code === '42P01') {
                    console.error('⚠️ CRITICAL: Tables do not exist! Please run supabase_schema.sql in Supabase SQL Editor.');
                    process.exit(1);
                }
            }
        }
        console.log('✅ Categories seeded (if no errors).');

        // 3. Seed Manufacturers
        console.log('🌱 Seeding Manufacturers...');
        const manufacturers = [
            { name: 'Saunier Duval', slug: 'saunier-duval' },
            { name: 'Chaffoteaux', slug: 'chaffoteaux' },
            { name: 'Junkers', slug: 'junkers' },
            { name: 'Beretta', slug: 'beretta' },
            { name: 'Riello', slug: 'riello' },
            { name: 'Global', slug: 'global' }
        ];

        for (const m of manufacturers) {
            const { error } = await supabase.from('manufacturers').upsert(m, { onConflict: 'slug' });
            if (error) console.error(`Error seeding manufacturer ${m.name}:`, error.message);
        }
        console.log('✅ Manufacturers seeded (if no errors).');

    } catch (error) {
        console.error('❌ Fatal Error:', error);
    }
}

runMigration();
