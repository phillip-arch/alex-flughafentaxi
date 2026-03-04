import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking auth_rate_limits table...');
  
  const { data, error } = await supabase
    .from('auth_rate_limits')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error accessing auth_rate_limits:', error);
  } else {
    console.log('Success! Table exists. Data:', data);
  }
}

checkTable();
