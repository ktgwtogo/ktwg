import { EditableImage, T } from "@/components/edit/editable";
import {
  ArrowRight,
  Award,
  BedDouble,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Coins,
  Cpu,
  ExternalLink,
  FileCheck,
  Globe2,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Users,
  Venus,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TrainingApplicationForm } from "@/components/forms/other-forms";
import { MecatroniqueApplicationForm } from "@/components/forms/mecatronique-application-form";
import { ButtonLink } from "@/components/ui/button-link";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { getSiteImages } from "@/lib/site/settings";
import { courses } from "@/content/organization";

export const metadata: Metadata = {
  title: "Formations professionnelles bilingues · Mécatronique Industrielle (Bourse 65%)",
  description:
    "Formation qualifiante d'excellence en Mécatronique Industrielle avec bourse de 65% (BAC obligatoire), formation artisanale appliquée, transformation agroalimentaire, mécanique appliquée : formations bilingues français–allemand au Togo.",
};

const approach = [
  { icon: Wrench, title: "Pratique avant tout", text: "L'essentiel de la formation se fait en atelier, sur des cas réels." },
  { icon: Languages, title: "Bilingue français–allemand", text: "Un atout pour les échanges avec les partenaires et l'ouverture internationale." },
  { icon: Briefcase, title: "Cap sur l'emploi", text: "Accompagnement vers l'emploi, l'installation à son compte et la création de PME." },
  { icon: BedDouble, title: "Internat pour les filles", text: "Les apprenties venues de loin peuvent être hébergées en sécurité." },
];

const mecatroniqueModules = [
  { icon: Wrench, title: "Électronique automobile" },
  { icon: Cpu, title: "Diagnostic automobile" },
  { icon: Wrench, title: "Mécanique appliquée" },
  { icon: Cpu, title: "Programmation" },
  { icon: Cpu, title: "Systèmes embarqués" },
  { icon: Globe2, title: "Systèmes, Réseaux et Sécurité" },
  { icon: Sparkles, title: "Domotique" },
  { icon: Languages, title: "Cours d'Allemand gratuit" },
];

export default async function TrainingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteImages = await getSiteImages();
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        image={siteImages["banner.formations"]} imageId="banner.formations"
        eyebrow={<T s="formations">{"Formations professionnelles"}</T>}
        title={
          <><T s="formations">{"Apprendre un métier,"}</T>{" "}<span className="font-accent text-ktgw-sun italic"><T s="formations">{"en deux langues"}</T></span>
          </>
        }
        description={<T s="formations">{"Des formations professionnelles concrètes, en français et en allemand, pour que chaque jeune puisse gagner sa vie."}</T>}
        breadcrumbs={[{ label: "Formations" }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/formations#bourse-mecatronique" size="xl" variant="default" className="bg-ktgw-red text-white shadow-lg">
            <Award aria-hidden className="size-5" /><T s="formations">{"Bourse Mécatronique (65%)"}</T><ArrowRight aria-hidden />
          </ButtonLink>
          <ButtonLink href="/formations#candidature" size="xl" variant="white"><T s="formations">{"Candidater en ligne"}</T></ButtonLink>
          <ButtonLink href="/formations#filieres" size="xl" variant="white"><T s="formations">{"Voir les filières"}</T></ButtonLink>
        </div>
      </PageHeader>

      {/* ============ SECTION VEDETTE : BOURSE EN MÉCATRONIQUE ============ */}
      <Section id="bourse-mecatronique" className="scroll-mt-28 bg-gradient-to-b from-card to-background">
        <div className="rounded-3xl bg-gradient-to-br from-card via-card to-ktgw-sun/5 p-6 shadow-xl ring-1 ring-foreground/10 sm:p-10 lg:p-12">
          {/* Header Bourse */}
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ktgw-red/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide text-ktgw-red ring-1 ring-ktgw-red/25">
                <Award aria-hidden className="size-4" />{" "}<T s="formations">{"Bourse 65% de réduction"}</T></span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ktgw-green/10 px-3.5 py-1 text-xs font-bold text-ktgw-green-dark ring-1 ring-ktgw-green/25">
                <CheckCircle2 aria-hidden className="size-4" />{" "}<T s="formations">{"50 premiers inscrits"}</T></span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-500/25">
                <Globe2 aria-hidden className="size-4" />{" "}<T s="formations">{"Partenariat Allemagne–Togo"}</T></span>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl"><T s="formations">{"Formation Professionnelle Qualifiante en"}</T>{" "}<span className="text-ktgw-red"><T s="formations">{"Mécatronique Industrielle & Systèmes Embarqués"}</T></span>
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg"><T s="formations">{"Organisée conjointement par"}</T>{" "}<strong><T s="formations">{"l'ONG KommTogoGehweiter"}</T></strong>{" "}<T s="formations">{"sous la présidence de son"}</T>{" "}<strong><T s="formations">{"Président-Fondateur Monsieur Blaise-Pascal D'ALMEIDA"}</T></strong>, <strong><T s="formations">{"KTGW-TOGO"}</T></strong><T s="formations">{", le centre de formation professionnelle"}</T>{" "}<strong><T s="formations">{"CEFOPEXD"}</T></strong>{" "}<T s="formations">{"et leurs partenaires allemands. Une opportunité unique pour acquérir les compétences d'avenir les plus recherchées de l'industrie, de l'automatisation et de l'automobile moderne."}</T></p>
            </div>
          </div>

          {/* Grille principale */}
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Colonne Affiche Visuelle */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="group relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl ring-2 ring-ktgw-red/30">
                <div className="relative aspect-[9/14] w-full">
                  <EditableImage id="formations.affiche-bourse-mecatronique-2026"
                    src="/images/affiche-bourse-mecatronique-2026.jpg"
                    alt="Affiche officielle Appel à candidature Formation Mécatronique Industrielle avec Bourse CEFOPEXD"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-3 left-3 rounded-full bg-ktgw-red/90 px-3 py-1 text-xs font-bold text-white shadow backdrop-blur-sm"><T s="formations">{"Rentrée : 16 Novembre 2026"}</T></div>
                <div className="absolute bottom-3 right-3 rounded-full bg-ktgw-sun px-3 py-1 text-xs font-black text-slate-950 shadow"><T s="formations">{"Clôture : 12 Novembre 2026"}</T></div>
              </div>

              {/* Actions rapides sous l'affiche */}
              <div className="flex flex-col gap-2.5">
                <a
                  href="#candidature-mecatronique"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ktgw-red via-rose-600 to-ktgw-red-strong px-5 py-3.5 text-sm font-extrabold text-white shadow-xl ring-2 ring-ktgw-sun transition-all hover:scale-105 active:scale-95"
                >
                  <Award aria-hidden className="size-5" /><T s="formations">{"POSTULER EN LIGNE (BOURSE 65%)"}</T><ArrowRight aria-hidden className="size-4" />
                </a>
                <a
                  href="https://wa.me/22896975353?text=Bonjour,%20je%20souhaite%20candidater%20%C3%A0%20la%20formation%20en%20M%C3%A9catronique%20avec%20Bourse%20au%20CEFOPEXD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
                >
                  <MessageCircle aria-hidden className="size-5" /><T s="formations">{"Postuler via WhatsApp (+228 96 97 53 53)"}</T></a>
                <a
                  href="mailto:cefopexd@gmail.com?subject=Candidature%20Formation%20M%C3%A9catronique%20avec%20Bourse&body=Bonjour,%20veuillez%20trouver%20ci-joint%20mon%20dossier%20de%20candidature%20en%20fichiers%20PDF%20pour%20la%20formation%20en%20M%C3%A9catronique..."
                  className="flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted"
                >
                  <Mail aria-hidden className="size-4 text-ktgw-red" /><T s="formations">{"Envoyer mon dossier par e-mail"}</T></a>
                <a
                  href="/images/affiche-bourse-mecatronique-2026.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink aria-hidden className="size-3.5" /><T s="formations">{"Afficher l'affiche officielle en haute résolution"}</T></a>
              </div>
            </div>

            {/* Colonne Détails & Conditions */}
            <div className="flex flex-col gap-6 lg:col-span-7">
              {/* Durée */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3.5 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-ktgw-red/10 font-heading text-2xl font-black text-ktgw-red">
                    09
                  </span>
                  <div>
                    <h4 className="font-bold text-foreground"><T s="formations">{"Mois de formation"}</T></h4>
                    <p className="text-xs text-muted-foreground"><T s="formations">{"Ateliers pratiques & enseignements théoriques de pointe"}</T></p>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-ktgw-green/10 font-heading text-2xl font-black text-ktgw-green">
                    03
                  </span>
                  <div>
                    <h4 className="font-bold text-foreground"><T s="formations">{"Mois de stage"}</T></h4>
                    <p className="text-xs text-muted-foreground"><T s="formations">{"Immersion professionnelle garantie en entreprise"}</T></p>
                  </div>
                </div>
              </div>

              {/* 8 Compétences */}
              <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
                <h4 className="flex items-center gap-2 font-heading font-bold text-foreground">
                  <Cpu aria-hidden className="size-4 text-ktgw-red" /><T s="formations">{"8 spécialités au cœur du programme :"}</T></h4>
                <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
                  {mecatroniqueModules.map((m) => (
                    <div
                      key={m.title}
                      className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <m.icon aria-hidden className="size-4 shrink-0 text-ktgw-green" />
                      <span><T s="formations">{m.title}</T></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerte Féminine & Internat */}
              <div className="flex items-start gap-4 rounded-2xl bg-gradient-to-r from-ktgw-red via-ktgw-red-strong to-slate-900 p-5 text-white shadow-md">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Venus aria-hidden className="size-7 text-white" />
                </div>
                <div>
                  <h4 className="font-heading font-bold uppercase tracking-wide text-ktgw-sun"><T s="formations">{"Candidatures féminines prioritaires & Internat sur place"}</T></h4>
                  <p className="mt-1 text-sm leading-relaxed text-white/95"><T s="formations">{"Les candidatures féminines sont vivement encouragées !"}</T>{" "}<strong><T s="formations">{"Hébergement sécurisé garanti dans l'Internat pour les filles"}</T></strong>{" "}<T s="formations">{"au sein même du centre CEFOPEXD à Dévikinmé. Les garçons sont également les bienvenus."}</T></p>
                </div>
              </div>

              {/* Grille Conditions & Tarifs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 rounded-2xl border-2 border-ktgw-red/30 bg-card p-4 shadow-sm ring-1 ring-foreground/5">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <GraduationCap aria-hidden className="size-4 text-ktgw-red" /><T s="formations">{"Conditions d'accès strictes"}</T></h5>
                  <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <li className="font-bold text-ktgw-red"><T s="formations">{"• Niveau requis : BAC impératif (Admission uniquement à partir du BAC)"}</T></li>
                    <li>• <strong><T s="formations">{"Âge :"}</T></strong>{" "}<T s="formations">{"18 à 28 ans"}</T></li>
                    <li>• <strong><T s="formations">{"Public :"}</T></strong>{" "}<T s="formations">{"Filles (prioritaires) et garçons"}</T></li>
                    <li>• <strong><T s="formations">{"Fin des inscriptions :"}</T></strong>{" "}<T s="formations">{"12 novembre 2026 à 17h00"}</T></li>
                    <li>• <strong><T s="formations">{"Début des cours :"}</T></strong>{" "}<T s="formations">{"16 novembre 2026"}</T></li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
                  <h5 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Coins aria-hidden className="size-4 text-ktgw-sun" /><T s="formations">{"Conditions administratives"}</T></h5>
                  <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <li>• <strong><T s="formations">{"Bourse de 65% :"}</T></strong>{" "}<T s="formations">{"Pour les 50 premiers inscrits"}</T></li>
                    <li>• <strong><T s="formations">{"Inscription :"}</T></strong>{" "}<T s="formations">{"35.000 F (tenue et outils inclus)"}</T></li>
                    <li>• <strong><T s="formations">{"Frais avec bourse :"}</T></strong>{" "}<T s="formations">{"65.000 F (en 3 tranches)"}</T></li>
                    <li>• <strong><T s="formations">{"Internat pour filles :"}</T></strong>{" "}<T s="formations">{"Disponible sur place"}</T></li>
                  </ul>
                </div>
              </div>

              {/* Dossier de candidature */}
              <div className="rounded-2xl border border-dashed border-ktgw-green/40 bg-ktgw-green/5 p-5">
                <h5 className="flex items-center gap-2 font-heading text-sm font-bold text-ktgw-green-dark">
                  <FileCheck aria-hidden className="size-4" /><T s="formations">{"Composition du dossier (format PDF) :"}</T></h5>
                <ol className="mt-2 flex flex-col gap-1 text-xs text-foreground/90 sm:text-sm">
                  <li><T s="formations">{"1. Une lettre de demande d'inscription adressée au"}</T>{" "}<strong><T s="formations">{"Président-Fondateur de l'ONG KommTogoGehweiter, M. Blaise-Pascal D'ALMEIDA"}</T></strong></li>
                  <li><T s="formations">{"2. Une copie simple et légalisée du diplôme ou relevé de notes du BAC"}</T></li>
                  <li><T s="formations">{"3. Une copie simple d'acte de naissance ou une pièce d'identité officielle"}</T></li>
                </ol>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <MapPin aria-hidden className="size-4 text-ktgw-red" /><T s="formations">{"Centre CEFOPEXD, Dévikinmé (Lacs 3)"}</T></span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Phone aria-hidden className="size-4 text-ktgw-green" />
                    +228 96 97 53 53
                  </span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Mail aria-hidden className="size-4 text-blue-600" /><T s="formations">{"cefopexd@gmail.com"}</T></span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire officiel de candidature directe avec pièces jointes */}
          <div id="candidature-mecatronique" className="mt-10 scroll-mt-28">
            <MecatroniqueApplicationForm />
          </div>
        </div>
      </Section>

      <Section aria-labelledby="approach-title">
        <SectionTitle id="approach-title" eyebrow={<T s="formations">{"Notre approche"}</T>} title={<T s="formations">{"Une formation qui mène à l'autonomie"}</T>} align="center" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((a, i) => (
            <li key={a.title}>
              <Reveal delay={i * 80} className="flex h-full flex-col gap-3 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <a.icon aria-hidden className="size-9 text-ktgw-green" />
                <h3 className="text-lg font-bold"><T s="formations">{a.title}</T></h3>
                <p className="text-sm leading-relaxed text-muted-foreground"><T s="formations">{a.text}</T></p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="filieres" tone="muted" aria-labelledby="courses-title" className="scroll-mt-28">
        <SectionTitle
          id="courses-title"
          eyebrow={<T s="formations">{"Nos filières"}</T>}
          title={<T s="formations">{"Six domaines pour bâtir son avenir"}</T>}
          description={<T s="formations">{"Des métiers utiles au Togo, porteurs d'emploi et d'entrepreneuriat."}</T>}
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
                  <h3 className="text-lg font-bold"><T s="formations">{c.title}</T></h3>
                  <p className="text-sm leading-relaxed text-muted-foreground"><T s="formations">{c.text}</T></p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="clubs-allemand" aria-labelledby="clubs-title" className="scroll-mt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
            <EditableImage id="formations.internat" src={siteImages["formations.internat"].src} alt={siteImages["formations.internat"].alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-6">
            <SectionTitle id="clubs-title" eyebrow={<T s="formations">{"Éducation interculturelle"}</T>} title={<T s="formations">{"Les clubs de langue allemande"}</T>} />
            <p className="leading-relaxed text-muted-foreground"><T s="formations">{"Dans les écoles togolaises, nos clubs d'allemand font découvrir la langue et la culture allemandes de façon vivante : jeux, chansons, correspondance et échanges avec des jeunes en Allemagne."}</T></p>
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
            <ButtonLink href="/contact" size="xl" variant="secondary" className="w-fit"><T s="formations">{"Ouvrir un club dans mon école"}</T><ArrowRight aria-hidden />
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <Section id="candidature" tone="muted" aria-labelledby="apply-title" className="scroll-mt-28">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <SectionTitle
              id="apply-title"
              eyebrow={<T s="formations">{"Candidature"}</T>}
              title={<T s="formations">{"Je veux apprendre un métier"}</T>}
              description={<T s="formations">{"Remplissez ce formulaire : notre équipe vous recontacte pour un entretien d'orientation."}</T>}
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
