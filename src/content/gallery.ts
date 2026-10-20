import { images, type SiteImage } from "./images";

export const galleryCategories = ["Internat", "Cérémonies", "Environnement", "Partenaires"] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export type GalleryItem = SiteImage & { category: GalleryCategory; caption: string };

/** Photothèque. Les futures photos seront ajoutées depuis le dashboard (Supabase Storage). */
export const gallery: GalleryItem[] = [
  { ...images.ribbon, category: "Internat", caption: "Inauguration de l'internat pour jeunes filles" },
  { ...images.speech, category: "Cérémonies", caption: "Discours lors de la fête des ouvriers (Richtfest)" },
  { ...images.workersGroup, category: "Internat", caption: "Partenaires, officiels et ouvriers du chantier" },
  { ...images.plantingEmbassy, category: "Environnement", caption: "Plantation avec l'ambassade d'Allemagne" },
  { ...images.guests, category: "Partenaires", caption: "Les invités et partenaires sous le chapiteau" },
  { ...images.plantingHibiscus, category: "Environnement", caption: "Plantation d'un hibiscus" },
  { ...images.priest, category: "Cérémonies", caption: "Prise de parole devant l'assemblée" },
  { ...images.plantingWoman, category: "Environnement", caption: "Les femmes au cœur du reboisement" },
  { ...images.plantingPartners, category: "Partenaires", caption: "Coopération Allemagne–Togo sur le terrain" },
  { ...images.blessing, category: "Cérémonies", caption: "Bénédiction des plantations" },
];
