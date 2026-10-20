import { ArrowRight, CalendarCheck, Handshake, Heart, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { ProgressBar } from "@/components/shared/badges";
import { ProjectCard } from "@/components/shared/cards";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { getProject, projects, statusLabels } from "@/content/projects";
import { routing } from "@/i18n/routing";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { images: [{ url: project.image.src, alt: project.image.alt }] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = getProject(slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <>
      <PageHeader
        image={project.image}
        eyebrow={project.tagline}
        title={project.title}
        description={project.summary}
        breadcrumbs={[{ label: "Projets", href: "/projets" }, { label: project.title }]}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-ktgw-sun px-3 py-1 font-semibold text-ink">{statusLabels[project.status]}</span>
          <span className="flex items-center gap-1.5 text-white/85">
            <MapPin aria-hidden className="size-4" />
            {project.location}
          </span>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <article className="flex flex-col gap-6 lg:col-span-2">
            <h2 className="text-3xl font-extrabold">Le projet</h2>
            {project.body.map((para, i) => (
              <p key={i} className={i === 0 ? "text-lg leading-relaxed text-foreground/90" : "leading-relaxed text-muted-foreground"}>
                {para}
              </p>
            ))}

            {project.milestones && (
              <div className="mt-6">
                <h2 className="mb-6 text-2xl font-bold">Étapes clés</h2>
                <ol className="flex flex-col gap-6 border-l-2 border-ktgw-sun/60 pl-6">
                  {project.milestones.map((m) => (
                    <li key={m.date} className="relative">
                      <span aria-hidden className="absolute top-1 -left-[2.05rem] flex size-4 rounded-full bg-ktgw-green-strong ring-4 ring-background" />
                      <time dateTime={m.date} className="flex items-center gap-2 text-sm font-semibold text-ktgw-red">
                        <CalendarCheck aria-hidden className="size-4" />
                        {formatDate(m.date, locale, m.date.endsWith("-01") ? "month" : "long")}
                      </time>
                      <p className="mt-1">{m.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>

          <aside className="flex flex-col gap-6" aria-label="Informations clés">
            <div className="rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 lg:sticky lg:top-28">
              <h2 className="mb-4 text-lg font-bold">En bref</h2>
              <dl className="flex flex-col divide-y">
                {project.facts.map((f) => (
                  <div key={f.label} className="flex flex-col gap-0.5 py-3 first:pt-0">
                    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{f.label}</dt>
                    <dd className="font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
              {project.progress && (
                <ProgressBar
                  className="mt-4"
                  value={project.progress.current}
                  max={project.progress.target}
                  label={`${project.progress.label} : ${project.progress.current} / ${project.progress.target} ${project.progress.unit}`}
                />
              )}
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink href={`/faire-un-don?projet=${project.slug}`} size="xl">
                  <Heart aria-hidden className="fill-current" />
                  Soutenir ce projet
                </ButtonLink>
                <ButtonLink href="/partenariat" size="xl" variant="outline">
                  <Handshake aria-hidden />
                  Devenir partenaire
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {project.gallery.length > 0 && (
        <Section tone="muted" aria-labelledby="project-gallery">
          <SectionTitle id="project-gallery" eyebrow="En images" title="Le projet sur le terrain" />
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {project.gallery.map((img, i) => (
              <li key={img.src} className={i === 0 ? "col-span-2 row-span-2" : undefined}>
                <div className="relative aspect-square overflow-hidden rounded-2xl shadow-soft">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section aria-labelledby="other-projects">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle id="other-projects" eyebrow="À découvrir aussi" title="Nos autres projets" />
          <ButtonLink href="/projets" variant="outline" size="xl">
            Tous les projets
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {others.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
