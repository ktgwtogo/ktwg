import { z } from "zod";
import { navIcons } from "@/config/navigation";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

/** Validation des paramètres du site avant enregistrement (côté serveur). */

const text = (max: number) => z.string().trim().max(max);
const href = z
  .string()
  .trim()
  .max(300)
  .regex(/^(\/|https:\/\/|mailto:|tel:)/, "Lien commençant par « / », « https:// », « mailto: » ou « tel: ».");
const optionalUrl = z.union([z.literal(""), z.string().trim().max(300).regex(/^https:\/\//, "Adresse commençant par https://")]);
const e164 = z.string().trim().regex(/^\+\d{8,15}$/, "Numéro au format international, ex. +22890000000.");
const media = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/media/`;
const image = z.object({
  src: z.string().refine((s) => s.startsWith("/images/") || s.startsWith(media), "Image invalide."),
  alt: text(300).min(1, "Décrivez chaque image."),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const contactSchema = z.object({
  togo: z.object({
    address: z.object({ street: text(200).min(2), district: text(120), city: text(80).min(2), country: text(80).min(2) }),
    phones: z.array(z.object({ display: text(40).min(6), e164, whatsapp: z.boolean() })).min(1, "Au moins un numéro.").max(4),
    email: z.email("E-mail invalide."),
    mapsUrl: optionalUrl,
    mapsEmbedUrl: z.union([z.literal(""), z.string().trim().regex(/^https:\/\/www\.google\.com\/maps/, "Lien d'intégration Google Maps (https://www.google.com/maps…).")]),
  }),
  germany: z.object({
    name: text(120).min(2),
    city: text(80),
    phone: z.object({ display: text(40), e164: z.union([z.literal(""), e164]) }),
    email: z.union([z.literal(""), z.email("E-mail invalide.")]),
    website: optionalUrl,
  }),
});

export const socialsSchema = z.object({
  facebook: optionalUrl,
  tiktok: optionalUrl,
  instagram: optionalUrl,
  youtube: optionalUrl,
  linkedin: optionalUrl,
  whatsapp: optionalUrl,
});

const iconName = z.enum(Object.keys(navIcons) as [keyof typeof navIcons, ...(keyof typeof navIcons)[]]);
const navChild = z.object({
  key: z.string().max(60).optional(),
  label: text(80).optional(),
  description: text(160).optional(),
  href,
  icon: iconName,
});
export const navigationSchema = z
  .array(
    z.object({
      key: z.string().max(60).optional(),
      label: text(60).optional(),
      href,
      children: z.array(navChild).max(10).optional(),
      featured: z.object({ image: z.string().max(60), href }).optional(),
    })
  )
  .min(1, "Le menu doit contenir au moins une entrée.")
  .max(12)
  .refine((items) => items.every((i) => i.key || i.label) && items.every((i) => (i.children ?? []).every((c) => c.key || c.label)), "Chaque lien doit avoir un libellé.");

export const heroSchema = z
  .array(
    z.object({
      image,
      eyebrow: text(80),
      title: z.tuple([text(60), text(60).min(1, "Mot mis en valeur obligatoire."), text(60)]),
      subtitle: text(300),
    })
  )
  .min(1, "Au moins une diapositive.")
  .max(8);

const messages = { fr, de, en } as Record<string, Record<string, unknown>>;

/** Textes d'origine d'une langue, aplatis : { "Nav.about": "À propos", … }. */
export function flatMessages(locale: string) {
  const out: Record<string, string> = {};
  const walk = (node: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") out[key] = v;
      else if (v && typeof v === "object") walk(v as Record<string, unknown>, key);
    }
  };
  walk(messages[locale] ?? {}, "");
  return out;
}

/** Ne garde que les textes existants, non vides et différents de l'original. */
export function cleanTexts(locale: string, raw: unknown) {
  const base = flatMessages(locale);
  const out: Record<string, string> = {};
  if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === "string" && k in base && v.trim() && v.trim() !== base[k]) out[k] = v.trim().slice(0, 1000);
    }
  }
  return out;
}

export const settingLabels: Record<string, string> = {
  contact: "Coordonnées",
  socials: "Réseaux sociaux",
  "navigation.main": "Menu principal",
  "home.hero": "Diaporama de l'accueil",
  "texts.fr": "Textes du site (français)",
  "texts.de": "Textes du site (allemand)",
  "texts.en": "Textes du site (anglais)",
};
