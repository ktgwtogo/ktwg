"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MapEmbedProps = {
  src: string;
  className?: string;
  /** `dark` : sur fond sombre (footer) ; `light` : sur fond clair (page Contact). */
  tone?: "dark" | "light";
  /** Afficher immédiatement sans clic (focalisation Togo demandée) */
  immediate?: boolean;
};

/**
 * Carte Google Maps interactive centrée sur le siège de Tokoin Lomé, Togo.
 */
export function MapEmbed({ src, className, tone = "dark", immediate = true }: MapEmbedProps) {
  const light = tone === "light";
  const t = useTranslations("Footer");
  const [loaded, setLoaded] = useState(immediate);

  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/15",
        light ? "bg-ktgw-green-dark" : "bg-white/5",
        className
      )}
    >
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
          className="group absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center transition-colors hover:bg-white/10"
        >
          <span
            aria-hidden
            className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(255_255_255/0.15)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.15)_1px,transparent_1px)] [background-size:24px_24px]"
          />
          <span
            aria-hidden
            className="relative flex size-12 items-center justify-center rounded-full bg-ktgw-red text-white shadow-soft transition-transform group-hover:scale-110"
          >
            <MapPin className="size-6 animate-bounce" />
          </span>
          <span className="relative text-sm font-bold text-white">{t("showMap")}</span>
          <span className="relative max-w-64 text-xs text-white/70">Siège Tokoin Cébévito, Lomé – Togo</span>
        </button>
      )}
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        📍 Tokoin Lomé, Togo
      </div>
    </div>
  );
}
