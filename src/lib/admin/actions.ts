"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import type { ActionResult } from "@/lib/member/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeApproval, requestApproval } from "./approvals";
import { audit, getStaff } from "./staff";

const FORBIDDEN: ActionResult = { ok: false, error: "Cette action ne fait pas partie de votre poste." };
const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const refresh = () => revalidatePath("/[locale]/admin", "layout");

/** Valide ou refuse une demande d'adhésion (secrétariat, présidence), puis prévient la personne. */
export async function decideMembership(applicationId: string, approve: boolean, note: string): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff?.can("members.manage")) return FORBIDDEN;

  const { data: userId, error } = await staff.supabase.rpc("decide_membership", {
    p_application_id: applicationId,
    p_approve: approve,
    p_note: note.slice(0, 1000),
  });
  if (error || !userId) {
    console.error("[admin] décision adhésion", error?.message);
    return { ok: false, error: error?.message.includes("déjà traitée") ? "Cette demande a déjà été traitée." : "La décision n'a pas pu être enregistrée." };
  }
  await audit(staff, approve ? "adhesion.validee" : "adhesion.refusee", "membership_applications", applicationId, { note });

  const { data: person } = await staff.supabase.from("profiles").select("email, first_name").eq("id", userId).maybeSingle();
  if (person) {
    await sendEmail({
      to: [person.email],
      subject: approve ? "Votre adhésion à KTGW Togo est validée" : "Votre demande d'adhésion à KTGW Togo",
      text: `Bonjour${person.first_name ? ` ${person.first_name}` : ""},\n\n${
        approve
          ? "Bonne nouvelle : votre adhésion est validée. Bienvenue dans l'association !"
          : "Votre demande d'adhésion a été examinée par l'association."
      }\nConsultez le détail dans votre espace membre : ${site()}/mon-espace\n\nL'équipe KTGW Togo`,
    });
  }
  refresh();
  return { ok: true };
}

const documentSchema = z.object({
  title: z.string().trim().min(3, "Indiquez un titre.").max(160),
  description: z.string().trim().max(1000).optional(),
  audience: z.enum(["members", "user"]),
  recipientId: z.string().uuid().optional(),
  filePath: z.string().regex(/^[0-9a-f-]{36}\/[^/]+$/, "Fichier invalide."),
  fileName: z.string().trim().min(1).max(200),
});

/**
 * Document officiel déjà déposé dans le stockage privé : publié tout de suite par la présidence,
 * soumis à sa validation pour les autres postes.
 */
export async function publishDocument(raw: unknown): Promise<ActionResult & { pending?: boolean }> {
  const staff = await getStaff();
  if (!staff?.can("documents.manage")) return FORBIDDEN;

  const parsed = documentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  if (v.audience === "user" && !v.recipientId) return { ok: false, error: "Choisissez le ou la destinataire." };
  const payload = { ...v, description: v.description || null };

  if (!staff.presidency) {
    await requestApproval(
      staff,
      "document.publish",
      `Document : ${v.title}`,
      v.audience === "members" ? "Pour tous les membres validés" : "Pour une personne",
      payload
    );
    refresh();
    return { ok: true, pending: true };
  }

  const error = await executeApproval("document.publish", payload, staff.user.id);
  if (error) {
    console.error("[admin] document", error);
    await createAdminClient().storage.from("documents").remove([v.filePath]);
    return { ok: false, error: "La publication a échoué." };
  }
  await audit(staff, "document.publie", "documents", null, { title: v.title, audience: v.audience });
  refresh();
  return { ok: true };
}

/** Suppression d'un document publié (présidence). */
export async function deleteDocument(id: string): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff?.presidency) return FORBIDDEN;
  const admin = createAdminClient();
  const { data: doc } = await admin.from("documents").select("file_path, title").eq("id", id).maybeSingle();
  if (!doc) return { ok: false, error: "Document introuvable." };
  await admin.storage.from("documents").remove([doc.file_path]);
  const { error } = await admin.from("documents").delete().eq("id", id);
  if (error) return { ok: false, error: "La suppression a échoué." };
  await audit(staff, "document.supprime", "documents", id, { title: doc.title });
  refresh();
  return { ok: true };
}

/** Décision de la présidence sur une demande de validation. */
export async function decideApproval(id: string, approve: boolean, note: string): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff?.presidency) return { ok: false, error: "Seule la présidence valide les demandes." };
  const admin = createAdminClient();

  const { data: req } = await admin.from("approval_requests").select("*").eq("id", id).maybeSingle();
  if (!req || req.status !== "en_attente") return { ok: false, error: "Demande introuvable ou déjà traitée." };

  if (approve) {
    const error = await executeApproval(req.kind, req.payload as Record<string, unknown>, req.requested_by);
    if (error) {
      console.error("[admin] exécution validation", error);
      return { ok: false, error: "L'action validée n'a pas pu être exécutée. Réessayez." };
    }
  } else if (req.kind === "document.publish") {
    // Refus : le fichier déposé n'est pas conservé.
    const path = (req.payload as { filePath?: string }).filePath;
    if (path) await admin.storage.from("documents").remove([path]);
  }

  await admin
    .from("approval_requests")
    .update({ status: approve ? "approuvee" : "rejetee", decided_by: staff.user.id, decided_at: new Date().toISOString(), decision_note: note || null })
    .eq("id", id);

  if (req.requested_by) {
    await admin.from("notifications").insert({
      user_id: req.requested_by,
      title: `${approve ? "Validé" : "Refusé"} par la présidence : ${req.title}`,
      body: note || "",
      link: "/admin/validations",
    });
  }
  await audit(staff, approve ? "validation.approuvee" : "validation.refusee", req.kind, id, { title: req.title, note });
  refresh();
  return { ok: true };
}
