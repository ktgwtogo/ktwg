import { BadgeCheck, Coins, Eye, Globe2, HandHeart, Package, UsersRound, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PartnershipForm } from "@/components/forms/partnership-form";
import { PartnerMark } from "@/components/shared/badges";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { images } from "@/content/images";
import { getPartners } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Devenir partenaire",
  description:
    "ONG, entreprise, fondation, institution, ambassade : devenez partenaire de KTGW Togo pour la formation professionnelle et l'autonomisation des jeunes au Togo.",
};

const reasons = [
  { icon: Eye, title: "Un impact visible", text: "Des projets concrets et mesurables : formation, insertion, internat, environnement." },
  { icon: BadgeCheck, title: "Transparence", text: "Suivi des actions, rapports réguliers et publication de nos comptes." },
  { icon: Globe2, title: "Un réseau international", text: "Un pont entre le Togo, l'Allemagne et la France, active depuis 2018 au Togo." },
];

const contributions = [
  { icon: Coins, title: "Financier", text: "Financement d'un projet, d'une promotion d'apprentis ou de l'internat." },
  { icon: Wrench, title: "Technique", text: "Expertise métier, ingénierie de formation, appui aux jeunes entrepreneurs." },
  { icon: Package, title: "Matériel", text: "Outils, équipements d'atelier, matériel informatique ou solaire." },
  { icon: UsersRound, title: "Humain", text: "Formateurs, tuteurs, bénévoles, échanges de stagiaires." },
  { icon: HandHeart, title: "Mécénat de compétences", text: "Vos collaborateurs mettent leur savoir-faire au service des jeunes." },
];

export default async function PartnershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={images.guests}
        eyebrow="Partenariat"
        title={
          <>
            Investissez dans <span className="font-accent text-ktgw-sun italic">la jeunesse</span> du Togo
          </>
        }
        description="Rejoignez les institutions, associations et entreprises qui font confiance à KTGW Togo. Votre demande nous parvient en 2 minutes."
        breadcrumbs={[{ label: "S'engager", href: "/s-engager" }, { label: "Devenir partenaire" }]}
      />

      <Section aria-labelledby="why-title">
        <SectionTitle id="why-title" eyebrow="Pourquoi nous rejoindre" title="Un partenariat utile et transparent" align="center" />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {reasons.map((r, i) => (
            <li key={r.title}>
              <Reveal delay={i * 100} className="flex h-full flex-col items-center gap-4 rounded-2xl bg-card p-8 text-center shadow-soft ring-1 ring-foreground/5">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-ktgw-red">
                  <r.icon aria-hidden className="size-7" />
                </span>
                <h3 className="text-xl font-bold">{r.title}</h3>
                <p className="text-muted-foreground">{r.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted" aria-labelledby="contrib-title">
        <SectionTitle id="contrib-title" eyebrow="Formes de soutien" title="Ce que vous pouvez apporter" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {contributions.map((c) => (
            <li key={c.title} className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
              <c.icon aria-hidden className="size-8 text-ktgw-green" />
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="form-title">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <SectionTitle
              id="form-title"
              eyebrow="Votre demande"
              title="Proposer un partenariat"
              description="Trois étapes rapides. Notre équipe vous répond sous quelques jours pour organiser un premier échange."
            />
            <div className="rounded-2xl bg-accent p-6">
              <h3 className="mb-4 font-bold">Ils sont déjà à nos côtés</h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {(await getPartners()).map((p) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <PartnerMark partner={p} className="size-10 rounded-xl text-[10px]" />
                    <span className="text-sm font-semibold">{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-10 lg:col-span-3">
            <PartnershipForm />
          </div>
        </div>
      </Section>
    </>
  );
}
