import { images, type SiteImage } from "./images";

/**
 * Emplacements d'images modifiables dans /admin → Site → Images du site.
 * Chaque emplacement garde sa photo d'origine tant qu'aucune autre n'a été choisie.
 */
export const imageSlots = {
  "home.about": { group: "Accueil", label: "Section « Qui sommes-nous »", image: images.plantingPartners },
  "home.impact": { group: "Accueil", label: "Section « Impact & témoignages »", image: images.workersGroup },
  "home.partners": { group: "Accueil", label: "Encadré « Devenez notre partenaire »", image: images.guests },

  "banner.a-propos": { group: "Bannières des pages", label: "À propos", image: images.plantingPartners },
  "banner.objectifs": { group: "Bannières des pages", label: "Objectifs", image: images.plantingWoman },
  "banner.projets": { group: "Bannières des pages", label: "Projets", image: images.speech },
  "banner.formations": { group: "Bannières des pages", label: "Formations", image: images.workersGroup },
  "banner.actualites": { group: "Bannières des pages", label: "Actualités", image: images.priest },
  "banner.evenements": { group: "Bannières des pages", label: "Événements", image: images.guests },
  "banner.galerie": { group: "Bannières des pages", label: "Galerie", image: images.blessing },
  "banner.partenariat": { group: "Bannières des pages", label: "Partenariat", image: images.guests },
  "banner.s-engager": { group: "Bannières des pages", label: "S'engager", image: images.plantingHibiscus },
  "banner.faire-un-don": { group: "Bannières des pages", label: "Faire un don", image: images.plantingWoman },
  "banner.transparence": { group: "Bannières des pages", label: "Transparence", image: images.guests },
  "banner.contact": { group: "Bannières des pages", label: "Contact", image: images.guests },
  "banner.default": { group: "Bannières des pages", label: "Pages personnalisées (si aucune image n'est choisie)", image: images.workersGroup },

  "a-propos.histoire": { group: "Photos dans les pages", label: "À propos — photo de l'historique", image: images.ribbon },
  "formations.internat": { group: "Photos dans les pages", label: "Formations — photo de l'internat", image: images.plantingEmbassy },
} satisfies Record<string, { group: string; label: string; image: SiteImage }>;

export type ImageSlot = keyof typeof imageSlots;
export type SiteImages = Record<ImageSlot, SiteImage>;

export const imageSlotKeys = Object.keys(imageSlots) as ImageSlot[];

export const defaultSiteImages = Object.fromEntries(imageSlotKeys.map((k) => [k, imageSlots[k].image])) as SiteImages;
