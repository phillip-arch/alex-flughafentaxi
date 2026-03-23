'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { claimGuestBookingsForUser } from '@/lib/bookings/claimGuestBookings';
import { cookies, headers } from 'next/headers';
import { isIP } from 'net';
import { Resend } from 'resend';

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

async function getRequestIpAddress() {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const rawIp = forwardedFor ? forwardedFor.split(',')[0].trim() : headersList.get('x-real-ip');
  let ip = rawIp && isIP(rawIp) ? rawIp : 'unknown';

  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip;
}

async function logAuthRateLimitEvent(payload: { ip: string; email: string; action: string }) {
  const { error } = await supabaseAdmin.from('auth_rate_limits').insert({
    ip_address: payload.ip,
    email: payload.email,
    action: payload.action,
  });

  if (error) {
    console.error('Auth rate limit logging failed:', error);
  }
}

async function sendAdminLoginFailureAlert(payload: { email: string; ip: string; reason: string }) {
  const alertRecipient =
    process.env.ADMIN_LOGIN_ALERT_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    '';

  if (!process.env.RESEND_API_KEY || !alertRecipient) return;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const attemptedAt = new Intl.DateTimeFormat('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Vienna',
    }).format(new Date());

    const safeEmail = String(payload.email || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeIp = String(payload.ip || 'unknown').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeReason = String(payload.reason || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const { error } = await resend.emails.send({
      from,
      to: alertRecipient,
      subject: `Dispatch Login fehlgeschlagen (${safeEmail || 'unbekannt'})`,
      html: `
        <div style="margin:0;padding:24px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:28px;">
                <div style="font-size:12px;letter-spacing:.08em;color:#86868b;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Sicherheitswarnung</div>
                <h1 style="margin:0 0 12px 0;font-size:28px;line-height:1.2;font-weight:700;color:#1d1d1f;">Fehlgeschlagener Dispatch-Login</h1>
                <p style="margin:0 0 18px 0;font-size:16px;line-height:1.6;color:#5f6368;">
                  Es wurde ein fehlgeschlagener Login-Versuch auf die Dispatch-Anmeldung erkannt.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f7;border-radius:16px;border:1px solid #e5e5ea;">
                  <tr><td style="padding:16px 18px 8px 18px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#86868b;font-weight:700;">Details</td></tr>
                  <tr><td style="padding:0 18px 10px 18px;font-size:14px;color:#1d1d1f;"><strong>E-Mail:</strong> ${safeEmail || '-'}</td></tr>
                  <tr><td style="padding:0 18px 10px 18px;font-size:14px;color:#1d1d1f;"><strong>IP-Adresse:</strong> ${safeIp}</td></tr>
                  <tr><td style="padding:0 18px 10px 18px;font-size:14px;color:#1d1d1f;"><strong>Zeit:</strong> ${attemptedAt}</td></tr>
                  <tr><td style="padding:0 18px 16px 18px;font-size:14px;color:#1d1d1f;"><strong>Grund:</strong> ${safeReason}</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    if (error) {
      console.error('Admin login alert email failed:', error);
    }
  } catch (error) {
    console.error('Admin login alert email exception:', error);
  }
}

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

  const email = validated.data.email.trim().toLowerCase();
  const password = validated.data.password;

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
    const ip = await getRequestIpAddress();
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // Stricter IP limit for dispatch login
    if (ip !== 'unknown') {
      const { count: ipCount, error: countError } = await supabaseAdmin
        .from('auth_rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .in('action', ['admin_login', 'admin_login_failed'])
        .gte('created_at', fifteenMinsAgo);

      if (countError) {
        console.error('Rate limit check failed:', countError);
      } else if (ipCount && ipCount >= 4) {
        await sendAdminLoginFailureAlert({
          email,
          ip,
          reason: 'Rate limit ausgelÃ¶st (IP)',
        });
        return { error: 'Zu viele Login-Versuche. Bitte warten Sie 15 Minuten.' };
      }
    }

    const { count: emailCount, error: emailCountError } = await supabaseAdmin
      .from('auth_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .in('action', ['admin_login', 'admin_login_failed'])
      .gte('created_at', fifteenMinsAgo);

    if (emailCountError) {
      console.error('Email rate limit check failed:', emailCountError);
    } else if (emailCount && emailCount >= 3) {
      await sendAdminLoginFailureAlert({
        email,
        ip,
        reason: 'Rate limit ausgelÃ¶st (E-Mail)',
      });
      return { error: 'Zu viele Login-Versuche. Bitte warten Sie 15 Minuten.' };
    }

    await logAuthRateLimitEvent({ ip, email, action: 'admin_login' });
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
    const ip = await getRequestIpAddress();
    await logAuthRateLimitEvent({ ip, email, action: 'admin_login_failed' });
    await sendAdminLoginFailureAlert({
      email,
      ip,
      reason: 'Falsche Anmeldedaten oder Benutzer nicht gefunden',
    });
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
    const ip = await getRequestIpAddress();
    await logAuthRateLimitEvent({ ip, email, action: 'admin_login_failed' });
    await sendAdminLoginFailureAlert({
      email,
      ip,
      reason: 'Login erfolgreich, aber ohne Admin-Rolle',
    });
    await supabase.auth.signOut();
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: 'Zugriff verweigert: Unbefugtes Konto' };
  }

  revalidatePath('/', 'layout');
  redirect('/dispatch/dashboard');
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath('/', 'layout');
  redirect('/login');
}
