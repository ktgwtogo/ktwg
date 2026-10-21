"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { executeApproval, requestApproval } from "@/lib/admin/approvals";
import { audit, getStaff } from "@/lib/admin/staff";
import { canEdit, getContentType } from "./config";
import { toRow, type FormValues } from "./normalize";
import { CONTENT_TAG } from "./repository";

export type ContentResult =
  | { ok: true; pending?: boolean; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const refresh = () => {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/[locale]/admin", "layout");
};

/**
 * Enregistre un contenu. Présidence : écrit tout de suite. Autres postes autorisés :
 * crée une demande de validation contenant la version proposée.
 */
export async function saveContent(typeId: string, id: string | null, values: FormValues): Promise<ContentResult> {
  const type = getContentType(typeId);
  const staff = await getStaff();
  if (!type || !staff || !canEdit(type, staff.can)) return { ok: false, error: "Ce contenu ne fait pas partie de votre poste." };

  const { row, errors } = toRow(type, values);
  if (Object.keys(errors).length) return { ok: false, error: "Certains champs sont à corriger.", fieldErrors: errors };

  if (typeof row.slug === "string") {
    let q = staff.supabase.from(type.table as "posts").select("id").eq("slug", row.slug);
    if (id) q = q.neq("id", id);
    const { data: clash } = await q.limit(1);
    if (clash?.length) return { ok: false, error: "Cette adresse de page est déjà utilisée.", fieldErrors: { slug: "Déjà utilisée par un autre contenu." } };
  }

  const title = String(row[type.titleField] ?? type.singular);
  const payload = { type: type.id, id, row };

  if (!staff.presidency) {
    await requestApproval(staff, "content.save", `${type.label} : ${title}`, id ? "Modification d'un contenu existant" : "Nouveau contenu", payload);
    refresh();
    return { ok: true, pending: true };
  }

  const error = await executeApproval("content.save", payload, staff.user.id);
  if (error) {
    console.error("[contenus] enregistrement", error);
    return { ok: false, error: "L'enregistrement a échoué." };
  }
  await audit(staff, id ? "contenu.modifie" : "contenu.cree", type.table, id, { title });
  refresh();
  return { ok: true };
}

/** Supprime un contenu (présidence), ou demande sa suppression (autres postes). */
export async function deleteContent(typeId: string, id: string, title: string): Promise<ContentResult> {
  const type = getContentType(typeId);
  const staff = await getStaff();
  if (!type || !staff || !canEdit(type, staff.can)) return { ok: false, error: "Ce contenu ne fait pas partie de votre poste." };
  const payload = { type: type.id, id };

  if (!staff.presidency) {
    await requestApproval(staff, "content.delete", `Supprimer : ${title}`, `${type.label}`, payload);
    refresh();
    return { ok: true, pending: true };
  }
  const error = await executeApproval("content.delete", payload, staff.user.id);
  if (error) return { ok: false, error: "La suppression a échoué." };
  await audit(staff, "contenu.supprime", type.table, id, { title });
  refresh();
  return { ok: true };
}
