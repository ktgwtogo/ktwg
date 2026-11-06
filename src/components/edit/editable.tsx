"use client";

import Image, { type ImageProps } from "next/image";
import { createContext, useContext } from "react";
import type { SiteEdits } from "@/lib/site/edit-types";
import { textId } from "@/lib/site/edit-types";

/**
 * Modification du site en direct.
 * - <T s="page">texte</T> : texte du code, remplacé par sa version modifiée (par langue).
 * - <T k="Namespace.cle">{t("cle")}</T> : texte traduit (déjà remplacé par next-intl), repéré pour l'édition.
 * - <EditableImage id="…" … /> : image remplaçable.
 * Les attributs data-edit / data-edit-img servent au mode édition (components/edit/edit-mode.tsx).
 */

const EditsContext = createContext<SiteEdits>({ texts: {}, images: {} });

export function EditsProvider({ value, children }: { value: SiteEdits; children: React.ReactNode }) {
  return <EditsContext.Provider value={value}>{children}</EditsContext.Provider>;
}

export function T({ s, k, children }: { s?: string; k?: string; children?: React.ReactNode }) {
  const { texts } = useContext(EditsContext);
  if (k) return <span data-edit={`msg:${k}`}>{children}</span>;
  if (typeof children !== "string" || !s || !children.trim()) return <>{children}</>;
  const id = textId(s, children);
  return <span data-edit={id}>{texts[id] ?? children}</span>;
}

export function EditableImage({ id, ...props }: ImageProps & { id: string }) {
  const { images } = useContext(EditsContext);
  const saved = images[id];
  if (!saved) return <Image data-edit-img={id} {...props} alt={props.alt} />;
  const size = props.fill ? {} : { width: saved.width, height: saved.height };
  return <Image data-edit-img={id} {...props} {...size} src={saved.src} alt={props.alt === "" ? "" : saved.alt} />;
}
