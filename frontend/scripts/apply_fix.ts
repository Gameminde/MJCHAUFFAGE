import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = 'postgresql://postgres:Sychopathe01%23@[2a05:d018:135e:1640:8787:69db:2b20:2378]:5432/postgres';

async function applyFix() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.join(process.cwd(), '..', 'COMPLETE_FIX.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);
        console.log('SQL executed successfully.');

    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

applyFix();
