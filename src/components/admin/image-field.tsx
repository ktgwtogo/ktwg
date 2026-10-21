"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { ImageValue } from "@/lib/content/normalize";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX = 8 * 1024 * 1024;
const input =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Dimensions réelles de l'image (pour réserver la place à l'affichage). */
async function dimensions(file: File) {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/** Dépose une image dans le bucket public « media » et renvoie sa description. */
export async function uploadImage(file: File, folder: string): Promise<ImageValue | string> {
  if (!TYPES.includes(file.type)) return "Format accepté : JPG, PNG, WebP ou AVIF.";
  if (file.size > MAX) return "Image trop lourde : 8 Mo maximum.";
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) return "Le dépôt de l'image a échoué (droits insuffisants ou connexion).";
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  const { width, height } = await dimensions(file).catch(() => ({ width: 1600, height: 1066 }));
  return { src: data.publicUrl, alt: "", width, height };
}

/** Une image : aperçu, remplacement, texte alternatif. */
export function ImageField({
  value,
  onChange,
  folder,
  withAlt = true,
}: {
  value: ImageValue | null;
  onChange: (v: ImageValue | null) => void;
  folder: string;
  withAlt?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const result = await uploadImage(file, folder);
    setBusy(false);
    if (typeof result === "string") return setError(result);
    onChange({ ...result, alt: value?.alt ?? "" });
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-input bg-muted/30 p-3 sm:flex-row sm:items-start">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value.src} alt="" className="h-28 w-40 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="flex h-28 w-40 shrink-0 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">Aucune image</span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {withAlt && value && (
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Description de l&apos;image (accessibilité)
            <input value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} maxLength={300} className={input} />
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-lg border-2 border-border px-3 text-sm font-semibold disabled:opacity-60">
            <ImagePlus aria-hidden className="size-4" />
            {busy ? "Envoi…" : value ? "Remplacer" : "Choisir une image"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-destructive hover:bg-destructive/10">
              <Trash2 aria-hidden className="size-4" />
              Retirer
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        <input ref={ref} type="file" accept={TYPES.join(",")} className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
      </div>
    </div>
  );
}
