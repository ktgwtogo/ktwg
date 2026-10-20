"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { galleryCategories, type GalleryCategory, type GalleryItem } from "@/content/gallery";
import { cn } from "@/lib/utils";

/** Galerie filtrable + visionneuse (flèches clavier, balayage tactile, Échap). */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<GalleryCategory | "Toutes">("Toutes");
  const [current, setCurrent] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const visible = filter === "Toutes" ? items : items.filter((i) => i.category === filter);
  const go = (d: number) => setCurrent((c) => (c === null ? c : (c + d + visible.length) % visible.length));
  const item = current !== null ? visible[current] : null;

  return (
    <>
      <div role="group" aria-label="Filtrer par catégorie" className="mb-10 flex flex-wrap justify-center gap-2">
        {(["Toutes", ...galleryCategories] as const).map((c) => {
          const count = c === "Toutes" ? items.length : items.filter((i) => i.category === c).length;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className="h-11 rounded-full border-2 border-border bg-card px-5 text-sm font-semibold transition-colors hover:border-ktgw-red aria-pressed:border-ktgw-red-strong aria-pressed:bg-ktgw-red-strong aria-pressed:text-white"
            >
              {c} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {visible.map((img, i) => (
          <li key={img.src} className="break-inside-avoid">
            <button
              type="button"
              onClick={() => setCurrent(i)}
              className="group relative block w-full overflow-hidden rounded-2xl shadow-soft focus-visible:ring-4 focus-visible:ring-ktgw-sun"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 via-transparent p-4 text-left text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                <span className="text-xs font-semibold tracking-wider text-ktgw-sun uppercase">{img.category}</span>
                <span className="font-semibold">{img.caption}</span>
              </span>
              <span aria-hidden className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100">
                <Expand className="size-4" />
              </span>
              <span className="sr-only">Agrandir la photo</span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={item !== null} onOpenChange={(open) => !open && setCurrent(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/95 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-10"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(1);
              if (e.key === "ArrowLeft") go(-1);
            }}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {item && (
              <>
                <Dialog.Title className="sr-only">{item.caption}</Dialog.Title>
                <div className="relative h-[70svh] w-full max-w-6xl">
                  <Image key={item.src} src={item.src} alt={item.alt} fill sizes="100vw" className="object-contain animate-in fade-in zoom-in-95 duration-300" />
                </div>
                <Dialog.Description className="mt-4 max-w-2xl text-center text-white">
                  <span className="block font-semibold">{item.caption}</span>
                  <span className="text-sm text-white/60">
                    {current! + 1} / {visible.length} · {item.category}
                  </span>
                </Dialog.Description>
                <Dialog.Close
                  aria-label="Fermer"
                  className="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-ink"
                >
                  <X aria-hidden className="size-6" />
                </Dialog.Close>
                {visible.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Photo précédente"
                      className={cn(navBtn, "left-2 sm:left-6")}
                    >
                      <ChevronLeft aria-hidden className="size-6" />
                    </button>
                    <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className={cn(navBtn, "right-2 sm:right-6")}>
                      <ChevronRight aria-hidden className="size-6" />
                    </button>
                  </>
                )}
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

const navBtn =
  "absolute top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-ink";
