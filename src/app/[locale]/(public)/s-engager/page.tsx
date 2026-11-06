import { T } from "@/components/edit/editable";
import { ArrowRight, Handshake, Heart, IdCard, Languages, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { EngagementForm } from "@/components/forms/other-forms";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { getSiteImages } from "@/lib/site/settings";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "S'engager",
  description: "Faire un don, devenir partenaire, bénévole ou membre, ouvrir un club d'allemand : toutes les façons de s'engager avec KTGW Togo.",
};

const ways = [
  { icon: Heart, title: "Faire un don", text: "Ponctuel ou mensuel, chaque don finance directement la formation des jeunes.", href: "/faire-un-don", cta: "Je donne" },
  { icon: Handshake, title: "Devenir partenaire", text: "Entreprises, fondations, institutions : construisons un projet ensemble.", href: "/partenariat", cta: "Proposer un partenariat" },
  { icon: UsersRound, title: "Devenir bénévole", text: "Au Togo, en Allemagne ou à distance, partagez votre temps et vos compétences.", href: "/s-engager#benevolat", cta: "Je deviens bénévole" },
  { icon: IdCard, title: "Adhérer", text: "Devenez membre de l'association et participez à ses décisions.", href: "/s-engager#adhesion", cta: "J'adhère" },
  { icon: Languages, title: "Clubs d'allemand", text: "Enseignants, chefs d'établissement : ouvrez un club dans votre école.", href: "/formations#clubs-allemand", cta: "En savoir plus" },
];

export default async function GetInvolvedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteImages = await getSiteImages();
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={siteImages["banner.s-engager"]} imageId="banner.s-engager"
        eyebrow={<T s="s-engager">{"S'engager"}</T>}
        title={
          <><T s="s-engager">{"Chacun peut"}</T>{" "}<span className="font-accent text-ktgw-sun italic"><T s="s-engager">{"planter une graine"}</T></span>
          </>
        }
        description={<T s="s-engager">{"Un don, quelques heures, des compétences ou un réseau : il existe mille façons d'aider les jeunes du Togo à avancer."}</T>}
        breadcrumbs={[{ label: "S'engager" }]}
      />

      <Section aria-labelledby="ways-title">
        <SectionTitle id="ways-title" eyebrow={<T s="s-engager">{"Agir avec nous"}</T>} title={<T s="s-engager">{"Choisissez votre façon de vous engager"}</T>} align="center" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {ways.map((w, i) => (
            <li key={w.title}>
              <Reveal delay={i * 70} className="h-full">
                <Link
                  href={w.href}
                  className="group flex h-full flex-col gap-4 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-ktgw-red transition-colors group-hover:bg-ktgw-red-strong group-hover:text-white">
                    <w.icon aria-hidden className="size-7" />
                  </span>
                  <h3 className="text-lg font-bold"><T s="s-engager">{w.title}</T></h3>
                  <p className="text-sm leading-relaxed text-muted-foreground"><T s="s-engager">{w.text}</T></p>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-ktgw-red">
                    <T s="s-engager">{w.cta}</T>
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="benevolat" tone="muted" aria-labelledby="volunteer-title" className="scroll-mt-28">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <SectionTitle
              id="volunteer-title"
              eyebrow={<T s="s-engager">{"Bénévolat & adhésion"}</T>}
              title={<T s="s-engager">{"Rejoignez une équipe engagée"}</T>}
              description={<T s="s-engager">{"Côté allemand, l'association fonctionne entièrement grâce au bénévolat. Au Togo, les bénévoles renforcent nos équipes sur le terrain."}</T>}
            />
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <h3 className="mb-2 flex items-center gap-2 font-bold">
                  <UsersRound aria-hidden className="size-5 text-ktgw-green" /><T s="s-engager">{"Bénévolat"}</T></h3>
                <p className="text-sm leading-relaxed text-muted-foreground"><T s="s-engager">{"Formation, accompagnement des apprenti·e·s, communication, informatique, événements, collecte de fonds : vos compétences comptent, sur place ou à distance."}</T></p>
              </div>
              <div id="adhesion" className="scroll-mt-28 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <h3 className="mb-2 flex items-center gap-2 font-bold">
                  <IdCard aria-hidden className="size-5 text-ktgw-green" /><T s="s-engager">{"Adhésion"}</T></h3>
                <p className="text-sm leading-relaxed text-muted-foreground"><T s="s-engager">{"En devenant membre, vous soutenez durablement l'association, vous êtes informé·e en priorité et vous participez à l'assemblée générale. Le montant de la cotisation vous sera communiqué par l'équipe."}</T></p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-10 lg:col-span-3">
            <h3 className="mb-6 text-2xl font-bold"><T s="s-engager">{"Je m'engage"}</T></h3>
            <EngagementForm />
          </div>
        </div>
      </Section>
    </>
  );
}
