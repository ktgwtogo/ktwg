import { setRequestLocale } from "next-intl/server";
import { HeroSlider } from "@/components/sections/hero-slider";
import { ImpactTestimonials, NewsletterSection, PresenceSection } from "@/components/sections/home-interactive";
import {
  AboutPreview,
  DomainsGrid,
  FeaturedProjects,
  FinalCta,
  LatestNews,
  ObjectivesPreview,
  PartnersSection,
  StatsBand,
  UpcomingEvents,
} from "@/components/sections/home-sections";

/** Page d'accueil (ordre des sections : §6 du cahier des charges). */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSlider />
      <StatsBand />
      <AboutPreview />
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
