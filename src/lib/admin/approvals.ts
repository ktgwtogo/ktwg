import "server-only";
import { revalidateTag } from "next/cache";
import { getContentType } from "@/lib/content/config";
import { CONTENT_TAG } from "@/lib/content/repository";
import { mailboxMail } from "@/lib/email/messages";
import { sendBatch, sendEmail } from "@/lib/email/send";
import { renderEmail } from "@/lib/email/template";
import { categoryLabel } from "./mailbox";
import { operationLabels, rejectOperation, runOperation, type OperationName } from "./operations";
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
    const admin = createAdminClient();
    const audience = p.audience === "user" ? "user" : p.audience === "accounts" ? "accounts" : "members";
    const { data: doc, error } = await admin
      .from("documents")
      .insert({
        title: String(p.title),
        description: (p.description as string | null) ?? null,
        body: (p.body as string | null) ?? null,
        category: String(p.category ?? "document"),
        audience,
        recipient_id: audience === "user" ? String(p.recipientId) : null,
        file_path: (p.filePath as string | null) ?? null,
        file_name: (p.fileName as string | null) ?? null,
        created_by: requestedBy,
      })
      .select("id")
      .single();
    if (error) return error.message;

    // Avis par e-mail aux destinataires (en plus de la notification dans leur espace).
    if (p.sendEmail !== false) {
      let recipients: { email: string }[];
      if (audience === "user") {
        const { data } = await admin.from("profiles").select("email").eq("id", String(p.recipientId)).maybeSingle();
        recipients = data ? [data] : [];
      } else recipients = await resolveAudience(audience === "accounts" ? "comptes" : "membres");
      const mail = mailboxMail({
        category: categoryLabel(String(p.category ?? "document")),
        title: String(p.title),
        description: (p.description as string | null) ?? null,
        body: (p.body as string | null) ?? null,
        hasFile: Boolean(p.filePath),
      });
      const { html, text } = await renderEmail(mail.content);
      const sent = await sendBatch(recipients.map((r) => ({ to: r.email, subject: mail.subject, text, html })));
      await admin.from("documents").update({ emailed_count: sent }).eq("id", doc.id);
    }
    return null;
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

  /** Opération interne du bureau (adhésion, carte, dossier, trésorerie…) validée par la présidence. */
  operation: async (p, requestedBy) => runOperation(String(p.op), (p.args as Record<string, unknown>) ?? {}, requestedBy),

  /** E-mail groupé préparé dans « Communication » : envoi individuel à chaque destinataire. */
  "mailing.send": async (p) => {
    const admin = createAdminClient();
    const { data: mailing } = await admin.from("mailings").select("*").eq("id", String(p.mailingId)).maybeSingle();
    if (!mailing || mailing.status !== "en_attente") return "Envoi introuvable ou déjà traité.";
    const recipients = await resolveAudience(mailing.audience);
    // Mise en page au modèle KTGW ; les adresses https:// du message deviennent un bouton si c'est le dernier paragraphe.
    const paragraphs = mailing.body.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
    const last = paragraphs.at(-1) ?? "";
    const cta = /^https:\/\/\S+$/.test(last) ? { label: "Lire la suite", href: last } : undefined;
    const content = { title: mailing.subject, paragraphs: cta ? paragraphs.slice(0, -1) : paragraphs, cta };
    const base = await renderEmail(content);
    const messages = await Promise.all(
      recipients.map(async (r) => {
        const { html, text } = r.token
          ? await renderEmail({ ...content, note: `Se désinscrire de la newsletter : ${site()}/api/newsletter?action=unsubscribe&token=${r.token}` })
          : base;
        return { to: r.email, subject: mailing.subject, text, html };
      })
    );
    const sent = await sendBatch(messages);
    await admin
      .from("mailings")
      .update({ status: sent > 0 || !recipients.length ? "envoye" : "echec", recipients_count: sent, sent_at: new Date().toISOString() })
      .eq("id", mailing.id);
    return recipients.length && !sent ? "Aucun e-mail n'a pu partir (vérifiez la clé Resend et EMAIL_FROM)." : null;
  },

  /** Rapport d'activité validé : diffusé aux postes destinataires (e-mail individuel + notification). */
  "report.publish": async (p) => {
    const admin = createAdminClient();
    const { data: report } = await admin.from("reports").select("*").eq("id", String(p.reportId)).maybeSingle();
    if (!report) return "Rapport introuvable.";
    const { error } = await admin.from("reports").update({ status: "valide", validated_at: new Date().toISOString() }).eq("id", report.id);
    if (error) return error.message;

    let q = admin.from("profiles").select("id, email, full_name, position_id").neq("role", "member").eq("is_active", true);
    if (report.audience.length) q = q.in("position_id", [...report.audience, "president"]);
    const { data: readers } = await q;
    const list = (readers ?? []).filter((r) => r.id !== report.author_id);
    if (list.length) {
      await admin.from("notifications").insert(
        list.map((r) => ({ user_id: r.id, title: `Rapport : ${report.title}`, body: report.summary, link: "/admin/rapports" }))
      );
      await sendBatch(
        list.map((r) => ({
          to: r.email,
          subject: `[KTGW] Rapport d'activité : ${report.title}`,
          text: `Bonjour${r.full_name ? ` ${r.full_name}` : ""},\n\nUn rapport validé par la présidence est disponible${report.period ? ` (${report.period})` : ""}.\n\n${report.title}\n${report.summary}\n\nLe consulter : ${site()}/admin/rapports\n\nKTGW Togo`,
        }))
      );
    }
    return null;
  },
};

/** Ce qui se passe quand la présidence refuse une demande (nettoyage, statut). */
const rejecters: Record<string, (payload: Record<string, unknown>) => Promise<void>> = {
  operation: async (p) => rejectOperation(String(p.op), (p.args as Record<string, unknown>) ?? {}),
  "document.publish": async (p) => {
    if (p.filePath) await createAdminClient().storage.from("documents").remove([String(p.filePath)]);
  },
  "mailing.send": async (p) => {
    await createAdminClient().from("mailings").update({ status: "refuse" }).eq("id", String(p.mailingId));
  },
  "report.publish": async (p) => {
    await createAdminClient().from("reports").update({ status: "refuse" }).eq("id", String(p.reportId));
  },
};

export async function rejectApproval(kind: string, payload: Record<string, unknown>) {
  await rejecters[kind]?.(payload);
}

/** Destinataires d'un public d'e-mail groupé (avec jeton de désinscription pour la newsletter). */
export async function resolveAudience(audience: string): Promise<{ email: string; token?: string }[]> {
  const admin = createAdminClient();
  if (audience === "newsletter") {
    const { data } = await admin.from("newsletter_subscribers").select("email, token").not("confirmed_at", "is", null).is("unsubscribed_at", null);
    return (data ?? []).map((r) => ({ email: r.email, token: r.token }));
  }
  let q = admin.from("profiles").select("email").eq("is_active", true);
  if (audience === "bureau") q = q.neq("role", "member");
  else if (audience.startsWith("membres")) {
    q = q.eq("membership_status", "validee");
    const type = audience.split(":")[1];
    if (type) q = q.eq("membership_type", type as "adherent");
  } else if (audience !== "comptes") return [];
  const { data } = await q;
  return [...new Set((data ?? []).map((r) => r.email))].map((email) => ({ email }));
}

/** Libellés des types de demande, affichés dans la file de validation. */
export const approvalKindLabels: Record<string, string> = {
  "document.publish": "Envoi aux membres (document, annonce…)",
  "content.save": "Contenu du site",
  "content.delete": "Suppression d'un contenu",
  "settings.save": "Paramètres du site",
  operation: "Action du bureau",
  "mailing.send": "E-mail groupé",
  "report.publish": "Rapport d'activité",
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

/**
 * Point de passage de toute action interne du bureau : la présidence l'exécute tout de suite,
 * les autres postes la soumettent à sa validation (rien n'est exécuté avant son accord).
 */
export async function runOrRequest(
  staff: Staff,
  op: OperationName,
  title: string,
  args: Record<string, unknown>
): Promise<{ ok: true; pending?: boolean } | { ok: false; error: string }> {
  if (staff.presidency) {
    const error = await runOperation(op, args, staff.user.id);
    return error ? { ok: false, error } : { ok: true };
  }
  await requestApproval(staff, "operation", title, operationLabels[op], { op, args });
  return { ok: true, pending: true };
}

/** Exécute une demande approuvée. Renvoie un message d'erreur, ou null si tout s'est bien passé. */
export async function executeApproval(kind: string, payload: Record<string, unknown>, requestedBy: string | null) {
  const run = executors[kind];
  if (!run) return "Type de demande inconnu.";
  return run(payload, requestedBy);
}
