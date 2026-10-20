import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import { NewsletterForm } from "@/components/forms/other-forms";
import { ButtonLink } from "@/components/ui/button-link";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { images } from "@/content/images";
import { cities } from "@/content/organization";
import { testimonials } from "@/content/testimonials";
import { PresenceMap } from "./presence-map";
import { TestimonialsCarousel } from "./testimonials-carousel";

/** Impact & témoignages : photo de groupe + carrousel. */
export function ImpactTestimonials() {
  return (
    <section aria-labelledby="impact-title" className="relative isolate overflow-hidden bg-ink py-16 text-white sm:py-24">
      <Image src={images.workersGroup.src} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25 blur-[2px]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-ink/90 to-ktgw-green-dark/80" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal className="flex flex-col gap-6">
          <SectionTitle
            id="impact-title"
            eyebrow="Impact & témoignages"
            title={
              <>
                Ils et elles racontent <span className="font-accent text-ktgw-sun italic">leur chemin</span>
              </>
            }
            description="Derrière chaque formation, il y a un parcours, une famille et un avenir qui change."
            inverted
          />
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-white/10">
            <Image src={images.workersGroup.src} alt={images.workersGroup.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <TestimonialsCarousel items={testimonials} />
        </Reveal>
      </div>
    </section>
  );
}

/** Carte de présence au Togo + Cologne. */
export function PresenceSection() {
  return (
    <Section tone="muted" aria-labelledby="presence-title">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="flex flex-col gap-6">
          <SectionTitle
            id="presence-title"
            eyebrow="Où nous agissons"
            title="Du nord au sud du Togo, avec Cologne"
            description="Nos équipes et nos partenaires interviennent dans six villes du pays, en lien permanent avec l'association mère en Allemagne."
          />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cities.map((c) => (
              <li key={c.name} className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-semibold shadow-soft ring-1 ring-foreground/5">
                <MapPin aria-hidden className={c.hq ? "size-4 text-ktgw-red" : "size-4 text-ktgw-green"} />
                {c.name}
              </li>
            ))}
          </ul>
          <ButtonLink href="/contact" variant="outline" size="xl" className="w-fit">
            Nous rendre visite à Lomé
            <ArrowRight aria-hidden />
          </ButtonLink>
        </Reveal>
        <Reveal delay={150}>
          <PresenceMap />
        </Reveal>
      </div>
    </Section>
  );
}

/** Inscription à la newsletter. */
export function NewsletterSection() {
  return (
    <section id="newsletter" aria-labelledby="newsletter-title" className="scroll-mt-24 bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-ktgw-green-dark p-8 text-white shadow-xl sm:p-12">
          <div aria-hidden className="absolute -right-16 -bottom-24 size-72 rounded-full bg-ktgw-sun/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold tracking-widest text-ktgw-sun uppercase">Newsletter</p>
              <h2 id="newsletter-title" className="text-3xl font-extrabold sm:text-4xl">
                Suivez nos actions, au fil des saisons
              </h2>
              <p className="text-white/80">Projets, événements, résultats : quelques nouvelles par trimestre, jamais de spam. Désinscription en un clic.</p>
            </div>
            <NewsletterForm inverted />
          </div>
        </div>
      </div>
    </section>
  );
}
