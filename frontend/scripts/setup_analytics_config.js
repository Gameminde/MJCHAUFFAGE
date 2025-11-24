const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
    user: 'postgres.jqrwunmxblzebmvmugju',
    password: 'Sychopathe01#',
    host: 'aws-0-eu-west-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
};

async function setupDatabase() {
    console.log('Connecting to database with config:', { ...config, password: '***' });
    const client = new Client(config);

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
