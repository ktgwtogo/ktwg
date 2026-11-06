import "server-only";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { mainNav, type NavEntry } from "@/config/navigation";
import { defaultHeroSlides } from "@/components/sections/hero-slides";
import { defaultSiteImages, type SiteImages } from "@/content/image-slots";
import type { SiteEdits } from "./edit-types";
import { CONTENT_TAG } from "@/lib/content/repository";
import type { Database } from "@/types/database";
import { defaultSiteConfig, type HeroSlide, type SiteConfigData } from "./types";

/**
 * Paramètres du site (table site_settings), mis en cache et invalidés avec les contenus.
 * Chaque paramètre absent ou illisible retombe sur la valeur d'origine du code.
 */
const readAll = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return {};
    try {
      const db = createClient<Database>(url, key, { auth: { persistSession: false } });
      const { data, error } = await db.from("site_settings").select("key, value");
      if (error) throw new Error(error.message);
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    } catch (error) {
      console.error("[paramètres]", error);
      return {};
    }
  },
  ["site-settings"],
  { tags: [CONTENT_TAG], revalidate: 3600 }
);

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const all = await readAll();
  return (all[key] as T | undefined) ?? fallback;
}

/** Coordonnées et réseaux sociaux (fusionnés avec les valeurs par défaut). */
export async function getSiteConfig(): Promise<SiteConfigData> {
  const [contact, socials] = await Promise.all([
    getSetting<Partial<Pick<SiteConfigData, "togo" | "germany">>>("contact", {}),
    getSetting<Partial<SiteConfigData["socials"]>>("socials", {}),
  ]);
  return {
    togo: { ...defaultSiteConfig.togo, ...contact.togo, address: { ...defaultSiteConfig.togo.address, ...contact.togo?.address } },
    germany: { ...defaultSiteConfig.germany, ...contact.germany },
    socials: { ...defaultSiteConfig.socials, ...socials },
  };
}

export const getMainNav = () => getSetting<NavEntry[]>("navigation.main", mainNav);
export const getHeroSlides = () => getSetting<HeroSlide[]>("home.hero", defaultHeroSlides);

/** Images des bannières et sections : les emplacements non modifiés gardent la photo d'origine. */
export async function getSiteImages(): Promise<SiteImages> {
  const saved = await getSetting<Partial<SiteImages>>("images", {});
  return { ...defaultSiteImages, ...saved };
}

/** Textes modifiés pour une langue : clés « Namespace.cle » → texte. */
export const getTextOverrides = (locale: string) => getSetting<Record<string, string>>(`texts.${locale}`, {});

/** Modifications faites en direct (textes de la langue + images), pour <T> et <EditableImage>. */
export async function getEdits(locale: string): Promise<SiteEdits> {
  const [texts, images] = await Promise.all([
    getSetting<SiteEdits["texts"]>(`edits.${locale}`, {}),
    getSetting<SiteEdits["images"]>("images", {}),
  ]);
  return { texts, images };
}
