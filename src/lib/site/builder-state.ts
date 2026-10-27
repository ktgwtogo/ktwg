import { siteConfig } from "@/config/site";
import { courses, domains, keyFigures, objectives, presidentFounder, unSdgs } from "@/content/organization";

export type SectionBlock = {
  id: string;
  page: string;
  name: string;
  category: "hero" | "banner" | "stats" | "content" | "courses" | "sdgs" | "cta" | "footer";
  enabled: boolean;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  text?: string;
  ctaText?: string;
  ctaUrl?: string;
  image?: string;
  badge?: string;
  iconName?: string;
  items?: { label: string; value?: string; text?: string; icon?: string; link?: string }[];
};

export type ThemeSettings = {
  primaryColor: string;
  accentColor: string;
  sunColor: string;
  borderRadius: "sm" | "md" | "lg" | "full";
  shadowStyle: "soft" | "crisp" | "glow";
  buttonStyle: "gradient" | "solid" | "outline";
  fontHeading: string;
};

export type SiteAnnouncement = {
  id: string;
  enabled: boolean;
  title: string;
  text: string;
  badge: string;
  url: string;
  startDate?: string;
  endDate?: string;
  shareLinks: {
    whatsapp: boolean;
    facebook: boolean;
    tiktok: boolean;
    linkedin: boolean;
  };
};

export type GlobalSiteData = {
  lastPublishedAt?: string;
  publishedBy?: string;
  designerEmail: string;
  theme: ThemeSettings;
  announcements: SiteAnnouncement[];
  sections: SectionBlock[];
};

export const defaultThemeSettings: ThemeSettings = {
  primaryColor: "#055032", // KTGW Green
  accentColor: "#DE2017", // KTGW Red
  sunColor: "#F4C400", // KTGW Sun Gold
  borderRadius: "lg",
  shadowStyle: "soft",
  buttonStyle: "gradient",
  fontHeading: "Outfit, sans-serif",
};

export const defaultAnnouncements: SiteAnnouncement[] = [
  {
    id: "bourse-mecatronique-2026",
    enabled: true,
    title: "Bourse 65% en Mécatronique Industrielle & Systèmes Embarqués",
    text: "Formation qualifiante d'excellence au CEFOPEXD (09 mois + 03 mois de stage). Rentrée le 16 novembre 2026. Clôture des inscriptions le 12 novembre 2026. Condition impérative : niveau BAC requis uniquement. Internat sécurisé garanti pour les filles.",
    badge: "Appel Officiel 2026",
    url: "/formations#bourse-mecatronique",
    startDate: "2026-10-01",
    endDate: "2026-11-12",
    shareLinks: {
      whatsapp: true,
      facebook: true,
      tiktok: true,
      linkedin: true,
    },
  },
];

export const defaultSections: SectionBlock[] = [
  {
    id: "home-hero",
    page: "accueil",
    name: "Diaporama En-tête Accueil",
    category: "hero",
    enabled: true,
    title: "Former aujourd'hui les bâtisseurs du Togo de demain",
    subtitle: "Éducation, formation professionnelle bilingue et autonomisation des jeunes, surtout des femmes, depuis 2018 au Togo.",
    eyebrow: "Komm Togo geh weiter",
    ctaText: "Découvrir nos filières",
    ctaUrl: "/formations",
    image: "/images/plantation-partenaires.webp",
  },
  {
    id: "home-spotlight-mecatronique",
    page: "accueil",
    name: "Spotlight Bourse Mécatronique Industrielle",
    category: "banner",
    enabled: true,
    title: "Appel à candidature officiel : Formation qualifiante en Mécatronique Industrielle (09 mois + 03 mois stage). Admission uniquement avec le BAC. Internat filles garanti.",
    badge: "Bourse 65% · 50 Places",
    eyebrow: "CEFOPEXD (Lacs 3)",
    ctaText: "Voir l'appel & postuler",
    ctaUrl: "/formations#bourse-mecatronique",
  },
  {
    id: "home-stats",
    page: "accueil",
    name: "Compteurs & Chiffres Clés",
    category: "stats",
    enabled: true,
    title: "KTGW Togo en chiffres",
    items: [
      { label: "années d'action au Togo", value: `${new Date().getFullYear() - 2018}+`, icon: "Sprout" },
      { label: "villes d'intervention", value: "6", icon: "MapPinned" },
      { label: "ODD des Nations Unies intégrés", value: "17", icon: "Target" },
      { label: "places à l'internat des filles", value: "24", icon: "Home" },
      { label: "pays : Togo, Allemagne, France", value: "3", icon: "Globe2" },
    ],
  },
  {
    id: "home-about",
    page: "accueil",
    name: "Qui sommes-nous & Président-Fondateur",
    category: "content",
    enabled: true,
    eyebrow: "Qui sommes-nous",
    title: "Une ONG togolaise, un pont fraternel avec l'Allemagne",
    text: "Portée avec dévouement par son Président-Fondateur Monsieur Blaise-Pascal D'ALMEIDA, KTGW Togo forme les jeunes et les femmes aux métiers d'excellence.",
    image: "/images/plantation-partenaires.webp",
    ctaText: "En savoir plus",
    ctaUrl: "/a-propos",
  },
  {
    id: "home-domains",
    page: "accueil",
    name: "5 Domaines d'Action Clés",
    category: "content",
    enabled: true,
    eyebrow: "Nos domaines d'action",
    title: "Cinq leviers majeurs pour l'essor de la jeunesse togolaise",
    subtitle: "Formation d'excellence, entrepreneuriat, clubs d'allemand, internat féminin et agro-écologie.",
  },
  {
    id: "home-sdgs-preview",
    page: "accueil",
    name: "Objectifs & Cap 17 ODD des Nations Unies",
    category: "sdgs",
    enabled: true,
    eyebrow: "Cap Nations Unies",
    title: "Les 17 Objectifs de Développement Durable (ODD)",
    subtitle: "De l'éradication de la précarité à la transformation agroalimentaire et l'industrie moderne mécatronique, nos programmes incarnent les ODD au Togo.",
    ctaText: "Explorer tous les ODD",
    ctaUrl: "/objectifs",
  },
  {
    id: "home-courses-preview",
    page: "accueil",
    name: "Filières de Formation Professionnelle",
    category: "courses",
    enabled: true,
    eyebrow: "Nos filières",
    title: "Des métiers utiles et tournés vers l'emploi",
    subtitle: "Mécatronique industrielle (BAC obligatoire), formation artisanale appliquée, transformation agroalimentaire, mécanique appliquée, énergies solaires.",
    ctaText: "Voir toutes les formations",
    ctaUrl: "/formations",
  },
  {
    id: "home-final-cta",
    page: "accueil",
    name: "Bandeau d'Appel au Don & Bénévolat",
    category: "cta",
    enabled: true,
    title: "Chaque centime pour l'éducation compte",
    subtitle: "Un don ou un engagement bénévole permet à un jeune togolais d'apprendre un métier noble et de vivre dignement dans son pays.",
    ctaText: "Faire un don",
    ctaUrl: "/faire-un-don",
  },
  {
    id: "footer-togo-hq",
    page: "global",
    name: "Pied de page & Siège Tokoin Lomé",
    category: "footer",
    enabled: true,
    title: "Siège National KTGW Togo (Tokoin Lomé)",
    text: "Rue Okeloukoutou, Tokoin Cébévito, Lomé – Togo. Non loin du CHU Sylvanus Olympio.",
    ctaText: "Itinéraire vers le siège",
    ctaUrl: siteConfig.togo.mapsUrl,
  },
];

export const defaultGlobalSiteData: GlobalSiteData = {
  lastPublishedAt: new Date().toISOString(),
  publishedBy: presidentFounder.name,
  designerEmail: "contact@ktgw-togo.org",
  theme: defaultThemeSettings,
  announcements: defaultAnnouncements,
  sections: defaultSections,
};
