const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jqrwunmxblzebmvmugju.supabase.co';
const supabaseKey = 'sb_secret_ZPIheI3ABG95W023aiBDKQ_OYRSK0zO';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    console.log('Checking for orders with high total_amount...');

    const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, status')
        .order('total_amount', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    console.log('Top 10 Orders by Total Amount:');
    orders.forEach(o => {
        console.log(`ID: ${o.id}, Amount: ${o.total_amount}, Date: ${o.created_at}, Status: ${o.status}`);
    });

    // Check total revenue for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentOrders, error: recentError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .neq('status', 'CANCELLED');

    if (recentError) {
        console.error('Error fetching recent orders:', recentError);
        return;
    }

    const totalRevenue = recentOrders.reduce((sum, o) => sum + o.total_amount, 0);
    console.log(`\nTotal Revenue (Last 30 Days): ${totalRevenue}`);
}

checkOrders();
