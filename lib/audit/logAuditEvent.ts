import { supabaseAdmin } from '@/lib/supabase/admin';

type AuditActor = {
  id?: string | null;
  email?: string | null;
};

type AuditEventInput = {
  actor?: AuditActor | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
};

export async function logAuditEvent(input: AuditEventInput) {
  try {
    const meta = {
      actorEmail: input.actor?.email || null,
      ...input.meta,
    };

    const payload = {
      actor_user_id: input.actor?.id || null,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId || null,
      meta,
    };

    const { error } = await supabaseAdmin.from('audit_logs').insert(payload);

    if (error) {
      console.error('logAuditEvent failed:', error);
    }
  } catch (error) {
    console.error('logAuditEvent threw:', error);
  }
}
