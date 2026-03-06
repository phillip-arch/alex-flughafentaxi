
import { supabase } from './lib/supabase';

async function checkTables() {
  console.log('Checking zip_prices table...');
  const { data: prices, error: pricesError } = await supabase.from('zip_prices').select('*').limit(1);
  if (pricesError) console.error('Error zip_prices:', pricesError);
  else console.log('Zip Prices sample:', prices);
}

checkTables();
