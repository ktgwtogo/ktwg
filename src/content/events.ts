import { images, type SiteImage } from "./images";

export type KtgwEvent = {
  slug: string;
  title: string;
  /** Début / fin au format ISO local (heure de Lomé). */
  start: string;
  end?: string;
  venue: string;
  city: string;
  format: "presentiel" | "en-ligne";
  capacity?: number;
  registered?: number;
  image: SiteImage;
  summary: string;
  body: string[];
  /** Contenu d'exemple à remplacer depuis le dashboard (affiché avec un badge « Exemple »). */
  sample?: boolean;
};

/**
 * Agenda. Les événements à venir marqués `sample` sont des exemples de démonstration :
 * remplacez-les par les vrais événements (dashboard, Phase 8) avant la mise en ligne.
 */
export const events: KtgwEvent[] = [
  {
    slug: "rentree-mecatronique-bourse-2026",
    title: "Rentrée de la promotion Mécatronique (avec Bourse 65%)",
    start: "2026-11-16T08:00",
    end: "2026-11-16T17:00",
    venue: "Centre CEFOPEXD, Dévikinmé (Commune des Lacs 3)",
    city: "Devikinme",
    format: "presentiel",
    capacity: 50,
    registered: 0,
    image: images.flyerMecatronique,
    summary:
      "Rentrée officielle des 50 premiers boursiers en Mécatronique : remise des tenues et caisses à outils, accueil des apprenantes à l'internat.",
    body: [
      "Le 16 novembre 2026 marque le lancement officiel de la formation professionnelle qualifiante en Mécatronique avec bourse de 65% au centre CEFOPEXD.",
      "Au programme : accueil des lauréats admis, remise des équipements complets (tenues et outillage de pointe inclus), installation des apprenties hébergées dans l'internat du centre, et démarrage des premiers modules techniques et cours d'allemand.",
      "Informations et inscriptions auprès du centre : +228 96 97 53 53 / cefopexd@gmail.com.",
    ],
  },
  {
    slug: "portes-ouvertes-cefopexd",
    title: "Journée portes ouvertes du CEFOPEXD",
    start: "2026-11-14T09:00",
    end: "2026-11-14T16:00",
    venue: "Centre CEFOPEXD",
    city: "Devikinme",
    format: "presentiel",
    capacity: 120,
    registered: 0,
    image: images.workersGroup,
    summary: "Découvrez les ateliers, rencontrez les formateurs et informez-vous sur les inscriptions.",
    body: [
      "Le centre ouvre ses portes aux jeunes, aux familles et aux partenaires. Au programme : visite des ateliers, démonstrations et présentation des filières.",
      "Une séance d'information sur les candidatures et l'internat pour jeunes filles aura lieu dans l'après-midi.",
    ],
    sample: true,
  },
  {
    slug: "plantation-journee-benevolat",
    title: "Grande plantation citoyenne",
    start: "2026-12-05T08:00",
    end: "2026-12-05T12:00",
    venue: "Siège de KTGW Togo, Tokoin Cébévito",
    city: "Lomé",
    format: "presentiel",
    capacity: 60,
    registered: 0,
    image: images.plantingHibiscus,
    summary: "Une matinée de reboisement avec les apprenti·e·s, les bénévoles et les habitants du quartier.",
    body: [
      "À l'occasion de la Journée internationale des bénévoles, rejoignez-nous pour planter des arbres et sensibiliser au changement climatique.",
      "Gants et plants fournis. Venez avec une gourde et un chapeau !",
    ],
    sample: true,
  },
  {
    slug: "rencontre-clubs-allemand-2027",
    title: "Rencontre des clubs d'allemand",
    start: "2027-01-23T10:00",
    end: "2027-01-23T15:00",
    venue: "En ligne et à Lomé",
    city: "Lomé",
    format: "en-ligne",
    capacity: 200,
    registered: 0,
    image: images.guests,
    summary: "Échanges, jeux et présentations des élèves des clubs d'allemand, en lien avec des classes en Allemagne.",
    body: [
      "Les clubs de langue allemande des écoles togolaises présentent leurs projets et échangent en direct avec des élèves et bénévoles en Allemagne.",
    ],
    sample: true,
  },
  {
    slug: "richtfest-internat-2023",
    title: "Fête des ouvriers (Richtfest) de l'internat",
    start: "2023-04-13T09:00",
    venue: "Chantier de l'internat pour jeunes filles",
    city: "Togo",
    format: "presentiel",
    image: images.speech,
    summary: "Célébration de l'achèvement du gros œuvre de l'internat avec les partenaires et les autorités.",
    body: [
      "Partenaires togolais et allemands, autorités administratives, traditionnelles et religieuses et ouvriers du chantier se sont réunis pour cette fête traditionnelle allemande.",
    ],
  },
];

const now = () => new Date();
export const upcomingEvents = () =>
  events.filter((e) => new Date(e.end ?? e.start) >= now()).sort((a, b) => a.start.localeCompare(b.start));
export const pastEvents = () =>
  events.filter((e) => new Date(e.end ?? e.start) < now()).sort((a, b) => b.start.localeCompare(a.start));
export const getEvent = (slug: string) => events.find((e) => e.slug === slug);
