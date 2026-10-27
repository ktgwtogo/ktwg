import { ArrowRight, Eye, FileText, HandHeart, Heart, Landmark, Scale, Target, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { FinalCta } from "@/components/sections/home-sections";
import { PresenceMap } from "@/components/sections/presence-map";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { images } from "@/content/images";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Qui sommes-nous : histoire, mission, vision, gouvernance et coopération Allemagne–Togo de KommTogoGehWeiter Togo (KTGW Togo).",
};

const timeline = [
  { year: "2006", title: "Une idée née du football", text: "L'association naît de l'élan suscité par la qualification du Togo pour la Coupe du monde 2006." },
  { year: "2018", title: "Active au Togo", text: "KTGW Togo est active au Togo depuis 2018 pour intensifier les formations professionnelles et les projets d'insertion des jeunes sur le terrain." },
  { year: "2023", title: "Richtfest de l'internat", text: "Le 13 avril, partenaires et autorités célèbrent l'achèvement du gros œuvre de l'internat des jeunes filles." },
  { year: "2025", title: "24 places pour les apprenties", text: "Le premier bloc de l'internat est achevé : 24 jeunes filles peuvent y être accueillies." },
];

const pillars = [
  {
    icon: Target,
    title: "Notre mission",
    text: "Offrir aux jeunes du Togo, et en priorité aux jeunes filles, une formation professionnelle de qualité qui leur permet de vivre dignement de leur métier, dans leur pays.",
  },
  {
    icon: Eye,
    title: "Notre vision",
    text: "Un Togo où chaque jeune trouve sa place grâce à l'éducation, où les femmes sont pleinement actrices du développement et où l'avenir se construit sur place.",
  },
  {
    icon: Heart,
    title: "Nos valeurs",
    text: "Excellence, équité, transparence, respect des cultures et engagement bénévole : des valeurs partagées entre le Togo, l'Allemagne et la France.",
  },
];

const governance = [
  { icon: Users, title: "Assemblée générale", text: "Réunit les membres, valide les orientations et les comptes de l'association." },
  { icon: Landmark, title: "Bureau exécutif", text: "Pilote la stratégie, les partenariats et la bonne gestion des ressources." },
  { icon: HandHeart, title: "Coordination à Lomé", text: "Met en œuvre les projets sur le terrain avec les équipes et les partenaires locaux." },
  { icon: Scale, title: "Lien avec l'e.V. à Cologne", text: "Suivi conjoint des projets et des fonds avec kommTOGOgehweiter e.V., entièrement bénévole." },
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={images.plantingPartners}
        eyebrow="Qui sommes-nous"
        title={
          <>
            Komm Togo, <span className="font-accent text-ktgw-sun italic">geh weiter</span>
          </>
        }
        description="« Viens Togo, avance » : active depuis 2018 au Togo, nous aidons les jeunes du Togo à avancer grâce à l'éducation et à la formation professionnelle."
        breadcrumbs={[{ label: "À propos" }]}
      />

      {/* Histoire */}
      <Section aria-labelledby="history-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="flex flex-col gap-6">
            <SectionTitle id="history-title" eyebrow="Notre histoire" title="D'un élan d'amitié à une ONG engagée" />
            <p className="text-lg leading-relaxed text-muted-foreground">
              KommTogoGehWeiter Togo (KTGW Togo) est la branche togolaise de <strong className="text-foreground">kommTOGOgehweiter e.V.</strong>, une
              association d&apos;utilité publique fondée à Cologne. Côté allemand, elle fonctionne entièrement grâce au bénévolat. Ses membres
              viennent d&apos;Allemagne, de France et du Togo.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Notre conviction tient en une phrase :{" "}
              <em className="font-accent text-lg font-semibold text-foreground">
                « Chaque centime investi dans l&apos;éducation en Afrique protège des chemins dangereux vers l&apos;Europe. »
              </em>{" "}
              Former un jeune à un métier, c&apos;est lui permettre de construire son avenir au Togo, auprès des siens.
            </p>
          </Reveal>
          <ol className="relative flex flex-col gap-8 border-l-2 border-ktgw-sun/60 pl-8">
            {timeline.map((t, i) => (
              <li key={t.year}>
                <Reveal delay={i * 100} className="relative">
                  <span aria-hidden className="absolute top-1 -left-[2.65rem] flex size-5 items-center justify-center rounded-full bg-ktgw-red-strong ring-4 ring-background" />
                  <p className="font-heading text-3xl font-extrabold text-ktgw-red">{t.year}</p>
                  <h3 className="mt-1 text-lg font-bold">{t.title}</h3>
                  <p className="mt-1 text-muted-foreground">{t.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Mission, vision, valeurs */}
      <Section tone="muted" aria-labelledby="pillars-title">
        <SectionTitle id="pillars-title" eyebrow="Ce qui nous guide" title="Mission, vision et valeurs" align="center" />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <li key={p.title}>
              <Reveal delay={i * 100} className="flex h-full flex-col gap-4 rounded-2xl bg-card p-8 shadow-soft ring-1 ring-foreground/5">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-ktgw-red-strong text-white">
                  <p.icon aria-hidden className="size-7" />
                </span>
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{p.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* Coopération Allemagne–Togo */}
      <Section aria-labelledby="coop-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
            <Image src={images.ribbon.src} alt={images.ribbon.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-6">
            <SectionTitle id="coop-title" eyebrow="Coopération Allemagne – Togo" title="Deux pays, un même chemin" />
            <p className="leading-relaxed text-muted-foreground">
              Nos projets reposent sur une coopération étroite avec des partenaires allemands : l&apos;association mère à Cologne, Togohilfe, la
              Chambre des métiers de Cologne (Handwerkskammer zu Köln) et l&apos;ambassade d&apos;Allemagne au Togo. Au Togo, nous travaillons
              avec les autorités administratives, traditionnelles et religieuses, ainsi qu&apos;avec nos partenaires locaux.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Cette coopération apporte le savoir-faire de l&apos;artisanat allemand et la connaissance du terrain togolais. Elle crée aussi des
              échanges culturels et linguistiques, notamment grâce aux clubs d&apos;allemand.
            </p>
            <ButtonLink href="/partenariat" size="xl" className="w-fit">
              Devenir partenaire
              <ArrowRight aria-hidden />
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      {/* Mot du Président-Fondateur */}
      <Section width="default">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-ktgw-green-dark p-8 text-white shadow-2xl sm:p-12">
          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="flex flex-col gap-4 lg:col-span-8">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ktgw-sun/20 px-3 py-1 text-xs font-bold text-ktgw-sun ring-1 ring-ktgw-sun/40">
                Direction &amp; Présidence Fondatrice
              </span>
              <h2 className="font-heading text-3xl font-extrabold sm:text-4xl text-white">
                Monsieur Blaise-Pascal D&apos;ALMEIDA
              </h2>
              <p className="text-lg font-semibold text-ktgw-sun">
                Président-Fondateur de KTGW
              </p>
              <blockquote className="border-l-4 border-ktgw-sun pl-4 text-base italic text-white/90 sm:text-lg">
                « Chaque centime investi dans l&apos;éducation en Afrique protège des chemins dangereux vers l&apos;Europe. Notre mission est de donner aux jeunes du Togo les compétences concrètes et la fierté de réussir dans leur pays. »
              </blockquote>
              <p className="text-sm text-white/75">
                Sous son impulsion, KTGW Togo déploie des formations d&apos;excellence, l&apos;internat des jeunes filles au centre CEFOPEXD, l&apos;agroalimentaire et la nouvelle filière en mécatronique industrielle.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm lg:col-span-4">
              <span className="flex size-20 items-center justify-center rounded-2xl bg-ktgw-red text-white shadow-xl">
                <Users className="size-10" />
              </span>
              <p className="mt-4 font-heading text-lg font-bold text-white">M. Blaise-Pascal D&apos;ALMEIDA</p>
              <p className="text-xs text-ktgw-sun font-medium">Président-Fondateur</p>
              <span className="mt-3 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">
                Lomé · Cologne · Devikinmé
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* Gouvernance */}
      <Section tone="muted" aria-labelledby="gov-title">
        <SectionTitle
          id="gov-title"
          eyebrow="Gouvernance"
          title="Une organisation claire et responsable"
          description="Nos instances garantissent des décisions collégiales et une gestion rigoureuse des fonds confiés."
          align="center"
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {governance.map((g, i) => (
            <li key={g.title}>
              <Reveal delay={i * 80} className="flex h-full flex-col gap-3 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <g.icon aria-hidden className="size-8 text-ktgw-green" />
                <h3 className="font-bold">{g.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{g.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="max-w-2xl text-sm text-muted-foreground">
            La composition de l&apos;équipe et des instances, ainsi que nos rapports d&apos;activité et financiers, sont publiés sur la page Transparence.
          </p>
          <ButtonLink href="/transparence" variant="outline" size="xl">
            <FileText aria-hidden />
            Voir la page Transparence
          </ButtonLink>
        </div>
      </Section>

      {/* Zones d'action */}
      <Section aria-labelledby="zones-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionTitle
              id="zones-title"
              eyebrow="Zones d'action"
              title="Présents dans six villes du Togo"
              description="Lomé, Aného, Kpalimé, Atakpamé, Kara et Dapaong : nous agissons du littoral jusqu'aux Savanes."
            />
            <ButtonLink href="/projets" size="xl" variant="secondary" className="w-fit">
              Découvrir nos projets
              <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
          <PresenceMap />
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
