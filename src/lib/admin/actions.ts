"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import type { ActionResult } from "@/lib/member/actions";
import { getMember } from "@/lib/member/session";

const FORBIDDEN: ActionResult = { ok: false, error: "Action réservée aux administrateurs." };

async function requireAdmin() {
  const member = await getMember();
  return member && (member.profile.role === "admin" || member.profile.role === "super_admin") ? member : null;
}

/** Valide ou refuse une demande d'adhésion, puis prévient la personne par e-mail. */
export async function decideMembership(applicationId: string, approve: boolean, note: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return FORBIDDEN;

  const { data: userId, error } = await admin.supabase.rpc("decide_membership", {
    p_application_id: applicationId,
    p_approve: approve,
    p_note: note.slice(0, 1000),
  });
  if (error || !userId) {
    console.error("[admin] décision adhésion", error?.message);
    return { ok: false, error: error?.message.includes("déjà traitée") ? "Cette demande a déjà été traitée." : "La décision n'a pas pu être enregistrée." };
  }

  const { data: person } = await admin.supabase.from("profiles").select("email, first_name").eq("id", userId).maybeSingle();
  if (person) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    await sendEmail({
      to: [person.email],
      subject: approve ? "Votre adhésion à KTGW Togo est validée" : "Votre demande d'adhésion à KTGW Togo",
      text: `Bonjour${person.first_name ? ` ${person.first_name}` : ""},\n\n${
        approve
          ? "Bonne nouvelle : votre adhésion est validée. Bienvenue dans l'association !"
          : "Votre demande d'adhésion a été examinée par l'association."
      }\nConsultez le détail dans votre espace membre : ${site}/mon-espace\n\nL'équipe KTGW Togo`,
    });
  }

  revalidatePath("/[locale]/admin", "layout");
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

/** Publie un document déjà déposé dans le bucket « documents » par le navigateur. */
export async function publishDocument(raw: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return FORBIDDEN;

  const parsed = documentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  if (v.audience === "user" && !v.recipientId) return { ok: false, error: "Choisissez le ou la destinataire." };

  const { error } = await admin.supabase.from("documents").insert({
    title: v.title,
    description: v.description || null,
    audience: v.audience,
    recipient_id: v.audience === "user" ? v.recipientId! : null,
    file_path: v.filePath,
    file_name: v.fileName,
    created_by: admin.user.id,
  });
  if (error) {
    console.error("[admin] document", error.message);
    await admin.supabase.storage.from("documents").remove([v.filePath]);
    return { ok: false, error: "La publication a échoué." };
  }
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return FORBIDDEN;
  const { data: doc } = await admin.supabase.from("documents").select("file_path").eq("id", id).maybeSingle();
  if (!doc) return { ok: false, error: "Document introuvable." };
  await admin.supabase.storage.from("documents").remove([doc.file_path]);
  const { error } = await admin.supabase.from("documents").delete().eq("id", id);
  if (error) return { ok: false, error: "La suppression a échoué." };
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}
