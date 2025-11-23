const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars from .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Reading .env.local from:', envPath);

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
} else {
    console.error('.env.local not found at:', envPath);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    console.log('Found keys:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking schema...');

    const tables = ['service_requests', 'customers', 'orders'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
        } else if (data && data.length > 0) {
            console.log('Columns found in first row:', Object.keys(data[0]));
        } else {
            console.log('Table is empty or no access. Cannot infer columns from data.');
        }
    }
}

checkSchema();
