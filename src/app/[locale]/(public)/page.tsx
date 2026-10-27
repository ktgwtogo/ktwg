import { setRequestLocale } from "next-intl/server";
import { getHeroSlides } from "@/lib/site/settings";
import { HeroSlider } from "@/components/sections/hero-slider";
import { ImpactTestimonials, NewsletterSection, PresenceSection } from "@/components/sections/home-interactive";
import {
  AboutPreview,
  BourseAnnouncementSpotlight,
  DomainsGrid,
  FeaturedProjects,
  FinalCta,
  LatestNews,
  ObjectivesPreview,
  PartnersSection,
  StatsBand,
  UpcomingEvents,
} from "@/components/sections/home-sections";
import { PresidentFounderMessageSection } from "@/components/sections/president-message-section";

/** Page d'accueil avec Mot Officiel du Président-Fondateur M. Blaise-Pascal D'ALMEIDA. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSlider slides={await getHeroSlides()} />
      <BourseAnnouncementSpotlight />
      <StatsBand />
      <AboutPreview />
      {/* Tribune & Mot Solennel du Président-Fondateur */}
      <PresidentFounderMessageSection />
      <DomainsGrid />
      <FeaturedProjects />
      <ObjectivesPreview />
      <ImpactTestimonials />
      <PresenceSection />
      <UpcomingEvents />
      <LatestNews />
      <PartnersSection />
      <FinalCta />
      <NewsletterSection />
    </>
  );
}
