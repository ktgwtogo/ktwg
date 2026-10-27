"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { executeApproval, requestApproval } from "@/lib/admin/approvals";
import { audit, getStaff } from "@/lib/admin/staff";
import { CONTENT_TAG } from "@/lib/content/repository";
import { defaultGlobalSiteData, type GlobalSiteData } from "./builder-state";
import { cleanTexts, contactSchema, heroSchema, navigationSchema, settingLabels, socialsSchema } from "./schemas";
import { getSetting } from "./settings";

export type SettingResult = { ok: true; pending?: boolean } | { ok: false; error: string };

const schemas = {
  contact: contactSchema,
  socials: socialsSchema,
  "navigation.main": navigationSchema,
  "home.hero": heroSchema,
} as const;

/** Valide un paramètre ; renvoie la valeur propre ou un message d'erreur. */
function validate(key: string, raw: unknown): { value: unknown } | { error: string } {
  if (key === "site.builder_data" || key === "site.designer_email") {
    return { value: raw };
  }
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

/** Récupère les données complètes du constructeur de site */
export async function getGlobalSiteData(): Promise<GlobalSiteData> {
  return getSetting<GlobalSiteData>("site.builder_data", defaultGlobalSiteData);
}

/** Récupère l'e-mail du gestionnaire Web désigné par le Président */
export async function getSiteDesignerEmail(): Promise<string> {
  return getSetting<string>("site.designer_email", "contact@ktgw-togo.org");
}

/** Attribution du rôle de Gestionnaire du Site par le Président-Fondateur */
export async function assignSiteDesigner(email: string): Promise<SettingResult> {
  const staff = await getStaff();
  if (!staff?.presidency) {
    return { ok: false, error: "Seul le Président-Fondateur peut désigner le gestionnaire du site par e-mail." };
  }
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }
  const res = await saveSetting("site.designer_email", trimmed);
  if (res.ok) {
    await audit(staff, "gestionnaire.site.attribue", "site_settings", trimmed, { email: trimmed });
  }
  return res;
}

/** Publication instantanée du site en ligne (Effet immédiat) */
export async function publishGlobalSiteBuilder(data: GlobalSiteData): Promise<SettingResult> {
  const staff = await getStaff();
  if (!staff) {
    return { ok: false, error: "Non connecté." };
  }
  const designerEmail = await getSiteDesignerEmail();
  const isAuthorized = staff.presidency || staff.user.email?.toLowerCase() === designerEmail.toLowerCase() || staff.can("pages.manage");

  if (!isAuthorized) {
    return { ok: false, error: "Accès refusé : vous devez être désigné par le Président-Fondateur pour publier." };
  }

  const updatedData: GlobalSiteData = {
    ...data,
    lastPublishedAt: new Date().toISOString(),
    publishedBy: staff.profile.full_name ?? staff.profile.email,
  };

  const res = await saveSetting("site.builder_data", updatedData);
  if (res.ok) {
    revalidateTag(CONTENT_TAG);
    revalidatePath("/", "layout");
  }
  return res;
}
