const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgres://postgres.jqrwunmxblzebmvmugju:Sychopathe01%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function setupDatabase() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database successfully.');

        const sqlPath = path.join(__dirname, '../../database/analytics_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL schema...');
        await client.query(sql);
        console.log('Schema executed successfully.');

        // Verify tables
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'analytics%'
      ORDER BY table_name;
    `);

        console.log('Created tables:', res.rows.map(r => r.table_name));

    } catch (err) {
        console.error('Error executing script:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
