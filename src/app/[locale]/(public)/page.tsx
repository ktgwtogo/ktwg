import { ArrowRight, GraduationCap, Handshake, Heart, MapPin, Sprout, Users } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { StatCounter } from "@/components/shared/stat-counter";

/**
 * Page provisoire de la Phase 2 : vitrine du design system
 * (boutons, titres de section, cartes, compteurs, tons de section).
 * Remplacée par la vraie page d'accueil en Phase 3.
 */
export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();

  return (
    <>
      <Section>
        <SectionTitle
          as="h1"
          eyebrow={t("Common.orgShort")}
          title={t("Home.heroTitle")}
          description={t("Home.heroSubtitle")}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/faire-un-don" size="xl">
            <Heart aria-hidden className="fill-current" />
            {t("Common.donate")}
          </ButtonLink>
          <ButtonLink href="/partenariat" size="xl" variant="secondary">
            <Handshake aria-hidden />
            {t("Common.becomePartner")}
          </ButtonLink>
          <ButtonLink href="/projets" size="xl" variant="outline">
            {t("Common.ourProjects")}
            <ArrowRight aria-hidden />
          </ButtonLink>
          <Button size="xl" variant="sun">Variante « sun »</Button>
        </div>
      </Section>

      <Section tone="green" aria-labelledby="stats-title">
        <SectionTitle id="stats-title" eyebrow="StatCounter" title="Chiffres clés" align="center" inverted />
        <div className="mt-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          <StatCounter inverted value={17} suffix="+" label="années d'action" icon={<Sprout className="size-6" />} />
          <StatCounter inverted value={1250} suffix="+" label="jeunes formés" icon={<GraduationCap className="size-6" />} />
          <StatCounter inverted value={6} label="villes" icon={<MapPin className="size-6" />} />
          <StatCounter inverted value={480} label="femmes accompagnées" icon={<Users className="size-6" />} />
        </div>
        <p className="mt-8 text-center text-xs text-white/60">Valeurs fictives de démonstration.</p>
      </Section>

      <Section tone="muted" aria-labelledby="cards-title">
        <SectionTitle id="cards-title" eyebrow="Card" title="Cartes" description="Coins arrondis, ombre douce, image en tête." />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { src: "/images/inauguration-ruban.webp", alt: "Coupe du ruban lors de l'inauguration de l'internat", title: "Internat pour jeunes filles" },
            { src: "/images/plantation-femme-ouvriers.webp", alt: "Une femme en tenue verte plante un arbre devant les ouvriers du chantier", title: "Autonomisation des femmes" },
            { src: "/images/plantation-hibiscus.webp", alt: "Deux personnes accroupies plantent un hibiscus", title: "Reboisement" },
          ].map((c) => (
            <Card key={c.src} className="pt-0 transition-transform hover:-translate-y-1">
              <div className="relative aspect-[3/2]">
                <Image src={c.src} alt={c.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-bold">{c.title}</CardTitle>
                <CardDescription>Texte de démonstration du composant carte.</CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter className="border-t bg-transparent py-4">
                <ButtonLink href="/projets" variant="link" className="px-0">
                  {t("Common.learnMore")}
                  <ArrowRight aria-hidden />
                </ButtonLink>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="sun" aria-labelledby="sun-title">
        <SectionTitle id="sun-title" eyebrow="Section tone=&quot;sun&quot;" title={`« ${t("Common.motto")} »`} align="center" />
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/faire-un-don" size="xl">{t("Common.donate")}</ButtonLink>
          <ButtonLink href="/s-engager" size="xl" variant="white">{t("Nav.getInvolved")}</ButtonLink>
        </div>
      </Section>

      <Section>
        <p className="text-sm text-muted-foreground">{t("Home.wip")}</p>
      </Section>
    </>
  );
}
