import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Small key/value settings store (app_settings table), service-role access only.
 * Values are JSONB; helpers below cover the current single use case.
 */
export async function getAppSettingValue<T = Record<string, unknown>>(key: string): Promise<T | null> {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return null;
  return (data.value as T) ?? null;
}

export async function setAppSettingValue(key: string, value: Record<string, unknown>) {
  const { error } = await supabaseAdmin
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date() }, { onConflict: 'key' });
  return { error };
}

/** Dashboard-configured operator alert address, falling back to env. */
export async function getCancellationAlertEmail(): Promise<string> {
  const setting = await getAppSettingValue<{ email?: string }>('cancellation_alert_email');
  const fromDb = String(setting?.email || '').trim();
  if (fromDb) return fromDb;
  return String(process.env.BOOKING_ALERT_EMAIL || process.env.ADMIN_LOGIN_ALERT_EMAIL || '').trim();
}
