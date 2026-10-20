"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Handshake, Heart, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { images, type SiteImage } from "@/content/images";
import { cn } from "@/lib/utils";

type Slide = {
  image: SiteImage;
  eyebrow: string;
  /** Titre en 3 parties : la partie centrale est mise en valeur. */
  title: [string, string, string];
  subtitle: string;
};

/** Contenu du diaporama (sera éditable depuis le dashboard en Phase 8). */
const slides: Slide[] = [
  {
    image: images.ribbon,
    eyebrow: "ONG togolaise · depuis 2008",
    title: ["Former aujourd'hui les", "bâtisseurs", "du Togo de demain"],
    subtitle:
      "Éducation, formation professionnelle bilingue et autonomisation des jeunes, surtout des femmes, depuis 2008.",
  },
  {
    image: images.speech,
    eyebrow: "Formation professionnelle bilingue",
    title: ["Un métier entre les mains,", "un avenir", "devant soi"],
    subtitle:
      "Coutellerie, mécanique, comptabilité, énergies renouvelables, informatique : des formations en français et en allemand, tournées vers l'emploi.",
  },
  {
    image: images.plantingEmbassy,
    eyebrow: "Autonomisation des femmes",
    title: ["Les femmes,", "cœur battant", "du changement"],
    subtitle:
      "Internat pour les apprenties, entrepreneuriat féminin et énergie solaire : nous accompagnons chaque jeune fille vers son autonomie.",
  },
  {
    image: images.guests,
    eyebrow: "Coopération Togo – Allemagne",
    title: ["Ensemble,", "de Lomé à Cologne,", "pour l'éducation"],
    subtitle:
      "Avec kommTOGOgehweiter e.V., nos partenaires et nos bénévoles, nous unissons nos forces pour que chaque centime investi dans l'éducation compte.",
  },
];

const DURATION = 7000;

export function HeroSlider() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length), []);

  // Défilement automatique (désactivé si « réduire les animations », en pause au survol)
  const autoplay = !paused && !hovered && !reduceMotion;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => go(1), DURATION);
    return () => window.clearTimeout(id);
  }, [autoplay, index, go]);

  const slide = slides[index];
  const words = (text: string) => text.split(" ");
  let wordIndex = 0;

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Présentation de KTGW Togo"
      className="relative isolate flex min-h-[calc(100svh-7rem)] items-center overflow-hidden bg-ink text-white sm:min-h-[44rem] lg:min-h-[calc(100svh-8rem)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {/* Photos : fondu enchaîné + effet Ken Burns */}
      {slides.map((s, i) => (
        <div
          key={s.image.src}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 -z-20 transition-opacity duration-[1400ms] ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={s.image.src}
            alt={i === index ? s.image.alt : ""}
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              "object-cover",
              i === index && "motion-safe:animate-[kenburns_9s_ease-out_both]",
              i % 2 === 1 && "origin-top-right"
            )}
          />
        </div>
      ))}

      {/* Voiles pour la lisibilité du texte */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/65 to-ink/10" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-ink/85 to-transparent" />

      {/* Soleil levant + chemin vert (motifs du logo) */}
      <svg
        aria-hidden
        viewBox="0 0 600 400"
        className="pointer-events-none absolute -right-24 bottom-6 -z-10 w-[34rem] opacity-50 sm:-right-10 lg:right-0 lg:w-[44rem] lg:opacity-60"
      >
        <defs>
          <radialGradient id="hero-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FCE38A" />
            <stop offset="60%" stopColor="var(--ktgw-sun)" />
            <stop offset="100%" stopColor="var(--ktgw-orange)" />
          </radialGradient>
        </defs>
        <g className="origin-[300px_300px] motion-safe:animate-sun-rise">
          <g className="origin-[300px_300px] motion-safe:animate-rays">
            {Array.from({ length: 18 }).map((_, i) => (
              <rect
                key={i}
                x="296"
                y="70"
                width="8"
                height="70"
                rx="4"
                fill="var(--ktgw-sun)"
                opacity="0.75"
                transform={`rotate(${i * 20} 300 300)`}
              />
            ))}
          </g>
          <circle cx="300" cy="300" r="120" fill="url(#hero-sun)" />
        </g>
        <path
          d="M-20 330 C 120 270, 220 380, 340 320 S 540 250, 640 300"
          fill="none"
          stroke="var(--ktgw-green)"
          strokeWidth="18"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          className="motion-safe:animate-draw"
        />
        <path
          d="M-20 365 C 140 310, 240 410, 360 355 S 560 300, 640 340"
          fill="none"
          stroke="var(--ktgw-green-dark)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          className="motion-safe:animate-draw [animation-delay:0.8s]"
        />
      </svg>

      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl" aria-live={autoplay ? "off" : "polite"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduceMotion ? false : "hidden"}
              animate="shown"
              exit={reduceMotion ? undefined : { opacity: 0, y: -12, transition: { duration: 0.3 } }}
              variants={{ shown: { transition: { staggerChildren: 0.06 } } }}
              aria-roledescription="diapositive"
              aria-label={`${index + 1} sur ${slides.length}`}
            >
              <motion.p
                variants={{ hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0 } }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-ktgw-sun uppercase backdrop-blur-sm sm:text-sm"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-ktgw-sun" />
                {slide.eyebrow}
              </motion.p>

              <h1 className="text-[2.35rem] leading-[1.08] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                {slide.title.map((part, p) => (
                  <span key={p} className={cn(p === 1 && "font-accent font-bold text-transparent italic")}>
                    {words(part).map((w) => {
                      const k = wordIndex++;
                      return (
                        <motion.span
                          key={k}
                          variants={{
                            hidden: { opacity: 0, y: "0.6em", filter: "blur(6px)" },
                            shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                          }}
                          className={cn(
                            "inline-block",
                            p === 1 && "bg-[image:linear-gradient(100deg,var(--ktgw-sun),var(--ktgw-orange)_60%,#ff8a5c)] bg-clip-text pr-[0.08em]"
                          )}
                        >
                          {w}&nbsp;
                        </motion.span>
                      );
                    })}
                  </span>
                ))}
              </h1>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.35 } } }}
                className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl"
              >
                {slide.subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/faire-un-don" size="xl" className="shadow-lg shadow-ktgw-red/30">
              <Heart aria-hidden className="fill-current" />
              Faire un don
            </ButtonLink>
            <ButtonLink href="/partenariat" size="xl" variant="white">
              <Handshake aria-hidden />
              Devenir partenaire
            </ButtonLink>
            <ButtonLink
              href="/projets"
              size="xl"
              variant="link"
              className="px-2 text-white underline-offset-8 hover:text-ktgw-sun"
            >
              Nos projets
              <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Commandes du carrousel */}
      <div className="absolute inset-x-0 bottom-0 pb-6 sm:pb-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-2 sm:max-w-md">
            {slides.map((s, i) => (
              <button
                key={s.image.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Afficher la diapositive ${i + 1} : ${s.eyebrow}`}
                aria-current={i === index ? "true" : undefined}
                className="group relative h-6 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-colors group-hover:bg-white/40">
                  {i === index && (
                    <span
                      key={`${index}-${autoplay}`}
                      className="block h-full rounded-full bg-ktgw-sun"
                      style={
                        autoplay
                          ? { animation: `progress-fill ${DURATION}ms linear both` }
                          : { width: "100%" }
                      }
                    />
                  )}
                  {i < index && <span className="block h-full w-full rounded-full bg-white/60" />}
                </span>
              </button>
            ))}
            <span className="ml-2 hidden font-heading text-sm font-semibold tabular-nums text-white/80 sm:inline">
              {String(index + 1).padStart(2, "0")}
              <span className="text-white/40"> / {String(slides.length).padStart(2, "0")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Reprendre le défilement" : "Mettre en pause le défilement"}
              className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
            >
              {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Diapositive précédente"
              className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white hover:text-ink sm:size-12"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Diapositive suivante"
              className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white hover:text-ink sm:size-12"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicateur de défilement */}
      <a
        href="#chiffres-cles"
        aria-label="Faire défiler vers la suite"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[10px] font-semibold tracking-[0.3em] text-white/70 uppercase hover:text-white xl:flex"
      >
        <span className="flex h-8 w-5 justify-center rounded-full border-2 border-current pt-1.5">
          <span className="block size-1.5 rounded-full bg-current motion-safe:animate-scroll-hint" />
        </span>
        Défiler
      </a>
    </section>
  );
}
