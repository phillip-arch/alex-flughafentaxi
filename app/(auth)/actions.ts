'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { claimGuestBookingsForUser } from '@/lib/bookings/claimGuestBookings';
import { cookies, headers } from 'next/headers';
import { isIP } from 'net';

import { z } from 'zod';

const AuthSchema = z.object({
  email: z.string().email('Ungültige E-Mail Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
});

const SignupSchema = z.object({
  email: z.string().email('UngÃ¼ltige E-Mail Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Die Passwoerter stimmen nicht ueberein.',
  path: ['confirmPassword'],
});

const ResetSchema = z.object({
  email: z.string().email('Ungültige E-Mail Adresse'),
});

const UpdatePasswordSchema = z.object({
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Die Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const rawEmail = formData.get('email');

  const validated = ResetSchema.safeParse({ email: rawEmail });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Ungültige E-Mail-Adresse' };
  }

  const { email } = validated.data;

  // Rate Limiting (Spam Protection)
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : headersList.get('x-real-ip');
  let ip = rawIp && isIP(rawIp) ? rawIp : 'unknown';
  
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Check IP Limit
  if (ip !== 'unknown') {
    const { count: ipCount } = await supabaseAdmin
      .from('auth_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .eq('action', 'reset_password')
      .gte('created_at', fifteenMinsAgo);

    if (ipCount && ipCount >= 3) {
      return { error: 'Zu viele Anfragen. Bitte warten Sie 15 Minuten.' };
    }
  }

  // Check Email Limit
  const { count: emailCount } = await supabaseAdmin
    .from('auth_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('action', 'reset_password')
    .gte('created_at', fifteenMinsAgo);

  if (emailCount && emailCount >= 3) {
    return { error: 'Zu viele Anfragen. Bitte warten Sie 15 Minuten.' };
  }

  // Log the attempt
  await supabaseAdmin.from('auth_rate_limits').insert({
    ip_address: ip,
    email: email,
    action: 'reset_password'
  });

  // Request Reset
  const appUrlRaw = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appUrl = appUrlRaw.replace(/\/+$/, '');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Dedicated recovery callback avoids ambiguity with normal auth callback.
    redirectTo: `${appUrl}/auth/callback/recovery`,
  });

  if (error) {
    console.error('Password reset error:', error);
  }

  // Always return the same success message to prevent email enumeration
  return { success: 'Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen des Passworts gesendet.' };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const validated = UpdatePasswordSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Ungültiges Passwort' };
  }

  const { password } = validated.data;

  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: 'Fehler beim Aktualisieren des Passworts. Der Link ist möglicherweise abgelaufen.' };
  }

  // Sign out other sessions globally (Supabase v2)
  await supabase.auth.signOut({ scope: 'others' });

  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // 1. Validate Input
  const validated = AuthSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Ungültige Anmeldedaten' };
  }

  const { email, password } = validated.data;

  // Brute-force protection for user login (IP + email).
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : headersList.get('x-real-ip');
    let ip = rawIp && isIP(rawIp) ? rawIp : 'unknown';

    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const ipCountPromise =
      ip !== 'unknown'
        ? supabaseAdmin
            .from('auth_rate_limits')
            .select('*', { count: 'exact', head: true })
            .eq('ip_address', ip)
            .eq('action', 'user_login')
            .gte('created_at', fifteenMinsAgo)
        : Promise.resolve({ count: 0 } as { count: number | null });

    const emailCountPromise = supabaseAdmin
      .from('auth_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .eq('action', 'user_login')
      .gte('created_at', fifteenMinsAgo);

    const [{ count: ipCount }, { count: emailCount }] = await Promise.all([
      ipCountPromise,
      emailCountPromise,
    ]);

    if (ipCount && ipCount >= 8) {
      return { error: 'Zu viele Login-Versuche. Bitte warten Sie 15 Minuten.' };
    }

    if (emailCount && emailCount >= 8) {
      return { error: 'Zu viele Login-Versuche. Bitte warten Sie 15 Minuten.' };
    }

    await supabaseAdmin.from('auth_rate_limits').insert({
      ip_address: ip,
      email,
      action: 'user_login',
    });
  } catch (rateLimitError) {
    // Do not block login when logging/checking rate limit fails.
    console.error('User login rate limit error:', rateLimitError);
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { error: 'E-Mail oder Passwort falsch.' };
  }

  await claimGuestBookingsForUser({
    userId: authData.user.id,
    email: authData.user.email,
    emailConfirmedAt: (authData.user as any).email_confirmed_at,
    confirmedAt: (authData.user as any).confirmed_at,
  });

  revalidatePath('/', 'layout');
  redirect('/account');
}

export async function signup(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };
  const fullName = formData.get('fullName') as string;

  // 1. Validate Input
  const validated = SignupSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Ungültige Anmeldedaten' };
  }

  const email = validated.data.email.trim().toLowerCase();
  const { password } = validated.data;

  const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfileError) {
    console.error('Signup existing profile lookup failed:', existingProfileError);
    return { error: 'Registrierung konnte gerade nicht geprueft werden. Bitte spaeter erneut versuchen.' };
  }

  if (existingProfile?.id) {
    return {
      error:
        'Fuer diese E-Mail-Adresse existiert bereits ein Konto. Bitte melden Sie sich an oder nutzen Sie "Passwort vergessen?".',
    };
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('Signup error:', error);
    if (String(error.message || '').toLowerCase().includes('already')) {
      return {
        error:
          'Fuer diese E-Mail-Adresse existiert bereits ein Konto. Bitte melden Sie sich an oder nutzen Sie "Passwort vergessen?".',
      };
    }
    return { error: 'Registrierung fehlgeschlagen. Bitte pruefen Sie Ihre Eingaben oder versuchen Sie es spaeter erneut.' };
  }

  const createdIdentities = ((signUpData?.user as any)?.identities || []) as unknown[];
  if (signUpData?.user && createdIdentities.length === 0) {
    return {
      error:
        'Fuer diese E-Mail-Adresse existiert bereits ein Konto. Bitte melden Sie sich an oder nutzen Sie "Passwort vergessen?".',
    };
  }

  if (signUpData?.user) {
    await claimGuestBookingsForUser({
      userId: signUpData.user.id,
      email: signUpData.user.email,
      emailConfirmedAt: (signUpData.user as any).email_confirmed_at,
      confirmedAt: (signUpData.user as any).confirmed_at,
    });
  }

  revalidatePath('/', 'layout');
  redirect('/account');
}

export async function adminLogin(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // 1. Validate Input
  const validated = AuthSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || 'Ungültige Anmeldedaten' };
  }

  const { email, password } = validated.data;

  // 1.5 Rate Limiting (Brute Force Protection)
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : headersList.get('x-real-ip');
    let ip = rawIp && isIP(rawIp) ? rawIp : 'unknown';
    
    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // Check IP Limit
    if (ip !== 'unknown') {
      const { count: ipCount, error: countError } = await supabaseAdmin
        .from('auth_rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .eq('action', 'admin_login')
        .gte('created_at', fifteenMinsAgo);

      if (countError) {
        console.error('Rate limit check failed:', countError);
      } else if (ipCount && ipCount >= 5) {
        return { error: 'Zu viele Login-Versuche. Bitte warten Sie 15 Minuten.' };
      }
    }

    // Log the attempt (before checking credentials to count failures)
    const { error: insertError } = await supabaseAdmin.from('auth_rate_limits').insert({
      ip_address: ip,
      email: email,
      action: 'admin_login'
    });

    if (insertError) {
      console.error('Rate limit logging failed:', insertError);
    }
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Continue with login even if rate limiting fails
  }

  // 2. Attempt Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    // Artificial delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: 'Ungültige Anmeldedaten' };
  }

  // 3. Verify Admin Role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    // Not an admin: sign them out immediately
    await supabase.auth.signOut();
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: 'Zugriff verweigert: Unbefugtes Konto' };
  }

  revalidatePath('/', 'layout');
  redirect('/admin/dashboard');
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}
