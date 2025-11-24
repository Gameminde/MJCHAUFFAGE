const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jqrwunmxblzebmvmugju.supabase.co';
const supabaseKey = 'sb_secret_ZPIheI3ABG95W023aiBDKQ_OYRSK0zO';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsSchema() {
    console.log('Checking products table schema...');

    // Try to select one product with all columns
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching products:', error);
    } else if (data && data.length > 0) {
        console.log('Product columns:', Object.keys(data[0]));

        const hasMinStock = 'min_stock' in data[0];
        const hasIsActive = 'is_active' in data[0];

        console.log('Has min_stock:', hasMinStock);
        console.log('Has is_active:', hasIsActive);
    } else {
        console.log('No products found to check columns.');
    }
}

checkProductsSchema();
