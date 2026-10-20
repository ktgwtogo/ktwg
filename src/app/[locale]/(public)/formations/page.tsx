import { ArrowRight, BedDouble, BookOpen, Briefcase, Globe2, Languages, Users, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { TrainingApplicationForm } from "@/components/forms/other-forms";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { images } from "@/content/images";
import { courses } from "@/content/organization";

export const metadata: Metadata = {
  title: "Formations professionnelles bilingues",
  description:
    "Coutellerie, comptabilité, mécanique, énergies renouvelables, informatique : des formations professionnelles bilingues français–allemand au Togo. Clubs d'allemand et candidature en ligne.",
};

const approach = [
  { icon: Wrench, title: "Pratique avant tout", text: "L'essentiel de la formation se fait en atelier, sur des cas réels." },
  { icon: Languages, title: "Bilingue français–allemand", text: "Un atout pour les échanges avec les partenaires et l'ouverture internationale." },
  { icon: Briefcase, title: "Cap sur l'emploi", text: "Accompagnement vers l'emploi, l'installation à son compte et la création de PME." },
  { icon: BedDouble, title: "Internat pour les filles", text: "Les apprenties venues de loin peuvent être hébergées en sécurité." },
];

export default async function TrainingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={images.workersGroup}
        eyebrow="Formations"
        title={
          <>
            Apprendre un métier, <span className="font-accent text-ktgw-sun italic">en deux langues</span>
          </>
        }
        description="Des formations professionnelles concrètes, en français et en allemand, pour que chaque jeune puisse gagner sa vie."
        breadcrumbs={[{ label: "Formations" }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/formations#candidature" size="xl">
            Candidater
            <ArrowRight aria-hidden />
          </ButtonLink>
          <ButtonLink href="/formations#filieres" size="xl" variant="white">
            Voir les filières
          </ButtonLink>
        </div>
      </PageHeader>

      <Section aria-labelledby="approach-title">
        <SectionTitle id="approach-title" eyebrow="Notre approche" title="Une formation qui mène à l'autonomie" align="center" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((a, i) => (
            <li key={a.title}>
              <Reveal delay={i * 80} className="flex h-full flex-col gap-3 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <a.icon aria-hidden className="size-9 text-ktgw-green" />
                <h3 className="text-lg font-bold">{a.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{a.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="filieres" tone="muted" aria-labelledby="courses-title" className="scroll-mt-28">
        <SectionTitle
          id="courses-title"
          eyebrow="Nos filières"
          title="Six domaines pour bâtir son avenir"
          description="Des métiers utiles au Togo, porteurs d'emploi et d'entrepreneuriat."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <li key={c.title}>
              <Reveal
                delay={(i % 3) * 80}
                className="group flex h-full gap-5 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ktgw-sun text-ink transition-transform group-hover:rotate-6">
                  <c.icon aria-hidden className="size-7" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="clubs-allemand" aria-labelledby="clubs-title" className="scroll-mt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
            <Image src={images.plantingEmbassy.src} alt={images.plantingEmbassy.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-6">
            <SectionTitle id="clubs-title" eyebrow="Éducation interculturelle" title="Les clubs de langue allemande" />
            <p className="leading-relaxed text-muted-foreground">
              Dans les écoles togolaises, nos clubs d&apos;allemand font découvrir la langue et la culture allemandes de façon vivante : jeux,
              chansons, correspondance et échanges avec des jeunes en Allemagne.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { icon: Globe2, text: "Ouverture au monde et aux échanges Togo–Allemagne" },
                { icon: BookOpen, text: "Soutien à l'apprentissage de l'allemand à l'école" },
                { icon: Users, text: "Rencontres entre clubs et avec les bénévoles de Cologne" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-ktgw-red">
                    <item.icon aria-hidden className="size-5" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
            <ButtonLink href="/contact" size="xl" variant="secondary" className="w-fit">
              Ouvrir un club dans mon école
              <ArrowRight aria-hidden />
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <Section id="candidature" tone="muted" aria-labelledby="apply-title" className="scroll-mt-28">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <SectionTitle
              id="apply-title"
              eyebrow="Candidature"
              title="Je veux apprendre un métier"
              description="Remplissez ce formulaire : notre équipe vous recontacte pour un entretien d'orientation."
            />
            <ol className="flex flex-col gap-4">
              {["Je remplis le formulaire", "L'équipe me rappelle", "Entretien d'orientation", "Début de la formation"].map((s, i) => (
                <li key={s} className="flex items-center gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ktgw-red-strong font-heading font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-10 lg:col-span-3">
            <TrainingApplicationForm />
          </div>
        </div>
      </Section>
    </>
  );
}
