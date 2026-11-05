import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function testVault() {
  console.log('Testing set_app_secret...');
  const { error: err1 } = await client.rpc('set_app_secret', { p_name: 'test_key', p_secret: 'val_123' });
  if (err1) throw err1;
  const { data: val, error: err2 } = await client.rpc('get_app_secret', { p_name: 'test_key' });
  if (err2) throw err2;
  console.log('Read secret:', val);
  const { error: err3 } = await client.rpc('delete_app_secret', { p_name: 'test_key' });
  if (err3) throw err3;
  console.log('Deleted secret successfully!');
}

testVault().catch(err => {
  console.error('Vault test error:', err);
  process.exit(1);
});

