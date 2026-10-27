import {
  ArrowRight,
  Award,
  Globe2,
  Handshake,
  Heart,
  Home,
  MapPinned,
  Quote,
  Sparkles,
  Sprout,
  Target,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button-link";
import { PartnerMark } from "@/components/shared/badges";
import { EventCard, PostCard, ProjectCard } from "@/components/shared/cards";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { StatCounter } from "@/components/shared/stat-counter";
import { images } from "@/content/images";
import { domains, keyFigures, objectives, presidentFounder } from "@/content/organization";
import type { Partner } from "@/content/partners";
import { getPartners, getPostsFor, getProjects, upcomingEvents } from "@/lib/content/repository";
import { Link } from "@/i18n/navigation";

const figureIcons = { sprout: Sprout, map: MapPinned, target: Target, home: Home, handshake: Handshake, globe: Globe2 };

/** Spotlight d'annonce Bourse Mécatronique affiché sur l'accueil. */
export function BourseAnnouncementSpotlight() {
  const t = useTranslations("HomeSections.bourse");

  return (
    <aside aria-label="Appel à candidature Mécatronique Industrielle" className="relative z-10 -mt-7 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-ktgw-red p-4 text-white shadow-2xl ring-1 ring-white/15 sm:flex-row sm:p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ktgw-red text-white shadow-lg animate-pulse">
            <Award className="size-6" />
          </span>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ktgw-sun px-2.5 py-0.5 text-xs font-black text-slate-950 uppercase tracking-wide">
                {t("badge")}
              </span>
              <span className="text-xs text-white/80">{t("dates")}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">
              {t("title")}
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
          <Link
            href="/formations#bourse-mecatronique"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ktgw-red px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-ktgw-red-strong sm:w-auto"
          >
            {t("cta")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

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

/** Qui sommes-nous : texte, photo, Président-Fondateur et devise. */
export function AboutPreview() {
  const t = useTranslations("HomeSections.about");

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
          <div className="absolute -right-2 -bottom-6 max-w-[17rem] rounded-2xl bg-card p-5 shadow-xl ring-1 ring-foreground/5 sm:-right-6">
            <p className="font-heading text-4xl font-extrabold text-ktgw-red">2018</p>
            <p className="text-xs font-semibold uppercase text-ktgw-green-strong">Depuis plus de {new Date().getFullYear() - 2018} ans au Togo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {presidentFounder.name}
              <br />
              <span className="font-bold text-foreground">{presidentFounder.title}</span>
            </p>
          </div>
          <div aria-hidden className="absolute -top-5 -left-5 -z-10 size-32 rounded-full bg-ktgw-sun/30 blur-2xl" />
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-6">
          <SectionTitle
            id="about-title"
            eyebrow={t("eyebrow")}
            title={
              <>
                {t("titlePart1")}
                <span className="font-accent text-ktgw-red italic">{t("titlePart2")}</span>
              </>
            }
          />
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t("text1")}
          </p>
          <p className="leading-relaxed text-muted-foreground">
            {t("text2")}
          </p>
          <figure className="relative rounded-2xl border-l-4 border-ktgw-sun bg-accent p-6">
            <Quote aria-hidden className="absolute top-4 right-4 size-8 text-ktgw-sun/60" />
            <blockquote className="font-accent text-xl leading-snug font-semibold italic text-foreground">
              « {t("quote")} »
            </blockquote>
            <figcaption className="mt-2 text-xs font-medium text-muted-foreground">
              {t("quoteAuthor")}
            </figcaption>
          </figure>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/a-propos" size="xl">
              {t("learnMore")}
              <ArrowRight aria-hidden />
            </ButtonLink>
            <ButtonLink href="/objectifs" size="xl" variant="outline">
              {t("ourObjectives")}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/** Les 5 domaines d'action. */
export function DomainsGrid() {
  const t = useTranslations("HomeSections.domains");

  return (
    <Section tone="muted" aria-labelledby="domains-title">
      <SectionTitle
        id="domains-title"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
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
                  {t("discover")}
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
          description="Chaque projet répond à un besoin identifié sur le terrain au Togo, en étroite coopération avec nos partenaires."
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

/** Aperçu des 6 objectifs statutaires & ODD de l'ONU (avec Agroalimentaire au 6ème). */
export function ObjectivesPreview() {
  const t = useTranslations("HomeSections.objectives");

  return (
    <Section tone="green" aria-labelledby="objectives-title" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-ktgw-sun/15 blur-3xl" />
      <SectionTitle
        id="objectives-title"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("subtitle")}
        align="center"
        inverted
      />
      <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {objectives.slice(0, 6).map((o, i) => (
          <li key={o.title}>
            <Reveal delay={i * 70} className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ktgw-sun text-ink shadow">
                  <o.icon aria-hidden className="size-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold text-ktgw-sun">{String(i + 1).padStart(2, "0")}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">{o.odd}</span>
                  </div>
                  <p className="font-semibold leading-snug text-white">{o.title}</p>
                </div>
              </div>
              {i === 5 && (
                <div className="relative mt-3 h-28 w-full overflow-hidden rounded-xl border border-white/15">
                  <Image
                    src={images.agroalimentaire.src}
                    alt={images.agroalimentaire.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                    Atelier Agroalimentaire Togo
                  </span>
                </div>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex justify-center">
        <ButtonLink href="/objectifs" variant="sun" size="xl">
          {t("cta")}
          <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
    </Section>
  );
}

/** Prochains événements. */
export async function UpcomingEvents() {
  const t = useTranslations("HomeSections.events");
  const list = (await upcomingEvents()).slice(0, 3);
  return (
    <Section aria-labelledby="events-title">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionTitle id="events-title" eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />
        <ButtonLink href="/evenements" variant="outline" size="xl" className="shrink-0">
          {t("cta")}
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
          {t("none")}
        </p>
      )}
    </Section>
  );
}

/** Dernières actualités. */
export async function LatestNews() {
  const t = useTranslations("HomeSections.news");
  const posts = await getPostsFor("accueil");
  if (!posts.length) return null;
  return (
    <Section tone="muted" aria-labelledby="news-title">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionTitle id="news-title" eyebrow={t("eyebrow")} title={t("title")} />
        <ButtonLink href="/actualites" variant="outline" size="xl" className="shrink-0">
          {t("cta")}
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
  const t = useTranslations("HomeSections.partners");
  const partners = await getPartners();
  const loop = [...partners, ...partners];
  return (
    <section aria-labelledby="partners-title" className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          id="partners-title"
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
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
            <p className="text-sm font-semibold tracking-widest text-ktgw-sun uppercase">{t("bannerEyebrow")}</p>
            <h3 className="text-3xl font-extrabold sm:text-4xl">
              {t("bannerTitle")}
            </h3>
            <p className="leading-relaxed text-white/80">
              {t("bannerText")}
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/partenariat" size="xl" variant="sun">
                <Handshake aria-hidden />
                {t("propose")}
              </ButtonLink>
              <ButtonLink href="/contact" size="xl" variant="link" className="text-white hover:text-ktgw-sun">
                {t("contact")}
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
  const t = useTranslations("HomeSections.finalCta");

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
          {t("title")}
        </h2>
        <p className="text-lg text-ink/80">
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/faire-un-don" size="xl">
            <Heart aria-hidden className="fill-current" />
            {t("donate")}
          </ButtonLink>
          <ButtonLink href="/s-engager#benevolat" size="xl" variant="white">
            <Users aria-hidden />
            {t("volunteer")}
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
