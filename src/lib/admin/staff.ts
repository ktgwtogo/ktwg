import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMember, type Member } from "@/lib/member/session";
import { can, isPresidency, type Permission } from "./permissions";

/** Membre de l'équipe connecté, avec son poste et ses permissions. Nul hors équipe. */
export const getStaff = cache(async () => {
  const member = await getMember();
  if (!member || !member.profile.is_active) return null;
  const { profile, supabase } = member;
  const presidency = isPresidency(profile.role);
  const { data: position } = profile.position_id
    ? await supabase.from("positions").select("id, name, permissions").eq("id", profile.position_id).maybeSingle()
    : { data: null };
  if (!presidency && !position) return null;
  const permissions = position?.permissions ?? [];
  return {
    ...member,
    position,
    presidency,
    permissions,
    can: (p: Permission) => can(profile, permissions, p),
  };
});

export type Staff = NonNullable<Awaited<ReturnType<typeof getStaff>>>;

/** Trace une action dans le journal (lu par la présidence uniquement). */
export async function audit(actor: Member | Staff, action: string, entity: string, entityId?: string | null, details: Record<string, unknown> = {}) {
  const { error } = await createAdminClient()
    .from("audit_log")
    .insert({ actor_id: actor.user.id, action, entity, entity_id: entityId ?? null, details: details as never });
  if (error) console.error("[audit]", error.message);
}
