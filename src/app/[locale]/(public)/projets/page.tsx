import { T } from "@/components/edit/editable";
import { ClipboardCheck, GraduationCap, Handshake, Search } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FinalCta } from "@/components/sections/home-sections";
import { ProjectCard } from "@/components/shared/cards";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { getSiteImages } from "@/lib/site/settings";
import { getProjects } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Nos projets",
  description: "Centre de formation CEFOPEXD, internat pour jeunes filles, Femmes solaires : découvrez les projets de KTGW Togo.",
};

const method = [
  { icon: Search, title: "Écouter le terrain", text: "Chaque projet part d'un besoin exprimé par les jeunes, les familles et les communautés." },
  { icon: Handshake, title: "Construire avec les partenaires", text: "Partenaires togolais et allemands apportent financement, expertise et matériel." },
  { icon: GraduationCap, title: "Former et accompagner", text: "Formation pratique, suivi personnalisé et appui à l'insertion professionnelle." },
  { icon: ClipboardCheck, title: "Mesurer et rendre compte", text: "Suivi des actions, rapports aux bailleurs et publication sur la page Transparence." },
];

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteImages = await getSiteImages();
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={siteImages["banner.projets"]} imageId="banner.projets"
        eyebrow={<T s="projets">{"Nos projets"}</T>}
        title={<T s="projets">{"Des projets qui changent des vies"}</T>}
        description={<T s="projets">{"Formation professionnelle, hébergement des apprenties, énergie solaire : nos projets répondent à des besoins concrets du terrain."}</T>}
        breadcrumbs={[{ label: "Projets" }]}
      />

      <Section aria-labelledby="projects-list">
        <h2 id="projects-list" className="sr-only"><T s="projets">{"Liste des projets"}</T></h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(await getProjects()).map((p, i) => (
            <li key={p.slug} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}>
              <Reveal delay={i * 100} className="h-full">
                <ProjectCard project={p} priority={i === 0} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted" aria-labelledby="method-title">
        <SectionTitle id="method-title" eyebrow={<T s="projets">{"Notre méthode"}</T>} title={<T s="projets">{"Comment nous menons nos projets"}</T>} align="center" />
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {method.map((m, i) => (
            <li key={m.title}>
              <Reveal delay={i * 80} className="relative flex h-full flex-col gap-3 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <span className="font-heading text-sm font-extrabold text-ktgw-red"><T s="projets">{"Étape"}</T>{" "}{i + 1}</span>
                <m.icon aria-hidden className="size-8 text-ktgw-green" />
                <h3 className="text-lg font-bold"><T s="projets">{m.title}</T></h3>
                <p className="text-sm leading-relaxed text-muted-foreground"><T s="projets">{m.text}</T></p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <FinalCta />
    </>
  );
}
