import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking streets table...');
  const { data: streets, error } = await supabase.from('streets').select('zip').eq('city', 'Wien');
  if (error) console.error('Error streets:', error);
  else {
    const uniqueZips = [...new Set(streets.map((item: any) => item.zip))].sort();
    console.log('Unique zips for Wien:', uniqueZips);
  }
}

checkTables();
