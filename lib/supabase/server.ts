import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Environment-based cookie security
            const vercelEnv = process.env.VERCEL_ENV; // 'production' | 'preview' | 'development' | undefined
            
            // Auto-detect AI Studio preview environment if APP_ENV not explicitly set
            const appEnv = process.env.APP_ENV || (process.env.NEXT_PUBLIC_APP_URL?.includes('.run.app') ? 'preview' : undefined);

            const isVercelProd = vercelEnv === 'production';
            const isIframePreview = vercelEnv === 'preview' || appEnv === 'preview';

            // SameSite logic
            const sameSiteAttribute: 'lax' | 'none' = isVercelProd ? 'lax' : (isIframePreview ? 'none' : 'lax');

            // Secure logic
            const isLocalhost = process.env.NODE_ENV !== 'production' && !vercelEnv && !process.env.NEXT_PUBLIC_APP_URL?.startsWith('https');
            const secureAttribute = isLocalhost ? false : true;

            cookieStore.set({ 
              name, 
              value, 
              ...options,
              sameSite: sameSiteAttribute,
              secure: secureAttribute,
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
