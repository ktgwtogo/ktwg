"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { executeApproval, requestApproval } from "@/lib/admin/approvals";
import { audit, getStaff } from "@/lib/admin/staff";
import { routing } from "@/i18n/routing";
import { IMAGE_ID, MSG_ID, TEXT_ID } from "./edit-types";
import type { EditPayload } from "./edit-store";

export type EditResult = { ok: true; pending?: boolean } | { ok: false; error: string };

const media = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/media/`;

const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    locale: z.enum(routing.locales as unknown as [string, ...string[]]),
    id: z.string().refine((id) => TEXT_ID.test(id) || MSG_ID.test(id), "Texte non modifiable."),
    value: z.string().trim().max(5000, "Texte trop long (5 000 caractères maximum).").nullable(),
  }),
  z.object({
    kind: z.literal("image"),
    id: z.string().regex(IMAGE_ID, "Image non modifiable."),
    value: z
      .object({
        src: z.string().refine((s) => s.startsWith("/images/") || s.startsWith(media), "Image invalide."),
        alt: z.string().trim().max(300),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
      })
      .nullable(),
  }),
]);

/** Enregistre une modification faite en direct (présidence) ou la soumet à sa validation. */
export async function saveEdit(raw: unknown): Promise<EditResult> {
  const staff = await getStaff();
  if (!staff?.can("pages.manage")) return { ok: false, error: "La gestion du site ne fait pas partie de votre poste." };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Modification invalide." };
  const edit = parsed.data as EditPayload;

  const title =
    edit.kind === "image"
      ? `Image remplacée (${edit.id})`
      : edit.value
        ? `Texte : « ${edit.value.slice(0, 60)}${edit.value.length > 60 ? "…" : ""} »`
        : "Texte rétabli à l'original";

  if (!staff.presidency) {
    await requestApproval(staff, "edit.save", title, "Modification faite en direct sur le site", edit as unknown as Record<string, unknown>);
    revalidatePath("/[locale]/admin", "layout");
    return { ok: true, pending: true };
  }
  const error = await executeApproval("edit.save", edit as unknown as Record<string, unknown>, staff.user.id);
  if (error) {
    console.error("[édition en direct]", error);
    return { ok: false, error: "L'enregistrement a échoué." };
  }
  await audit(staff, "site.modifie_en_direct", "site_settings", edit.id, { title });
  return { ok: true };
}
