const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jqrwunmxblzebmvmugju.supabase.co';
const supabaseKey = 'sb_secret_ZPIheI3ABG95W023aiBDKQ_OYRSK0zO';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrderItems(orderId) {
    console.log(`Checking items for order: ${orderId}`);

    const { data: items, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

    if (error) {
        console.error('Error fetching order items:', error);
        return;
    }

    console.log('Order Items:');
    items.forEach(item => {
        console.log(`Product ID: ${item.product_id}, Quantity: ${item.quantity}, Price: ${item.price}, Total: ${item.quantity * item.price}`);
    });
}

checkOrderItems('5c2345ad-9ba8-40cc-a1f8-e033d093fab6');
