import "server-only";
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
};

/** Libellés des types de demande, affichés dans la file de validation. */
export const approvalKindLabels: Record<string, string> = {
  "document.publish": "Publication d'un document",
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
