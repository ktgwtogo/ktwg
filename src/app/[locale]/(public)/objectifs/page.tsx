import { Award, CheckCircle2, Globe2, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { DomainsGrid, FinalCta } from "@/components/sections/home-sections";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { images } from "@/content/images";
import { objectives, presidentFounder, unSdgs } from "@/content/organization";

export const metadata: Metadata = {
  title: "Les 17 ODD des Nations Unies & Objectifs KTGW Togo",
  description:
    "Éducation de qualité, industrie mécatronique, agroalimentaire, égalité des sexes, énergie propre : comment KTGW Togo met en œuvre les 17 Objectifs de Développement Durable (ODD) de l'ONU au Togo sous la direction de M. Blaise-Pascal D'ALMEIDA.",
};

export default async function ObjectivesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={images.plantingWoman}
        eyebrow="Nations Unies & Développement Durable"
        title="Les 17 ODD de l'ONU au cœur de l'action de KTGW Togo"
        description="L'ONG KommTogoGehweiter Togo arrime chacun de ses programmes statutaires aux 17 Objectifs de Développement Durable des Nations Unies pour transformer durablement l'avenir des jeunes au Togo."
        breadcrumbs={[{ label: "À propos", href: "/a-propos" }, { label: "Nos objectifs ODD" }]}
      />

      {/* Mot du Président-Fondateur */}
      <Section width="narrow">
        <div className="rounded-3xl border-2 border-ktgw-sun/40 bg-gradient-to-br from-card via-card to-ktgw-sun/10 p-6 shadow-xl sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-ktgw-red text-white shadow-lg">
              <Target className="size-8" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest text-ktgw-red uppercase">Vision de la Présidence</span>
              <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                {presidentFounder.name} — <span className="text-ktgw-green-strong">{presidentFounder.title}</span>
              </h2>
              <blockquote className="mt-2 border-l-2 border-ktgw-sun pl-3 font-accent text-base italic text-muted-foreground sm:text-lg">
                « {presidentFounder.quote} »
              </blockquote>
            </div>
          </div>
        </div>
      </Section>

      {/* Les 17 ODD des Nations Unies au Togo */}
      <Section id="17-odd" aria-labelledby="sdg-title" tone="muted">
        <SectionTitle
          id="sdg-title"
          eyebrow="Cadre Universel de l'ONU"
          title="Les 17 Objectifs de Développement Durable (ODD)"
          description="Chaque projet de formation professionnelle, d'internat pour les filles ou d'agroalimentaire contribue directement à l'agenda 2030 des Nations Unies."
          align="center"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {unSdgs.map((sdg) => (
            <Reveal key={sdg.number} className="h-full">
              <div
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                style={{ borderTop: `4px solid ${sdg.color}` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="flex size-10 items-center justify-center rounded-xl font-heading text-lg font-black text-white shadow"
                      style={{ backgroundColor: sdg.color }}
                    >
                      {sdg.number}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                      ONU · SDG
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-ktgw-green-strong">
                    {locale === "de" ? sdg.deTitle : locale === "en" ? sdg.enTitle : sdg.title}
                  </h3>
                </div>
                <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Action KTGW Togo : </span>
                  {sdg.actionTogo}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Liste des Objectifs statutaires */}
      <Section aria-labelledby="objectives-list">
        <SectionTitle
          id="objectives-list"
          eyebrow="Nos Engagements Statutaires"
          title="Nos objectifs pour la jeunesse et les femmes du Togo"
          description="Découvrez nos axes d'intervention opérationnels sur le terrain togolais."
        />
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {objectives.map((o, i) => (
            <li key={o.title}>
              <Reveal
                delay={(i % 3) * 80}
                className="group flex h-full flex-col justify-between gap-5 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-ktgw-red transition-colors group-hover:bg-ktgw-red-strong group-hover:text-white">
                      <o.icon aria-hidden className="size-7" />
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span aria-hidden className="font-heading text-4xl font-extrabold text-foreground/[0.08]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-full bg-ktgw-green/10 px-2.5 py-0.5 text-xs font-bold text-ktgw-green-dark">
                        {o.odd}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-snug font-semibold text-foreground">
                    <span className="sr-only">Objectif {i + 1} : </span>
                    {o.title}
                  </p>
                </div>

                {i === 5 && (
                  <div className="relative mt-2 h-44 w-full overflow-hidden rounded-xl border border-foreground/10 shadow-inner">
                    <Image
                      src={images.agroalimentaire.src}
                      alt={images.agroalimentaire.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs font-bold text-white">
                      Filière Transformation Agroalimentaire
                    </span>
                  </div>
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      <DomainsGrid />

      <FinalCta />
    </>
  );
}
