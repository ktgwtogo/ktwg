"use server";

import { z } from "zod";
import type { ActionResult } from "@/lib/member/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { runOrRequest } from "./approvals";
import { getStaff } from "./staff";

type Result = ActionResult & { pending?: boolean };

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

/** Classe une pièce déjà déposée dans « documents/dossiers/<membre>/ ». */
export async function addMemberFile(raw: unknown): Promise<Result> {
  const staff = await secretariat();
  if (!staff) return { ok: false, error: "Le classement des dossiers ne fait pas partie de votre poste." };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  if (!v.filePath.startsWith(`dossiers/${v.userId}/`)) {
    await createAdminClient().storage.from("documents").remove([v.filePath]);
    return { ok: false, error: "Fichier invalide." };
  }
  const { data: p } = await staff.supabase.from("profiles").select("full_name, email").eq("id", v.userId).maybeSingle();
  return runOrRequest(staff, "file.add", `Dossier de ${p?.full_name ?? p?.email ?? "membre"} : ajouter « ${v.title} »`, v);
}

export async function deleteMemberFile(id: string): Promise<Result> {
  const staff = await secretariat();
  if (!staff) return { ok: false, error: "Action non autorisée." };
  const { data: file } = await staff.supabase.from("member_files").select("title").eq("id", id).maybeSingle();
  if (!file) return { ok: false, error: "Pièce introuvable." };
  return runOrRequest(staff, "file.delete", `Supprimer la pièce « ${file.title} » d'un dossier`, { id });
}
