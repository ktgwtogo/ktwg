"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MapEmbedProps = {
  src: string;
  className?: string;
};

/**
 * Carte Google Maps chargée uniquement au clic (« façade »).
 * - RGPD : aucun cookie Google tant que le visiteur n'a pas choisi d'afficher la carte.
 * - Performance : évite ~500 Ko de scripts tiers au chargement de chaque page.
 */
export function MapEmbed({ src, className }: MapEmbedProps) {
  const t = useTranslations("Footer");
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden rounded-2xl bg-white/5", className)}>
      {loaded ? (
        <iframe
          src={src}
          title={t("mapTitle")}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
        >
          {/* Fond décoratif : quadrillage façon plan de ville */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(255_255_255/0.15)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.15)_1px,transparent_1px)] [background-size:24px_24px]"
          />
          <span
            aria-hidden
            className="relative flex size-10 items-center justify-center rounded-full bg-ktgw-red-strong text-white shadow-soft transition-transform group-hover:scale-110"
          >
            <MapPin className="size-5" />
          </span>
          <span className="relative text-sm font-semibold text-white">{t("showMap")}</span>
          <span className="relative max-w-64 text-[11px] leading-snug text-white/60">{t("mapNotice")}</span>
        </button>
      )}
    </div>
  );
}
