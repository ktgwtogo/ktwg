"use client";

import { PencilLine } from "lucide-react";
import { setEditMode } from "./edit-mode";

/** Ouvre le site public en mode « Modifier le site en direct ». */
export function LiveEditButton({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-gradient-to-r from-ktgw-green-strong to-ktgw-green-dark p-5 text-white shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-bold">Modifier le site en direct</p>
        <p className="text-sm text-white/85">
          Naviguez sur le vrai site : cliquez sur n&apos;importe quel texte surligné pour le réécrire, ou sur une image pour la remplacer. Les
          modifications s&apos;appliquent à la langue affichée (FR, DE ou EN).
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          setEditMode(true);
          window.location.href = locale === "fr" ? "/" : `/${locale}`;
        }}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-ktgw-green-strong shadow hover:bg-white/90"
      >
        <PencilLine aria-hidden className="size-5" />
        Ouvrir le mode édition
      </button>
    </div>
  );
}
