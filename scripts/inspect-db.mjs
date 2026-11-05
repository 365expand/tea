import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function inspect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const dbInfo = await client.query('SELECT current_database(), current_user, version()');
  console.log('Connected to DB:', dbInfo.rows[0].current_database, 'as user:', dbInfo.rows[0].current_user);

  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  console.log(`Existing public tables (${tables.rows.length}):`, tables.rows.map(r => r.table_name));

  try {
    const buckets = await client.query("SELECT id, name, public FROM storage.buckets");
    console.log(`Existing storage buckets (${buckets.rows.length}):`, buckets.rows);
  } catch (err) {
    console.log('Could not query storage.buckets:', err.message);
  }

  await client.end();
}

inspect().catch(err => {
  console.error('Inspect error:', err);
  process.exit(1);
});

