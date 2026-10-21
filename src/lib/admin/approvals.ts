import "server-only";
import { revalidateTag } from "next/cache";
import { getContentType } from "@/lib/content/config";
import { CONTENT_TAG } from "@/lib/content/repository";
import { sendEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { audit, type Staff } from "./staff";

/**
 * Actions soumises à la validation de la présidence.
 * Chaque type déclare comment l'exécuter une fois approuvé (avec la clé service_role,
 * puisque la présidence a donné son accord).
 */
type Executor = (payload: Record<string, unknown>, requestedBy: string | null) => Promise<string | null>;

const executors: Record<string, Executor> = {
  /** Publication d'un document officiel déjà déposé dans le stockage privé. */
  "document.publish": async (p, requestedBy) => {
    const { error } = await createAdminClient()
      .from("documents")
      .insert({
        title: String(p.title),
        description: (p.description as string | null) ?? null,
        audience: p.audience === "user" ? "user" : "members",
        recipient_id: p.audience === "user" ? String(p.recipientId) : null,
        file_path: String(p.filePath),
        file_name: String(p.fileName),
        created_by: requestedBy,
      });
    return error ? error.message : null;
  },

  /** Création ou modification d'un contenu du site (ligne déjà validée par toRow). */
  "content.save": async (p) => {
    const type = getContentType(String(p.type));
    if (!type) return "Type de contenu inconnu.";
    const db = createAdminClient().from(type.table as "posts");
    const row = p.row as never;
    const { error } = p.id ? await db.update(row).eq("id", String(p.id)) : await db.insert(row);
    if (!error) revalidateTag(CONTENT_TAG);
    return error ? error.message : null;
  },

  /** Paramètre du site (coordonnées, menus, diaporama, textes), déjà validé. */
  "settings.save": async (p, requestedBy) => {
    const { error } = await createAdminClient()
      .from("site_settings")
      .upsert({ key: String(p.key), value: p.value as never, updated_by: requestedBy }, { onConflict: "key" });
    if (!error) revalidateTag(CONTENT_TAG);
    return error ? error.message : null;
  },

  "content.delete": async (p) => {
    const type = getContentType(String(p.type));
    if (!type) return "Type de contenu inconnu.";
    const { error } = await createAdminClient().from(type.table as "posts").delete().eq("id", String(p.id));
    if (!error) revalidateTag(CONTENT_TAG);
    return error ? error.message : null;
  },
};

/** Libellés des types de demande, affichés dans la file de validation. */
export const approvalKindLabels: Record<string, string> = {
  "document.publish": "Publication d'un document",
  "content.save": "Contenu du site",
  "content.delete": "Suppression d'un contenu",
  "settings.save": "Paramètres du site",
};

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Crée une demande de validation ; la présidence est notifiée (espace + e-mail). */
export async function requestApproval(staff: Staff, kind: keyof typeof executors, title: string, summary: string, payload: Record<string, unknown>) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("approval_requests")
    .insert({ kind, title, summary, payload: payload as never, requested_by: staff.user.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await audit(staff, "validation.demandee", kind, data.id, { title });
  const { data: presidency } = await admin.from("profiles").select("email").in("role", ["admin", "super_admin"]).eq("is_active", true);
  const author = staff.profile.full_name ?? staff.profile.email;
  await sendEmail({
    to: (presidency ?? []).map((p) => p.email).filter((e) => e !== staff.profile.email),
    subject: `[KTGW] À valider : ${title}`,
    text: `${author} (${staff.position?.name ?? "équipe"}) demande votre validation.\n\n${title}\n${summary}\n\nValider ou refuser : ${site()}/admin/validations`,
  });
  return data.id;
}

/** Exécute une demande approuvée. Renvoie un message d'erreur, ou null si tout s'est bien passé. */
export async function executeApproval(kind: string, payload: Record<string, unknown>, requestedBy: string | null) {
  const run = executors[kind];
  if (!run) return "Type de demande inconnu.";
  return run(payload, requestedBy);
}
