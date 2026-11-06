import "server-only";
import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content/repository";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanTexts } from "./schemas";

/**
 * Applique UNE modification faite en direct, en la fusionnant avec les autres
 * (relu au moment de l'écriture, pour ne pas écraser une modification voisine).
 * - texte du code      → site_settings « edits.<langue> »
 * - texte traduit      → site_settings « texts.<langue> » (même stockage que l'onglet Textes du site)
 * - image              → site_settings « images »
 * Une valeur vide (null) rétablit l'original.
 */
export type EditPayload =
  | { kind: "text"; locale: string; id: string; value: string | null }
  | { kind: "image"; id: string; value: { src: string; alt: string; width: number; height: number } | null };

export async function applyEdit(p: EditPayload, by: string | null): Promise<string | null> {
  const db = createAdminClient();
  const isMsg = p.kind === "text" && p.id.startsWith("msg:");
  const key = p.kind === "image" ? "images" : isMsg ? `texts.${p.locale}` : `edits.${p.locale}`;
  const id = isMsg ? p.id.slice(4) : p.id;

  const { data, error: readError } = await db.from("site_settings").select("value").eq("key", key).maybeSingle();
  if (readError) return readError.message;
  const current = { ...((data?.value as Record<string, unknown> | null) ?? {}) };
  if (p.value === null || p.value === "") delete current[id];
  else current[id] = p.value;
  const value = isMsg && p.kind === "text" ? cleanTexts(p.locale, current) : current;

  const { error } = await db.from("site_settings").upsert({ key, value: value as never, updated_by: by }, { onConflict: "key" });
  if (!error) revalidateTag(CONTENT_TAG);
  return error ? error.message : null;
}
