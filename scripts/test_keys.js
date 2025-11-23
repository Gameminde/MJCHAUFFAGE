const { createClient } = require('@supabase/supabase-js');

const PROJECT_URL = 'https://jqrwunmxblzebmvmugju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxcnd1bm14Ymx6ZWJtdm11Z2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MzgwNjYsImV4cCI6MjA3OTMxNDA2Nn0.WdEjsc1kFqWjonVGKF3_6wPkk6xgnObK0I63QWr62iU';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzczODA2NiwiZXhwIjoyMDc5MzE0MDY2fQ.nHeaptGDRi0MAYHcYvtsxcy_Xwc0gYBwj8l6gpbOwtU';

async function testConnection() {
    console.log('Testing Anon Key...');
    const supabaseAnon = createClient(PROJECT_URL, ANON_KEY);
    const { data: anonData, error: anonError } = await supabaseAnon.from('products').select('count').limit(1);
    if (anonError) console.log('❌ Anon Error:', anonError.message);
    else console.log('✅ Anon Success');

    console.log('Testing Service Key...');
    const supabaseService = createClient(PROJECT_URL, SERVICE_KEY);
    const { data: serviceData, error: serviceError } = await supabaseService.from('users').select('count').limit(1);
    if (serviceError) console.log('❌ Service Error:', serviceError.message);
    else console.log('✅ Service Success');
}

testConnection();
