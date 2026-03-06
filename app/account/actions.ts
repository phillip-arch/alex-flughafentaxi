'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const ProfileSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
});

const FavoriteSchema = z.object({
  name: z.string().trim().min(2).max(40),
  city: z.string().trim().min(2).max(80),
  zip: z.string().trim().regex(/^\d{1,4}$/),
  street: z.string().trim().min(2).max(120),
  house_number: z.string().trim().min(1).max(20),
});

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
    name: formData.get('name'),
    city: formData.get('city'),
    zip: formData.get('zip'),
    street: formData.get('street'),
    house_number: formData.get('house_number'),
  });

  if (!parsed.success) return { error: 'Bitte Favorit korrekt eingeben.' };

  const { count } = await supabase
    .from('saved_addresses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count || 0) >= 3) {
    return { error: 'Maximal 3 Favoriten erlaubt.' };
  }

  const { data, error } = await supabase
    .from('saved_addresses')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      city: parsed.data.city,
      zip: parsed.data.zip,
      street: parsed.data.street,
      house_number: parsed.data.house_number,
    })
    .select('id, name, city, zip, street, house_number')
    .single();

  if (error) {
    if (error.code === '23505') return { error: 'Dieser Favoriten-Name existiert bereits.' };
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

  const { error } = await supabase
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
