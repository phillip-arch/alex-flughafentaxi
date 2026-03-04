import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStreets() {
  const { count, error } = await supabase
    .from('streets')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error counting streets:', error);
  } else {
    console.log('Total streets:', count);
  }

  const { data: cities, error: cityError } = await supabase
    .from('streets')
    .select('city')
    .limit(10);
  
  if (cityError) {
    console.error('Error fetching sample cities:', cityError);
  } else {
    console.log('Sample cities:', cities);
  }
}

checkStreets();
