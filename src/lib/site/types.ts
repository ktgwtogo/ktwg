import { siteConfig, type SocialNetwork } from "@/config/site";
import type { SiteImage } from "@/content/images";

/** Paramètres du site modifiables dans /admin → Site (valeurs par défaut : src/config). */

export type Phone = { display: string; e164: string; whatsapp: boolean };

export type SiteConfigData = {
  togo: {
    address: { street: string; district: string; city: string; country: string };
    phones: Phone[];
    email: string;
    mapsUrl: string;
    mapsEmbedUrl: string;
  };
  germany: { name: string; city: string; phone: { display: string; e164: string }; email: string; website: string };
  socials: Record<SocialNetwork, string>;
};

export const defaultSiteConfig: SiteConfigData = JSON.parse(
  JSON.stringify({ togo: siteConfig.togo, germany: siteConfig.germany, socials: siteConfig.socials })
);

export type HeroSlide = {
  image: SiteImage;
  eyebrow: string;
  /** Titre en 3 parties : la partie centrale est mise en valeur. */
  title: [string, string, string];
  subtitle: string;
};
