import { supabaseAdmin } from '@/lib/supabase/admin';

type ClaimInput = {
  userId: string;
  email?: string | null;
  emailConfirmedAt?: string | null;
  confirmedAt?: string | null;
};

export async function claimGuestBookingsForUser(input: ClaimInput) {
  const userEmail = String(input.email || '').trim();
  const isEmailVerified = Boolean(input.emailConfirmedAt || input.confirmedAt);

  if (!input.userId || !userEmail || !isEmailVerified) return;

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ user_id: input.userId })
    .is('user_id', null)
    .ilike('email', userEmail);

  if (error) {
    // Never block auth/account flow if claiming fails.
    console.error('Guest booking claim failed:', error);
  }
}

