import { images } from "@/content/images";
import type { HeroSlide } from "@/lib/site/types";

/** Diaporama d'origine de l'accueil (modifiable dans /admin → Site → Accueil). */
export const defaultHeroSlides: HeroSlide[] = [
  {
    image: images.ribbon,
    eyebrow: "ONG togolaise · depuis 2018",
    title: ["Former aujourd'hui les", "bâtisseurs", "du Togo de demain"],
    subtitle:
      "Éducation, formation professionnelle bilingue et autonomisation des jeunes, surtout des femmes, depuis 2018.",
  },
  {
    image: images.speech,
    eyebrow: "Formation professionnelle bilingue",
    title: ["Un métier entre les mains,", "un avenir", "devant soi"],
    subtitle:
      "Mécatronique industrielle, formation artisanale sur-mesure, transformation agroalimentaire, mécanique appliquée, énergies renouvelables : des formations d'excellence tournées vers l'emploi.",
  },
  {
    image: images.plantingEmbassy,
    eyebrow: "Autonomisation des femmes",
    title: ["Les femmes,", "cœur battant", "du changement"],
    subtitle:
      "Internat pour les apprenties, entrepreneuriat féminin et énergie solaire : nous accompagnons chaque jeune fille vers son autonomie.",
  },
  {
    image: images.guests,
    eyebrow: "Coopération Togo – Allemagne",
    title: ["Ensemble,", "de Lomé à Cologne,", "pour l'éducation"],
    subtitle:
      "Avec kommTOGOgehweiter e.V., nos partenaires et nos bénévoles, nous unissons nos forces pour que chaque centime investi dans l'éducation compte.",
  },
];
