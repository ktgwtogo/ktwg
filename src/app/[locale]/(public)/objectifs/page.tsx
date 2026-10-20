import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DomainsGrid, FinalCta } from "@/components/sections/home-sections";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { images } from "@/content/images";
import { objectives } from "@/content/organization";

export const metadata: Metadata = {
  title: "Nos 13 objectifs",
  description: "Éducation, insertion, droits des femmes, entrepreneuriat, santé, environnement, échanges Togo–Allemagne : les 13 objectifs de KTGW Togo.",
};

export default async function ObjectivesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={images.plantingWoman}
        eyebrow="Nos objectifs"
        title="13 engagements pour la jeunesse du Togo"
        description="Nos objectifs statutaires guident chacun de nos projets, de la salle de formation jusqu'aux plantations d'arbres."
        breadcrumbs={[{ label: "À propos", href: "/a-propos" }, { label: "Nos objectifs" }]}
      />

      <Section aria-labelledby="objectives-list">
        <h2 id="objectives-list" className="sr-only">
          Liste des 13 objectifs
        </h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {objectives.map((o, i) => (
            <li key={o.title}>
              <Reveal
                delay={(i % 3) * 80}
                className="group flex h-full flex-col gap-5 rounded-2xl bg-card p-7 shadow-soft ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-ktgw-red transition-colors group-hover:bg-ktgw-red-strong group-hover:text-white">
                    <o.icon aria-hidden className="size-7" />
                  </span>
                  <span aria-hidden className="font-heading text-5xl font-extrabold text-foreground/[0.07]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-lg leading-snug font-semibold">
                  <span className="sr-only">Objectif {i + 1} : </span>
                  {o.title}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <DomainsGrid />

      <Section aria-labelledby="sdg-title" width="narrow">
        <SectionTitle
          id="sdg-title"
          eyebrow="Un cap commun"
          title="Des objectifs alignés sur le développement durable"
          description="Éducation de qualité, égalité entre les femmes et les hommes, travail décent, énergie propre, action pour le climat : nos objectifs contribuent aux grands enjeux du développement durable au Togo."
          align="center"
        />
      </Section>

      <FinalCta />
    </>
  );
}
