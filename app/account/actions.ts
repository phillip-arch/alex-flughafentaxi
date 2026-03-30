'use server';

import { Resend } from 'resend';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildPassengerCancellationEmailHtml } from '@/lib/booking/passengerEmail';
import { ReviewSchema } from '@/lib/validation/schemas';

const ProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
});

const FavoriteSchema = z.object({
  label: z.enum(['home', 'office', 'extra']),
  city: z.string().trim().min(2).max(80),
  zip: z.string().trim().regex(/^\d{1,4}$/),
  street: z.string().trim().min(2).max(120),
  house_number: z.string().trim().min(1).max(20),
});

export async function loadFavoriteAddresses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabaseAdmin
    .from('saved_addresses')
    .select('id, city, zip, street, house_number, label')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('loadFavoriteAddresses failed:', error);
    return { error: 'Favoriten konnten nicht geladen werden.' };
  }

  return { favorites: (data || []) as any[] };
}

export async function loadAccountBookings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, booking_reference, pickup_at, pickup, destination, status, price, driver_id, confirm_token, full_name, phone, email, passengers, luggage, vehicle_type, notes',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('loadAccountBookings failed:', error);
    return { error: 'Buchungsverlauf konnte nicht geladen werden.' };
  }

  const bookings = (data || []) as any[];
  const bookingIds = bookings.map((booking) => booking.id).filter(Boolean);

  if (bookingIds.length === 0) {
    return { bookings };
  }

  const { data: reviews, error: reviewsError } = await supabaseAdmin
    .from('reviews')
    .select('booking_id, rating, comment, user_id')
    .eq('user_id', user.id)
    .in('booking_id', bookingIds);

  if (reviewsError) {
    console.error('loadAccountBookings reviews failed:', reviewsError);
    return { bookings };
  }

  const reviewMap = new Map(
    ((reviews || []) as Array<{ booking_id: string; rating: number; comment: string | null }>).map(
      (review) => [review.booking_id, review],
    ),
  );

  return {
    bookings: bookings.map((booking) => {
      const review = reviewMap.get(booking.id);
      return {
        ...booking,
        review_rating: review?.rating ?? null,
        review_comment: review?.comment ?? null,
      };
    }),
  };
}

export async function updateAccountProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const parsed = ProfileSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
  });

  if (!parsed.success) return { error: 'Bitte Name und Telefonnummer korrekt eingeben.' };

  const payload = {
    id: user.id,
    email: user.email || '',
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
  };

  // First try least-privilege path with the authenticated user client.
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      email: payload.email,
      full_name: payload.full_name,
      phone: payload.phone,
    })
    .eq('id', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    if (error.code === '42501') {
      console.error('updateAccountProfile RLS policy error:', error);
      return { error: 'Profil konnte wegen fehlender Berechtigung nicht gespeichert werden.' };
    }
    console.error('updateAccountProfile failed:', error);
    return { error: 'Profil konnte nicht gespeichert werden.' };
  }

  // If profile row does not exist, safely create it via service role for this authenticated user only.
  if (!updatedProfile) {
    const { error: upsertError } = await supabaseAdmin.from('profiles').upsert(payload, { onConflict: 'id' });
    if (upsertError) {
      console.error('updateAccountProfile admin upsert failed:', upsertError);
      return { error: 'Profil konnte nicht gespeichert werden.' };
    }
  }

  revalidatePath('/account');
  revalidatePath('/book');
  return { success: true };
}

export async function addFavoriteAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const parsed = FavoriteSchema.safeParse({
    label: formData.get('label'),
    city: formData.get('city'),
    zip: formData.get('zip'),
    street: formData.get('street'),
    house_number: formData.get('house_number'),
  });

  if (!parsed.success) return { error: 'Bitte Favorit korrekt eingeben.' };

  const existingByLabel = await supabaseAdmin
    .from('saved_addresses')
    .select('id')
    .eq('user_id', user.id)
    .eq('label', parsed.data.label)
    .maybeSingle();

  if (existingByLabel.error) {
    console.error('addFavoriteAddress existing lookup failed:', existingByLabel.error);
    return { error: 'Favorit konnte nicht gespeichert werden.' };
  }

  const favoritePayload = {
    user_id: user.id,
    label: parsed.data.label,
    city: parsed.data.city,
    zip: parsed.data.zip,
    street: parsed.data.street,
    house_number: parsed.data.house_number,
  };

  const favoriteQuery = existingByLabel.data?.id
    ? supabaseAdmin
        .from('saved_addresses')
        .update(favoritePayload)
        .eq('id', existingByLabel.data.id)
    : supabaseAdmin.from('saved_addresses').insert(favoritePayload);

  const { data, error } = await favoriteQuery
    .select('id, city, zip, street, house_number, label')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Diese Adresse existiert bereits.' };
    if (error.code === '42P01') return { error: 'Datenbank-Tabelle saved_addresses fehlt. Bitte Migration ausfuehren.' };
    console.error('addFavoriteAddress failed:', error);
    return { error: 'Favorit konnte nicht gespeichert werden.' };
  }

  revalidatePath('/account');
  revalidatePath('/book');
  return { success: true, favorite: data };
}

export async function deleteFavoriteAddress(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabaseAdmin
    .from('saved_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('deleteFavoriteAddress failed:', error);
    return { error: 'Favorit konnte nicht gelöscht werden.' };
  }

  revalidatePath('/account');
  revalidatePath('/book');
  return { success: true };
}

export async function cancelOwnBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const id = (bookingId || '').trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return { error: 'Ungueltige Buchungs-ID.' };
  }

  const { data: existing, error: existingError } = await supabase
    .from('bookings')
    .select('id, status, driver_id, booking_reference, pickup_at, full_name, email, pickup, destination, vehicle_type, price')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingError) {
    console.error('cancelOwnBooking read failed:', existingError);
    return { error: 'Buchung konnte nicht storniert werden.' };
  }

  if (!existing) {
    return { error: 'Buchung nicht gefunden.' };
  }

  const status = String(existing.status || '').toLowerCase();
  const isSentToDriver = Boolean((existing as any).driver_id);
  if (isSentToDriver) {
    return { error: 'Diese Buchung wurde bereits an einen Fahrer gesendet und kann nicht mehr storniert werden.' };
  }
  if (status === 'canceled' || status === 'cancelled') {
    return { success: true, status: existing.status, info: 'already_canceled' as const };
  }
  if (status === 'completed') {
    return { error: 'Abgeschlossene Fahrten koennen nicht storniert werden.' };
  }

  // Same cancellation cutoffs as booking lead-time rules:
  // 07:00-22:00 => at least 3h before pickup, 22:00-07:00 => at least 8h before pickup.
  const pickupDate = new Date(String((existing as any).pickup_at || ''));
  if (!Number.isNaN(pickupDate.getTime())) {
    const pickupHourVienna = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Vienna',
        hour: '2-digit',
        hour12: false,
      })
        .formatToParts(pickupDate)
        .find((part) => part.type === 'hour')?.value ?? '0',
    );
    const isNightTime = pickupHourVienna >= 22 || pickupHourVienna < 7;
    const minLeadTimeHours = isNightTime ? 8 : 3;
    const cutoff = new Date(Date.now() + minLeadTimeHours * 60 * 60 * 1000);
    if (pickupDate < cutoff) {
      return {
        error: isNightTime
          ? 'Stornierung ist fuer Fahrten zwischen 22:00 und 07:00 Uhr nur bis 8 Stunden vor Abholzeit moeglich.'
          : 'Stornierung ist nur bis 3 Stunden vor Abholzeit moeglich.',
      };
    }
  }

  let finalStatus = 'canceled';
  let updated = false;
  for (const candidate of ['canceled', 'cancelled']) {
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: candidate })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!updateError) {
      finalStatus = candidate;
      updated = true;
      break;
    }

    if (String(updateError.code || '') === '23514') {
      continue;
    }

    console.error('cancelOwnBooking update failed:', updateError);
    return { error: 'Buchung konnte nicht storniert werden.' };
  }

  if (!updated) {
    return { error: 'Buchung konnte nicht storniert werden.' };
  }

  if (process.env.RESEND_API_KEY && existing.email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const { error: emailError } = await resend.emails.send({
        from,
        to: existing.email,
        subject: 'Ihre Fahrt wurde storniert',
        html: buildPassengerCancellationEmailHtml({
          fullName: existing.full_name,
          bookingReference: existing.booking_reference,
          pickup: existing.pickup,
          destination: existing.destination,
          pickupAt: existing.pickup_at,
          vehicleType: existing.vehicle_type,
          price: existing.price,
        }),
      });

      if (emailError) {
        console.error('cancelOwnBooking email failed:', emailError);
      }
    } catch (error) {
      console.error('cancelOwnBooking email exception:', error);
    }
  }

  revalidatePath('/account');
  return { success: true, status: finalStatus };
}

export async function deleteOwnAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  if (process.env.RESEND_API_KEY && user.email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const { error: emailError } = await resend.emails.send({
        from,
        to: user.email,
        subject: 'Ihr Konto wurde geloescht',
        html: `
          <div style="margin:0;padding:24px;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d2d2d7;border-radius:24px;overflow:hidden;">
              <tr>
                <td style="padding:28px;">
                  <div style="font-size:12px;letter-spacing:.08em;color:#86868b;font-weight:600;text-transform:uppercase;margin-bottom:8px;">Alex Flughafentaxi</div>
                  <h1 style="margin:0 0 12px 0;font-size:28px;line-height:1.2;font-weight:700;color:#1d1d1f;">Ihr Konto wurde geloescht</h1>
                  <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#5f6368;">
                    Ihr Login, Profil und Ihre Favoriten wurden entfernt.
                  </p>
                  <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#5f6368;">
                    Vorhandene Buchungen bleiben fuer interne und buchhalterische Zwecke erhalten, aber E-Mail-Adresse und Telefonnummer wurden daraus entfernt.
                  </p>
                  <p style="margin:0;font-size:16px;line-height:1.6;color:#5f6368;">
                    Falls Sie diese Loeschung nicht selbst ausgeloest haben, kontaktieren Sie uns bitte umgehend.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        `,
      });

      if (emailError) {
        console.error('deleteOwnAccount email failed:', emailError);
      }
    } catch (error) {
      console.error('deleteOwnAccount email exception:', error);
    }
  }

  const { error: anonymizeBookingsError } = await supabaseAdmin
    .from('bookings')
    .update({
      email: null,
      phone: null,
    })
    .eq('user_id', user.id);

  if (anonymizeBookingsError) {
    console.error('deleteOwnAccount anonymize bookings failed:', anonymizeBookingsError);
    return {
      error:
        'Konto konnte nicht geloescht werden. Bitte zuerst die Supabase-SQL fuer nullable booking email/phone ausfuehren.',
    };
  }

  const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
    actor_user_id: user.id,
    action: 'DELETE_ACCOUNT',
    entity: 'profiles',
    entity_id: user.id,
    meta: {
      retained_booking_name: true,
      cleared_booking_email: true,
      cleared_booking_phone: true,
    },
  });

  if (auditError) {
    console.error('deleteOwnAccount audit log failed:', auditError);
  }

  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    console.error('deleteOwnAccount delete user failed:', deleteUserError);
    return { error: 'Konto konnte nicht geloescht werden.' };
  }

  revalidatePath('/');
  revalidatePath('/account');
  revalidatePath('/book');
  return { success: true };
}

export async function submitBookingReview(input: {
  bookingId: string;
  rating: number;
  comment?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const parsed = ReviewSchema.safeParse({
    bookingId: input.bookingId,
    rating: input.rating,
    comment: input.comment?.trim() || undefined,
  });

  if (!parsed.success) {
    return { error: 'Bitte geben Sie eine gueltige Bewertung ein.' };
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, driver_id')
    .eq('id', parsed.data.bookingId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (bookingError) {
    console.error('submitBookingReview booking lookup failed:', bookingError);
    return { error: 'Buchung konnte nicht gefunden werden.' };
  }

  if (!booking) {
    return { error: 'Buchung nicht gefunden.' };
  }

  const { data: existingReview, error: existingReviewError } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('booking_id', parsed.data.bookingId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingReviewError) {
    console.error('submitBookingReview existing review lookup failed:', existingReviewError);
    return { error: 'Bewertung konnte nicht gespeichert werden.' };
  }

  if (existingReview?.id) {
    const { error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
        driver_id: booking.driver_id || null,
      })
      .eq('id', existingReview.id);

    if (updateError) {
      console.error('submitBookingReview update failed:', updateError);
      return { error: 'Bewertung konnte nicht aktualisiert werden.' };
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from('reviews').insert({
      booking_id: parsed.data.bookingId,
      user_id: user.id,
      driver_id: booking.driver_id || null,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    });

    if (insertError) {
      console.error('submitBookingReview insert failed:', insertError);
      return { error: 'Bewertung konnte nicht gespeichert werden.' };
    }
  }

  revalidatePath('/account');
  return {
    success: true,
    review: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || '',
    },
  };
}
