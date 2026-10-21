"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { blockLabels, type PageBlock } from "@/lib/content/config";
import type { ImageValue } from "@/lib/content/normalize";
import { ImageField } from "./image-field";

const input =
  "w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

const empty: Record<PageBlock["type"], PageBlock> = {
  text: { type: "text", heading: "", body: "" },
  imageText: { type: "imageText", heading: "", body: "", image: null, imageRight: false },
  image: { type: "image", image: null, caption: "" },
  button: { type: "button", label: "", href: "/contact", style: "primary" },
};

/** Éditeur de blocs d'une page personnalisée. */
export function BlocksField({ value, onChange }: { value: PageBlock[]; onChange: (v: PageBlock[]) => void }) {
  const update = (i: number, patch: Partial<PageBlock>) => onChange(value.map((b, j) => (j === i ? ({ ...b, ...patch } as PageBlock) : b)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.map((b, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-input bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold">
              {i + 1}. {blockLabels[b.type]}
            </p>
            <div className="flex gap-1">
              <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30">
                <ArrowUp aria-hidden className="size-4" />
              </button>
              <button type="button" aria-label="Descendre" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30">
                <ArrowDown aria-hidden className="size-4" />
              </button>
              <button type="button" aria-label="Supprimer le bloc" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10">
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          </div>

          {(b.type === "text" || b.type === "imageText") && (
            <>
              <label className="flex flex-col gap-1 text-xs font-semibold">
                Titre du bloc (facultatif)
                <input value={b.heading} onChange={(e) => update(i, { heading: e.target.value })} className={`${input} h-10`} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold">
                Texte (ligne vide entre deux paragraphes)
                <textarea value={b.body} onChange={(e) => update(i, { body: e.target.value })} rows={6} className={`${input} py-2`} />
              </label>
            </>
          )}
          {(b.type === "imageText" || b.type === "image") && (
            <ImageField value={b.image as ImageValue | null} onChange={(img) => update(i, { image: img })} folder="pages" />
          )}
          {b.type === "imageText" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={b.imageRight} onChange={(e) => update(i, { imageRight: e.target.checked })} className="size-4 accent-[var(--ktgw-green-strong)]" />
              Image à droite du texte
            </label>
          )}
          {b.type === "image" && (
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Légende (facultatif)
              <input value={b.caption} onChange={(e) => update(i, { caption: e.target.value })} className={`${input} h-10`} />
            </label>
          )}
          {b.type === "button" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-semibold">
                Texte du bouton
                <input value={b.label} onChange={(e) => update(i, { label: e.target.value })} className={`${input} h-10`} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold">
                Lien (« /contact », « https://… »)
                <input value={b.href} onChange={(e) => update(i, { href: e.target.value })} className={`${input} h-10`} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold">
                Style
                <select value={b.style} onChange={(e) => update(i, { style: e.target.value as "primary" | "outline" })} className={`${input} h-10`}>
                  <option value="primary">Plein (rouge)</option>
                  <option value="outline">Contour</option>
                </select>
              </label>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(empty) as PageBlock["type"][]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange([...value, structuredClone(empty[t])])}
            className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-dashed border-border px-3 text-sm font-semibold hover:border-ktgw-green"
          >
            <Plus aria-hidden className="size-4" />
            {blockLabels[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
