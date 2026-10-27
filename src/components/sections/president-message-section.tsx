import {
  ArrowRight,
  Award,
  CheckCircle2,
  Cpu,
  Globe2,
  Heart,
  Quote,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Venus,
} from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Section } from "@/components/shared/section";
import { images } from "@/content/images";

/**
 * Grande section officielle : Mot et Message du Président-Fondateur Monsieur Blaise-Pascal D'ALMEIDA.
 * Affichée fièrement sur la page d'accueil et sur le site.
 */
export function PresidentFounderMessageSection() {

  return (
    <Section id="mot-du-president" tone="muted" aria-labelledby="president-heading" className="scroll-mt-24 relative overflow-hidden py-16 sm:py-24">
      {/* Motifs décoratifs d'arrière-plan */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-ktgw-sun/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-ktgw-green-strong/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Bandeau d'en-tête de la présidence */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-ktgw-red text-white shadow-md">
              <Award className="size-5" />
            </span>
            <div>
              <span className="text-xs font-black tracking-widest text-ktgw-red uppercase">
                Tribune Officielle &amp; Direction Fondatrice
              </span>
              <p className="text-xs text-muted-foreground">KommTogoGehweiter Togo · Lomé · Cologne</p>
            </div>
          </div>
          <span className="rounded-full bg-ktgw-sun/20 px-3 py-1 text-xs font-extrabold text-slate-900 ring-1 ring-ktgw-sun dark:text-ktgw-sun">
            Message du Président-Fondateur
          </span>
        </div>

        {/* Bloc principal en 2 colonnes */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Colonne gauche : Profil & Identité du Président */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-ktgw-green-dark p-6 text-white shadow-2xl ring-1 ring-white/15">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white/10 shadow-inner">
                <Image
                  src={images.workersGroup.src}
                  alt="Monsieur Blaise-Pascal D'ALMEIDA avec l'équipe de KTGW Togo"
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/60 p-3 backdrop-blur-md">
                  <p className="font-heading text-lg font-black text-white">M. Blaise-Pascal D&apos;ALMEIDA</p>
                  <p className="text-xs font-bold text-ktgw-sun">Président-Fondateur de KTGW</p>
                </div>
              </div>

              {/* Repères clés */}
              <div className="mt-5 flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-ktgw-sun" />
                  <span>Présidence active de l&apos;ONG depuis sa création</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5">
                  <Globe2 className="size-4 shrink-0 text-emerald-400" />
                  <span>Pont bilatéral Togo – Allemagne – France</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5">
                  <Sparkles className="size-4 shrink-0 text-ktgw-red" />
                  <span>Initiateur du CEFOPEXD &amp; de l&apos;Internat pour filles</span>
                </div>
              </div>

              {/* Devise mise en exergue */}
              <div className="mt-5 rounded-2xl border-l-4 border-ktgw-sun bg-white/5 p-4 text-xs italic leading-relaxed text-white/90">
                « Chaque centime investi dans l&apos;éducation en Afrique protège des chemins dangereux vers l&apos;Europe. »
              </div>
            </div>

            {/* Accès rapide aux démarches */}
            <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-sm text-xs">
              <span className="font-bold text-foreground">Actions rapides :</span>
              <ButtonLink href="/formations#bourse-mecatronique" size="sm" className="w-full justify-between bg-ktgw-red text-white font-bold">
                Bourse Mécatronique (BAC) <ArrowRight className="size-3.5" />
              </ButtonLink>
              <ButtonLink href="/objectifs" size="sm" variant="outline" className="w-full justify-between font-bold">
                Voir les 17 ODD de l&apos;ONU <ArrowRight className="size-3.5" />
              </ButtonLink>
            </div>
          </div>

          {/* Colonne droite : Le Discours et Message Fondateur */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="rounded-3xl border border-foreground/10 bg-card p-7 shadow-xl ring-1 ring-foreground/5 sm:p-10">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-ktgw-green-strong uppercase">
                <Quote className="size-4 text-ktgw-sun" />
                Message officiel à la Jeunesse et au Peuple Togolais
              </div>

              <h2 id="president-heading" className="mt-2 font-heading text-2xl font-black text-foreground sm:text-3xl lg:text-4xl leading-tight">
                « Former une jeunesse digne, compétente et actrice de son propre destin au Togo »
              </h2>

              <p className="mt-2 text-sm font-semibold text-ktgw-red sm:text-base">
                Par Monsieur Blaise-Pascal D&apos;ALMEIDA — Président-Fondateur de KommTogoGehweiter Togo
              </p>

              {/* Corps du message structuré */}
              <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  <strong>Chers concitoyens, chers partenaires et chers jeunes du Togo,</strong>
                </p>

                <p>
                  L&apos;histoire de notre organisation non gouvernementale <strong>KommTogoGehweiter (KTGW)</strong> est née d&apos;un élan de fraternité et d&apos;espérance en 2006, au moment historique où les Éperviers du Togo hissaient pour la première fois les couleurs de notre pays à la Coupe du Monde de football en Allemagne. De cet enthousiasme est née une résolution fondamentale : <em>bâtir un pont de solidarité pérenne entre le Togo, l&apos;Allemagne et la France</em>, entièrement dédié à l&apos;éducation et à la dignité de nos enfants.
                </p>

                <p>
                  Depuis <strong>2018</strong>, notre action est résolument implantée sur le terrain togolais. Nous avons refusé le fatalisme des départs périlleux vers l&apos;inconnu. Notre conviction la plus profonde s&apos;exprime en une vérité immuable :{" "}
                  <strong className="text-foreground">
                    « Chaque centime investi dans l&apos;éducation en Afrique protège des chemins dangereux vers l&apos;Europe. »
                  </strong>
                </p>

                <div className="my-3 rounded-2xl border border-ktgw-green/30 bg-ktgw-green/5 p-5">
                  <h3 className="font-heading text-base font-bold text-ktgw-green-dark">
                    Nos priorités d&apos;action concrète sur le sol togolais :
                  </h3>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 text-xs sm:text-sm text-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-ktgw-green mt-0.5" />
                      <span><strong>Centre CEFOPEXD à Dévikinmé :</strong> Ateliers modernes pour apprendre un métier pratique d&apos;avenir.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Cpu className="size-4 shrink-0 text-ktgw-red mt-0.5" />
                      <span><strong>Mécatronique Industrielle :</strong> Bourse de 65% pour bacheliers et techniciens (rentrée 16 nov.).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Venus className="size-4 shrink-0 text-pink-600 mt-0.5" />
                      <span><strong>Internat des jeunes filles :</strong> Hébergement sécurisé garanti pour favoriser l&apos;apprentissage féminin.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <UtensilsCrossed className="size-4 shrink-0 text-amber-600 mt-0.5" />
                      <span><strong>Agroalimentaire &amp; Artisanat :</strong> Transformation de nos récoltes et savoir-faire local sur-mesure.</span>
                    </li>
                  </ul>
                </div>

                <p>
                  Toutes ces actions s&apos;alignent rigoureusement sur les <strong>17 Objectifs de Développement Durable (ODD) des Nations Unies</strong>. De Lomé (notre siège national à Tokoin) jusqu&apos;à Dapaong, en passant par Aného, Kpalimé, Atakpamé et Kara, nous travaillons main dans la main avec nos partenaires allemands de Cologne, nos maîtres artisans et les institutions républicaines du Togo.
                </p>

                <p className="font-medium text-foreground">
                  À vous, jeunesse togolaise : l&apos;avenir vous appartient. Engagez-vous, formez-vous avec rigueur et construisez la prospérité de notre nation. <em>Komm Togo, geh weiter !</em>
                </p>
              </div>

              {/* Signature solennelle */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div>
                  <p className="font-heading text-lg font-black text-foreground">
                    Monsieur Blaise-Pascal D&apos;ALMEIDA
                  </p>
                  <p className="text-xs font-bold text-ktgw-red uppercase tracking-wider">
                    Président-Fondateur de KTGW
                  </p>
                  <p className="text-xs text-muted-foreground">Siège National Tokoin Cébévito, Lomé – Togo</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <ButtonLink href="/formations#bourse-mecatronique" size="lg" className="bg-ktgw-red text-white font-bold shadow-md hover:bg-ktgw-red-strong">
                    <Award className="size-4" />
                    Postuler en Mécatronique
                  </ButtonLink>
                  <ButtonLink href="/faire-un-don" size="lg" variant="sun" className="font-bold">
                    <Heart className="size-4" />
                    Soutenir nos actions
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
