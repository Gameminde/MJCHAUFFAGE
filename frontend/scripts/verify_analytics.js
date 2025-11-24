const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials from check_orders.js for consistency in this environment
const supabaseUrl = 'https://jqrwunmxblzebmvmugju.supabase.co';
// Note: In a real prod env we should use env vars, but for this quick check script we use what's working
const supabaseKey = 'sb_secret_ZPIheI3ABG95W023aiBDKQ_OYRSK0zO';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAnalytics() {
    console.log('🔍 Verifying Analytics Data...\n');

    // 1. Check Sessions
    console.log('--- Latest 5 Sessions ---');
    const { data: sessions, error: sessionError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(5);

    if (sessionError) {
        console.error('❌ Error fetching sessions:', sessionError.message);
    } else {
        if (sessions.length === 0) {
            console.log('⚠️ No sessions found. Visit the website to generate traffic.');
        } else {
            sessions.forEach(s => {
                console.log(`ID: ${s.id}`);
                console.log(`   Visitor: ${s.visitor_id}`);
                console.log(`   Started: ${s.started_at}`);
                console.log(`   Device: ${s.device_type} / ${s.browser} / ${s.os}`);
                console.log('');
            });
        }
    }

    // 2. Check Events
    console.log('--- Latest 5 Events ---');
    const { data: events, error: eventError } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (eventError) {
        console.error('❌ Error fetching events:', eventError.message);
    } else {
        if (events.length === 0) {
            console.log('⚠️ No events found.');
        } else {
            events.forEach(e => {
                console.log(`ID: ${e.id}`);
                console.log(`   Type: ${e.event_type}`);
                console.log(`   Session: ${e.session_id}`);
                console.log(`   Path: ${e.page_path}`);
                console.log(`   Data: ${JSON.stringify(e.event_data)}`);
                console.log(`   Time: ${e.created_at}`);
                console.log('');
            });
        }
    }
}

verifyAnalytics();
