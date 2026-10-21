"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/member/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { audit, getStaff } from "./staff";

const schema = z.object({
  userId: z.string().uuid(),
  title: z.string().trim().min(2, "Indiquez un titre.").max(160),
  category: z.enum(["identite", "adhesion", "paiement", "courrier", "photo", "attestation", "autre"]),
  notes: z.string().trim().max(1000).optional(),
  filePath: z.string(),
  fileName: z.string().trim().min(1).max(200),
  size: z.number().int().nonnegative().optional(),
});

async function secretariat() {
  const staff = await getStaff();
  return staff && (staff.can("members.manage") || staff.can("documents.manage")) ? staff : null;
}

/** Enregistre une pièce déjà déposée dans « documents/dossiers/<membre>/ ». */
export async function addMemberFile(raw: unknown): Promise<ActionResult> {
  const staff = await secretariat();
  if (!staff) return { ok: false, error: "Le classement des dossiers ne fait pas partie de votre poste." };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  if (!v.filePath.startsWith(`dossiers/${v.userId}/`)) return { ok: false, error: "Fichier invalide." };

  const { data, error } = await staff.supabase
    .from("member_files")
    .insert({
      user_id: v.userId,
      title: v.title,
      category: v.category,
      notes: v.notes || null,
      file_path: v.filePath,
      file_name: v.fileName,
      size_bytes: v.size ?? null,
      uploaded_by: staff.user.id,
    })
    .select("id")
    .single();
  if (error) {
    await createAdminClient().storage.from("documents").remove([v.filePath]);
    return { ok: false, error: "L'enregistrement a échoué." };
  }
  await audit(staff, "dossier.piece_ajoutee", "member_files", data.id, { title: v.title });
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}

export async function deleteMemberFile(id: string): Promise<ActionResult> {
  const staff = await secretariat();
  if (!staff) return { ok: false, error: "Action non autorisée." };
  const { data: file } = await staff.supabase.from("member_files").select("file_path, title").eq("id", id).maybeSingle();
  if (!file) return { ok: false, error: "Pièce introuvable." };
  const { error } = await staff.supabase.from("member_files").delete().eq("id", id);
  if (error) return { ok: false, error: "La suppression a échoué." };
  await createAdminClient().storage.from("documents").remove([file.file_path]);
  await audit(staff, "dossier.piece_supprimee", "member_files", id, { title: file.title });
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}
