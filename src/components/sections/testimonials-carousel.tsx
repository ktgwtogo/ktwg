"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { SampleBadge } from "@/components/shared/badges";
import type { Testimonial } from "@/content/testimonials";
import { cn } from "@/lib/utils";

/** Carrousel de témoignages : une citation à la fois, navigation par points et flèches. */
export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (d: number) => setIndex((i) => (i + d + items.length) % items.length);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), 8000);
    return () => window.clearTimeout(id);
  }, [index, paused, items.length]);

  return (
    <div
      className="relative"
      aria-roledescription="carrousel"
      aria-label="Témoignages"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid">
        {items.map((t, i) => (
          <figure
            key={t.quote}
            aria-hidden={i !== index}
            className={cn(
              "col-start-1 row-start-1 flex flex-col gap-6 transition-all duration-700",
              i === index ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"
            )}
          >
            <Quote aria-hidden className="size-12 text-ktgw-sun" />
            <blockquote className="font-accent text-2xl leading-snug font-semibold italic sm:text-3xl">« {t.quote} »</blockquote>
            <figcaption className="flex items-center gap-4">
              <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-ktgw-sun font-heading font-extrabold text-ink">
                {t.initials}
              </span>
              <span className="flex flex-col">
                <span className="flex items-center gap-2 font-heading font-bold">
                  {t.name}
                  {t.sample && <SampleBadge />}
                </span>
                <span className="text-sm text-white/70">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-4">
        <button type="button" onClick={() => go(-1)} aria-label="Témoignage précédent" className="flex size-11 items-center justify-center rounded-full border border-white/30 transition-colors hover:bg-white hover:text-ink">
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <div className="flex gap-2">
          {items.map((t, i) => (
            <button
              key={t.quote}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Témoignage ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn("h-2.5 rounded-full transition-all", i === index ? "w-8 bg-ktgw-sun" : "w-2.5 bg-white/40 hover:bg-white/70")}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Témoignage suivant" className="flex size-11 items-center justify-center rounded-full border border-white/30 transition-colors hover:bg-white hover:text-ink">
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
