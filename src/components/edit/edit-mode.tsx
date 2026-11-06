"use client";

import { ImagePlus, LogOut, PencilLine, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadImage } from "@/components/admin/image-field";
import { saveEdit } from "@/lib/site/edit-actions";

export const EDIT_COOKIE = "ktgw_edit";

/** Active ou quitte le mode « Modifier le site en direct » (cookie lu par la barre d'édition). */
export function setEditMode(on: boolean) {
  document.cookie = `${EDIT_COOKIE}=${on ? "1" : ""}; path=/; max-age=${on ? 60 * 60 * 8 : 0}; samesite=lax`;
}

type Toast = { tone: "ok" | "wait" | "error"; text: string };
type ImageTarget = { img: HTMLImageElement; id: string };

/**
 * Barre d'édition en direct : visible seulement pour l'équipe ayant activé le mode depuis l'admin.
 * Cliquer sur un texte surligné le rend modifiable ; cliquer sur une image permet de la remplacer.
 * Les droits sont vérifiés côté serveur à chaque enregistrement.
 */
export function EditMode() {
  const [active, setActive] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [image, setImage] = useState<ImageTarget | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActive(document.cookie.split("; ").includes(`${EDIT_COOKIE}=1`));
  }, []);

  const notify = useCallback((r: Awaited<ReturnType<typeof saveEdit>>) => {
    if (!r.ok) setToast({ tone: "error", text: r.error });
    else if (r.pending) setToast({ tone: "wait", text: "Envoyé à la présidence pour validation." });
    else setToast({ tone: "ok", text: "Enregistré : le site est à jour." });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.classList.add("ktgw-editing");
    const locale = root.lang || "fr";

    const startText = (el: HTMLElement) => {
      if (el.isContentEditable) return;
      el.dataset.orig = el.innerText;
      try {
        el.contentEditable = "plaintext-only";
      } catch {
        el.contentEditable = "true";
      }
      el.focus();
      const finish = async () => {
        el.removeEventListener("blur", finish);
        el.removeEventListener("keydown", keys);
        el.contentEditable = "false";
        const value = el.innerText.replace(/\s+/g, " ").trim();
        if (value === (el.dataset.orig ?? "").replace(/\s+/g, " ").trim()) return;
        const r = await saveEdit({ kind: "text", locale, id: el.dataset.edit, value: value || null });
        notify(r);
        // Texte vidé : on recharge pour afficher le texte d'origine.
        if (!value && r.ok && !r.pending) window.location.reload();
      };
      const keys = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          el.blur();
        } else if (e.key === "Escape") {
          el.innerText = el.dataset.orig ?? el.innerText;
          el.blur();
        }
      };
      el.addEventListener("blur", finish);
      el.addEventListener("keydown", keys);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-edit-ui]")) return;
      const text = target.closest<HTMLElement>("[data-edit]");
      if (text) {
        e.preventDefault();
        e.stopPropagation();
        startText(text);
        return;
      }
      // L'image peut être sous un voile ou un dégradé : on cherche sous le pointeur.
      const img = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find((el): el is HTMLImageElement => el instanceof HTMLImageElement && Boolean(el.dataset.editImg));
      if (img) {
        e.preventDefault();
        e.stopPropagation();
        setImage({ img, id: img.dataset.editImg! });
        setAlt(img.alt);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      root.classList.remove("ktgw-editing");
    };
  }, [active, notify]);

  if (!active) return null;

  const showImage = (src: string, newAlt: string) => {
    if (!image) return;
    image.img.removeAttribute("srcset");
    image.img.src = src;
    image.img.alt = newAlt;
  };

  const replace = async (file?: File) => {
    if (!file || !image) return;
    setBusy(true);
    const up = await uploadImage(file, "site");
    if (typeof up === "string") {
      setBusy(false);
      return setToast({ tone: "error", text: up });
    }
    const value = { ...up, alt: alt || image.img.alt || "Photo KTGW Togo" };
    const r = await saveEdit({ kind: "image", id: image.id, value });
    setBusy(false);
    notify(r);
    if (r.ok) {
      showImage(value.src, value.alt);
      setImage(null);
    }
  };

  const reset = async () => {
    if (!image) return;
    setBusy(true);
    const r = await saveEdit({ kind: "image", id: image.id, value: null });
    setBusy(false);
    notify(r);
    if (r.ok) {
      setImage(null);
      if (!r.pending) window.location.reload();
    }
  };

  return (
    <div data-edit-ui className="fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-3 print:hidden">
      {toast && (
        <p
          role="status"
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg ${toast.tone === "error" ? "bg-red-600" : toast.tone === "wait" ? "bg-amber-600" : "bg-emerald-700"}`}
        >
          {toast.text}
        </p>
      )}

      {image && (
        <div className="w-full max-w-md rounded-2xl bg-white p-4 text-slate-900 shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between">
            <p className="font-bold">Changer cette image</p>
            <button type="button" onClick={() => setImage(null)} aria-label="Fermer" className="rounded-lg p-1 hover:bg-slate-100">
              <X className="size-5" />
            </button>
          </div>
          <label className="mt-3 flex flex-col gap-1 text-xs font-semibold">
            Description de l&apos;image (accessibilité)
            <input value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} className="h-10 rounded-lg border border-slate-300 px-3 text-sm" />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              <ImagePlus className="size-4" />
              {busy ? "Envoi…" : "Choisir une nouvelle photo"}
            </button>
            <button type="button" disabled={busy} onClick={reset} className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              <RotateCcw className="size-4" />
              Image d&apos;origine
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">JPG, PNG, WebP ou AVIF, 8 Mo maximum.</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" tabIndex={-1} onChange={(e) => replace(e.target.files?.[0])} />
        </div>
      )}

      <div className="flex max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl">
        <PencilLine className="size-5 shrink-0 text-amber-300" />
        <span>
          <strong>Mode édition</strong> — cliquez sur un texte surligné pour le modifier (Entrée pour valider, Échap pour annuler, texte vide = texte
          d&apos;origine), ou sur une image pour la changer.
        </span>
        <button
          type="button"
          onClick={() => {
            setEditMode(false);
            window.location.reload();
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 font-semibold hover:bg-white/20"
        >
          <LogOut className="size-4" />
          Quitter
        </button>
      </div>
    </div>
  );
}
