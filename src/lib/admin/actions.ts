"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/member/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { executeApproval, rejectApproval, requestApproval, runOrRequest } from "./approvals";
import { audienceText, categoryLabel, documentCategories, type DocumentCategory } from "./mailbox";
import { audit, getStaff } from "./staff";

const FORBIDDEN: ActionResult = { ok: false, error: "Cette action ne fait pas partie de votre poste." };
const refresh = () => revalidatePath("/[locale]/admin", "layout");

/** Valide ou refuse une demande d'adhésion (secrétariat, présidence), puis prévient la personne. */
export async function decideMembership(applicationId: string, approve: boolean, note: string): Promise<ActionResult & { pending?: boolean }> {
  const staff = await getStaff();
  if (!staff?.can("members.manage")) return FORBIDDEN;
  const { data: app } = await staff.supabase.from("membership_applications").select("user_id, status").eq("id", applicationId).maybeSingle();
  if (!app || app.status !== "en_attente") return { ok: false, error: "Cette demande a déjà été traitée." };
  const { data: p } = await staff.supabase.from("profiles").select("full_name, email").eq("id", app.user_id).maybeSingle();
  const who = p?.full_name ?? p?.email ?? "un membre";
  return runOrRequest(staff, "membership.decide", `${approve ? "Valider" : "Refuser"} l'adhésion de ${who}`, { applicationId, approve, note: note.slice(0, 1000) });
}

const documentSchema = z.object({
  title: z.string().trim().min(3, "Indiquez un titre.").max(160),
  description: z.string().trim().max(1000).optional(),
  body: z.string().trim().max(10000).optional(),
  category: z.enum(documentCategories.map((c) => c.value) as [DocumentCategory, ...DocumentCategory[]]).default("document"),
  audience: z.enum(["members", "user", "accounts"]),
  recipientId: z.string().uuid().optional(),
  filePath: z.string().regex(/^[0-9a-f-]{36}\/[^/]+$/, "Fichier invalide.").optional(),
  fileName: z.string().trim().min(1).max(200).optional(),
  sendEmail: z.boolean().default(true),
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
  if (!v.filePath && !v.body) return { ok: false, error: "Joignez un fichier ou rédigez un message." };
  const payload = { ...v, description: v.description || null, body: v.body || null, filePath: v.filePath ?? null, fileName: v.fileName ?? null };

  if (!staff.presidency) {
    await requestApproval(
      staff,
      "document.publish",
      `${categoryLabel(v.category)} : ${v.title}`,
      `${audienceText(v.audience)}${v.sendEmail ? " · espace membre + e-mail" : " · espace membre"}`,
      payload
    );
    refresh();
    return { ok: true, pending: true };
  }

  const error = await executeApproval("document.publish", payload, staff.user.id);
  if (error) {
    console.error("[admin] document", error);
    if (v.filePath) await createAdminClient().storage.from("documents").remove([v.filePath]);
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
  if (doc.file_path) await admin.storage.from("documents").remove([doc.file_path]);
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
  } else {
    // Refus : nettoyage propre au type (fichier non conservé, envoi annulé, rapport refusé…).
    await rejectApproval(req.kind, req.payload as Record<string, unknown>);
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
