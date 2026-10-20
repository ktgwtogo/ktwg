"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCounterProps = {
  value: number;
  label: string;
  /** Texte ajouté après le nombre (ex. « + »). */
  suffix?: string;
  icon?: ReactNode;
  /** Durée de l'animation en millisecondes. */
  duration?: number;
  inverted?: boolean;
  className?: string;
};

/** Décélération « easeOutExpo » : démarrage rapide, arrivée douce. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Chiffre clé animé de 0 à `value` quand il entre dans l'écran.
 * - Sans dépendance (IntersectionObserver + requestAnimationFrame) pour rester léger.
 * - Affiche directement la valeur finale si l'utilisateur a demandé à réduire les animations.
 * - Le nombre final est toujours exposé aux lecteurs d'écran (pas de valeur intermédiaire).
 */
export function StatCounter({
  value,
  label,
  suffix = "",
  icon,
  duration = 2000,
  inverted = false,
  className,
}: StatCounterProps) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(easeOutExpo(progress) * value));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  const format = (n: number) => new Intl.NumberFormat(locale).format(n);

  return (
    <div ref={ref} className={cn("flex flex-col items-center gap-2 text-center", className)}>
      {icon && (
        <span
          aria-hidden
          className={cn(
            "mb-1 flex size-12 items-center justify-center rounded-2xl",
            inverted ? "bg-white/10 text-ktgw-sun" : "bg-accent text-ktgw-red"
          )}
        >
          {icon}
        </span>
      )}
      <p
        className={cn(
          "font-heading text-4xl font-extrabold tabular-nums sm:text-5xl",
          inverted ? "text-white" : "text-foreground"
        )}
      >
        <span aria-hidden>
          {format(display)}
          {suffix}
        </span>
        <span className="sr-only">
          {format(value)}
          {suffix}
        </span>
      </p>
      <p className={cn("text-sm font-medium", inverted ? "text-white/80" : "text-muted-foreground")}>
        {label}
      </p>
    </div>
  );
}
