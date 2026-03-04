import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Check if table exists
    const { error: checkError } = await supabase
      .from('auth_rate_limits')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') { // undefined_table
      console.log('Table auth_rate_limits does not exist. Creating...');
      
      // Create table via SQL
      // Note: This requires the service role key to have permission to run SQL, 
      // which it usually doesn't via the JS client directly unless using rpc or specific setup.
      // However, we can try to use the `rpc` if we have a function, or just use the JS client to create it if we were using a different adapter.
      // But Supabase JS client cannot run raw SQL directly without a function.
      
      return NextResponse.json({ error: 'Table auth_rate_limits missing. Please run SQL in Supabase dashboard.' }, { status: 500 });
    } else if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Table auth_rate_limits exists.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
