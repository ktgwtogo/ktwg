import type { SiteImage } from "@/content/images";

/** Modifications faites en direct sur le site : textes (par langue) et images. */
export type SiteEdits = { texts: Record<string, string>; images: Record<string, SiteImage> };

/** Empreinte courte et stable d'un texte (FNV-1a 32 bits). */
function hash(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** Identifiant d'un texte du code : « page.empreinte-du-texte-d'origine ». */
export const textId = (scope: string, text: string) => `${scope}.${hash(text.trim())}`;

export const TEXT_ID = /^[a-z0-9-]{1,40}\.[a-z0-9]{1,8}$/;
export const MSG_ID = /^msg:[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+$/;
export const IMAGE_ID = /^[a-z0-9-]{1,40}\.[a-z0-9.-]{1,60}$/;
