import {
  ArrowRight,
  Globe2,
  Handshake,
  Heart,
  Home,
  MapPinned,
  Quote,
  Sprout,
  Target,
  Users,
} from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { PartnerMark } from "@/components/shared/badges";
import { EventCard, PostCard, ProjectCard } from "@/components/shared/cards";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { StatCounter } from "@/components/shared/stat-counter";
import { images } from "@/content/images";
import { domains, keyFigures, objectives } from "@/content/organization";
import type { Partner } from "@/content/partners";
import { getPartners, getPostsFor, getProjects, upcomingEvents } from "@/lib/content/repository";
import { Link } from "@/i18n/navigation";

const figureIcons = { sprout: Sprout, map: MapPinned, target: Target, home: Home, handshake: Handshake, globe: Globe2 };

/** Bandeau des chiffres clés (compteurs animés). */
export async function StatsBand() {
  const partners = await getPartners();
  return (
    <section id="chiffres-cles" aria-labelledby="stats-title" className="relative bg-ktgw-green-dark py-16 text-white sm:py-20">
      <h2 id="stats-title" className="sr-only">
        KTGW Togo en chiffres
      </h2>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-6 lg:px-8">
        {keyFigures(partners.length).map((f) => {
          const Icon = figureIcons[f.icon];
          return (
            <StatCounter
              key={f.label}
              inverted
              value={f.value}
              suffix={f.suffix}
              label={f.label}
              icon={<Icon className="size-6" />}
            />
          );
        })}
      </div>
    </section>
  );
}

/** Qui sommes-nous : texte, photo et devise. */
export function AboutPreview() {
  return (
    <Section aria-labelledby="about-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src={images.plantingPartners.src}
              alt={images.plantingPartners.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-2 -bottom-6 max-w-[16rem] rounded-2xl bg-card p-5 shadow-xl ring-1 ring-foreground/5 sm:-right-6">
            <p className="font-heading text-4xl font-extrabold text-ktgw-red">2008</p>
            <p className="text-sm text-muted-foreground">
              Fondée à Cologne, active au Togo depuis plus de {new Date().getFullYear() - 2008} ans.
            </p>
          </div>
          <div aria-hidden className="absolute -top-5 -left-5 -z-10 size-32 rounded-full bg-ktgw-sun/30 blur-2xl" />
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-6">
          <SectionTitle
            id="about-title"
            eyebrow="Qui sommes-nous"
            title={
              <>
                Une ONG togolaise, un pont avec <span className="font-accent text-ktgw-red italic">l&apos;Allemagne</span>
              </>
            }
          />
          <p className="text-lg leading-relaxed text-muted-foreground">
            KommTogoGehWeiter Togo (KTGW Togo) est la branche togolaise de <strong className="text-foreground">kommTOGOgehweiter e.V.</strong>, une
            association d&apos;utilité publique fondée à Cologne. Elle est née lorsque le Togo s&apos;est qualifié pour la Coupe du monde 2006.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Bénévoles d&apos;Allemagne, de France et du Togo, nous agissons à Lomé, Aného, Kpalimé, Atakpamé, Kara et Dapaong. Nous offrons aux
            jeunes, et surtout aux jeunes filles, une formation qui leur permet de vivre dignement de leur métier.
          </p>
          <figure className="relative rounded-2xl border-l-4 border-ktgw-sun bg-accent p-6">
            <Quote aria-hidden className="absolute top-4 right-4 size-8 text-ktgw-sun/60" />
            <blockquote className="font-accent text-xl leading-snug font-semibold italic">
              « Chaque centime investi dans l&apos;éducation en Afrique protège des chemins dangereux vers l&apos;Europe. »
            </blockquote>
            <figcaption className="mt-2 text-sm text-muted-foreground">Devise de kommTOGOgehweiter e.V.</figcaption>
          </figure>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/a-propos" size="xl">
              En savoir plus
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href="/objectifs" size="xl" variant="outline">
              Nos 13 objectifs
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/** Les 5 domaines d'action. */
export function DomainsGrid() {
  return (
    <Section tone="muted" aria-labelledby="domains-title">
      <SectionTitle
        id="domains-title"
        eyebrow="Nos domaines d'action"
        title="Cinq leviers pour l'avenir des jeunes"
        description="Former, insérer, ouvrir au monde, autonomiser et préserver : nos actions se complètent pour un impact durable."
        align="center"
      />
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {domains.map((d, i) => (
          <li key={d.title}>
            <Reveal delay={i * 80} className="h-full">
              <Link
                href={d.href}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[image:var(--gradient-sun)] transition-transform duration-500 group-hover:scale-x-100"
                />
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-ktgw-red transition-all duration-300 group-hover:rotate-6 group-hover:bg-ktgw-red-strong group-hover:text-white">
                  <d.icon aria-hidden className="size-7" />
                </span>
                <h3 className="text-lg leading-snug font-bold">{d.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{d.text}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-ktgw-red">
                  Découvrir
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Projets phares. */
export async function FeaturedProjects() {
  const projects = await getProjects();
  return (
    <Section aria-labelledby="projects-title">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionTitle
          id="projects-title"
          eyebrow="Projets phares"
          title="Des projets concrets, des vies transformées"
          description="Chaque projet répond à un besoin identifié sur le terrain, avec nos partenaires togolais et allemands."
        />
        <ButtonLink href="/projets" variant="outline" size="xl" className="shrink-0">
          Tous nos projets
          <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <li key={p.slug} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}>
            <Reveal delay={i * 100} className="h-full">
              <ProjectCard project={p} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Aperçu des objectifs (6 sur 13). */
export function ObjectivesPreview() {
  return (
    <Section tone="green" aria-labelledby="objectives-title" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-ktgw-sun/15 blur-3xl" />
      <SectionTitle
        id="objectives-title"
        eyebrow="Nos objectifs"
        title="13 engagements pour le Togo"
        description="De l'éducation à l'environnement, nos objectifs guident chacune de nos actions."
        align="center"
        inverted
      />
      <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {objectives.slice(0, 6).map((o, i) => (
          <li key={o.title}>
            <Reveal delay={i * 70} className="flex h-full gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ktgw-sun text-ink">
                <o.icon aria-hidden className="size-6" />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-ktgw-sun">{String(i + 1).padStart(2, "0")}</p>
                <p className="font-medium leading-snug">{o.title}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex justify-center">
        <ButtonLink href="/objectifs" variant="sun" size="xl">
          Voir les 13 objectifs
          <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
    </Section>
  );
}

/** Prochains événements. */
export async function UpcomingEvents() {
  const list = (await upcomingEvents()).slice(0, 3);
  return (
    <Section aria-labelledby="events-title">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionTitle id="events-title" eyebrow="Agenda" title="Prochains événements" description="Rejoignez-nous sur le terrain ou en ligne." />
        <ButtonLink href="/evenements" variant="outline" size="xl" className="shrink-0">
          Tout l&apos;agenda
          <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
      {list.length > 0 ? (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => (
            <li key={e.slug}>
              <Reveal delay={i * 100} className="h-full">
                <EventCard event={e} />
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-2xl bg-muted p-8 text-center text-muted-foreground">
          Aucun événement programmé pour le moment. Revenez bientôt !
        </p>
      )}
    </Section>
  );
}

/** Dernières actualités. */
export async function LatestNews() {
  const posts = await getPostsFor("accueil");
  if (!posts.length) return null;
  return (
    <Section tone="muted" aria-labelledby="news-title">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionTitle id="news-title" eyebrow="Actualités" title="Les dernières nouvelles du terrain" />
        <ButtonLink href="/actualites" variant="outline" size="xl" className="shrink-0">
          Toutes les actualités
          <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((p, i) => (
          <li key={p.slug} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}>
            <Reveal delay={i * 100} className="h-full">
              <PostCard post={p} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Partenaires : défilement infini + appel à partenariat. */
export async function PartnersSection() {
  const partners = await getPartners();
  const loop = [...partners, ...partners];
  return (
    <section aria-labelledby="partners-title" className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          id="partners-title"
          eyebrow="Ils nous font confiance"
          title="Nos partenaires"
          description="Institutions, associations et entreprises du Togo et d'Allemagne engagées à nos côtés."
          align="center"
        />
      </div>

      <div className="group relative mt-12 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
          {loop.map((p, i) => (
            <li key={`${p.name}-${i}`} aria-hidden={i >= partners.length} className="motion-reduce:nth-[n+9]:hidden">
              <PartnerChip partner={p} tabbable={i < partners.length} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative grid overflow-hidden rounded-3xl bg-ink text-white shadow-xl lg:grid-cols-2">
          <div className="relative min-h-64 lg:min-h-full">
            <Image src={images.guests.src} alt={images.guests.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-ink" />
          </div>
          <div className="flex flex-col gap-5 p-8 sm:p-12">
            <p className="text-sm font-semibold tracking-widest text-ktgw-sun uppercase">Devenez notre partenaire</p>
            <h3 className="text-3xl font-extrabold sm:text-4xl">
              Construisons ensemble <span className="font-accent text-ktgw-sun italic">l&apos;avenir</span> des jeunes du Togo
            </h3>
            <p className="leading-relaxed text-white/80">
              ONG, entreprise, fondation, institution ou ambassade : apportez un soutien financier, technique, matériel ou des compétences.
              Votre demande nous parvient en 2 minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/partenariat" size="xl" variant="sun">
                <Handshake aria-hidden />
                Proposer un partenariat
              </ButtonLink>
              <ButtonLink href="/contact" size="xl" variant="link" className="text-white hover:text-ktgw-sun">
                Nous contacter
                <ArrowRight aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PartnerChip({ partner, tabbable }: { partner: Partner; tabbable: boolean }) {
  const content = (
    <>
      <PartnerMark partner={partner} />
      <span className="flex flex-col">
        <span className="font-heading text-sm font-bold whitespace-nowrap">{partner.name}</span>
        <span className="text-xs text-muted-foreground">{partner.country}</span>
      </span>
    </>
  );
  const cls =
    "flex items-center gap-3 rounded-2xl bg-card py-3 pr-6 pl-3 shadow-soft ring-1 ring-foreground/5 transition-transform hover:-translate-y-0.5";
  if (!partner.url) return <div className={cls}>{content}</div>;
  const external = partner.url.startsWith("http");
  return external ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" tabIndex={tabbable ? undefined : -1} className={cls}>
      {content}
    </a>
  ) : (
    <Link href={partner.url} tabIndex={tabbable ? undefined : -1} className={cls}>
      {content}
    </Link>
  );
}

/** Bandeau d'appel final sur fond dégradé soleil. */
export function FinalCta() {
  return (
    <Section tone="sun" aria-labelledby="cta-title" className="relative overflow-hidden">
      <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -top-20 -right-20 size-80 text-white/25 motion-safe:animate-rays">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="97" y="0" width="6" height="45" rx="3" fill="currentColor" transform={`rotate(${i * 30} 100 100)`} />
        ))}
      </svg>
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Heart aria-hidden className="size-12 fill-ktgw-red-strong text-ktgw-red-strong" />
        <h2 id="cta-title" className="text-3xl font-extrabold sm:text-5xl">
          Chaque centime pour l&apos;éducation <span className="font-accent italic">compte</span>
        </h2>
        <p className="text-lg text-ink/80">
          Un don, du temps, des compétences : chaque engagement aide un jeune à apprendre un métier et à construire son avenir au Togo.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/faire-un-don" size="xl">
            <Heart aria-hidden className="fill-current" />
            Faire un don
          </ButtonLink>
          <ButtonLink href="/s-engager#benevolat" size="xl" variant="white">
            <Users aria-hidden />
            Devenir bénévole
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
