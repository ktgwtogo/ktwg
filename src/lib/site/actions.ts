"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { executeApproval, requestApproval } from "@/lib/admin/approvals";
import { audit, getStaff } from "@/lib/admin/staff";
import { CONTENT_TAG } from "@/lib/content/repository";
import { cleanTexts, contactSchema, heroSchema, navigationSchema, settingLabels, socialsSchema } from "./schemas";

export type SettingResult = { ok: true; pending?: boolean } | { ok: false; error: string };

const schemas = {
  contact: contactSchema,
  socials: socialsSchema,
  "navigation.main": navigationSchema,
  "home.hero": heroSchema,
} as const;

/** Valide un paramètre ; renvoie la valeur propre ou un message d'erreur. */
function validate(key: string, raw: unknown): { value: unknown } | { error: string } {
  const locale = key.match(/^texts\.(fr|de|en)$/)?.[1];
  if (locale) return { value: cleanTexts(locale, raw) };
  const schema = schemas[key as keyof typeof schemas];
  if (!schema) return { error: "Paramètre inconnu." };
  const parsed = schema.safeParse(raw);
  return parsed.success ? { value: parsed.data } : { error: parsed.error.issues[0]?.message ?? "Valeurs invalides." };
}

/** Enregistre un paramètre du site (présidence) ou le soumet à sa validation (gestion du site). */
export async function saveSetting(key: string, raw: unknown): Promise<SettingResult> {
  const staff = await getStaff();
  if (!staff?.can("pages.manage")) return { ok: false, error: "La gestion du site ne fait pas partie de votre poste." };
  const checked = validate(key, raw);
  if ("error" in checked) return { ok: false, error: checked.error };

  const payload = { key, value: checked.value };
  if (!staff.presidency) {
    await requestApproval(staff, "settings.save", settingLabels[key] ?? key, "Modification des paramètres du site", payload);
    revalidatePath("/[locale]/admin", "layout");
    return { ok: true, pending: true };
  }
  const error = await executeApproval("settings.save", payload, staff.user.id);
  if (error) {
    console.error("[paramètres] enregistrement", error);
    return { ok: false, error: "L'enregistrement a échoué." };
  }
  await audit(staff, "parametre.modifie", "site_settings", key, { title: settingLabels[key] ?? key });
  revalidateTag(CONTENT_TAG);
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}
