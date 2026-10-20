import { BookCheck, Clock, FileText, Mail, PieChart, Scale, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { images } from "@/content/images";

export const metadata: Metadata = {
  title: "Transparence",
  description: "Statuts, rapports d'activité et rapports financiers de KTGW Togo : nos engagements de transparence envers les donateurs et partenaires.",
};

const commitments = [
  { icon: Scale, title: "Gestion rigoureuse", text: "Les fonds sont affectés aux projets prévus et suivis conjointement avec kommTOGOgehweiter e.V." },
  { icon: PieChart, title: "Comptes publiés", text: "Nos rapports financiers annuels sont mis à disposition des donateurs et partenaires." },
  { icon: BookCheck, title: "Suivi des actions", text: "Chaque action terrain est enregistrée : lieu, date, bénéficiaires, budget et photos." },
  { icon: ShieldCheck, title: "Protection des données", text: "Les données des bénéficiaires et donateurs sont protégées et jamais revendues." },
];

/** Documents : l'URL sera renseignée depuis le dashboard (Supabase Storage, Phase 5). */
const documents: { title: string; description: string; url?: string }[] = [
  { title: "Statuts de l'association", description: "Objet, organisation et fonctionnement de KTGW Togo." },
  { title: "Rapport d'activité 2025", description: "Bilan des projets, formations et événements de l'année." },
  { title: "Rapport financier 2025", description: "Ressources, emplois des fonds et répartition par projet." },
];

export default async function TransparencyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={images.guests}
        eyebrow="Transparence"
        title="Rendre compte, à chaque étape"
        description="La confiance de nos donateurs et partenaires est notre bien le plus précieux. Voici nos engagements et nos documents officiels."
        breadcrumbs={[{ label: "À propos", href: "/a-propos" }, { label: "Transparence" }]}
      />

      <Section aria-labelledby="commit-title">
        <SectionTitle id="commit-title" eyebrow="Nos engagements" title="Une gestion claire et responsable" align="center" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map((c) => (
            <li key={c.title} className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
              <c.icon aria-hidden className="size-9 text-ktgw-green" />
              <h3 className="text-lg font-bold">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted" aria-labelledby="docs-title" width="narrow">
        <SectionTitle id="docs-title" eyebrow="Documents" title="Documents officiels" />
        <ul className="mt-8 flex flex-col gap-4">
          {documents.map((d) => (
            <li key={d.title} className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 sm:flex-row sm:items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-ktgw-red">
                <FileText aria-hidden className="size-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-bold">{d.title}</h3>
                <p className="text-sm text-muted-foreground">{d.description}</p>
              </div>
              {d.url ? (
                <a href={d.url} className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  Télécharger (PDF)
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock aria-hidden className="size-3.5" />
                  Publication prochaine
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl bg-card p-8 text-center shadow-soft ring-1 ring-foreground/5">
          <p className="text-muted-foreground">Bailleur, partenaire ou donateur, vous souhaitez un document en particulier ?</p>
          <ButtonLink href="/contact" size="xl">
            <Mail aria-hidden />
            Demander un document
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
