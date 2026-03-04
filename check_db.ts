
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('Checking streets table...');
  const { data: streets, error: streetsError } = await supabase.from('streets').select('*').limit(1);
  if (streetsError) console.error('Error streets:', streetsError);
  else console.log('Streets sample:', streets);

  console.log('Checking zip_prices table...');
  const { data: prices, error: pricesError } = await supabase.from('zip_prices').select('*').limit(1);
  if (pricesError) console.error('Error zip_prices:', pricesError);
  else console.log('Zip Prices sample:', prices);
}

checkTables();
