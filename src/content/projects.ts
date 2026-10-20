import { images, type SiteImage } from "./images";

export type ProjectStatus = "en-cours" | "realise" | "en-preparation";

export type Project = {
  slug: string;
  title: string;
  /** Accroche courte pour les cartes. */
  tagline: string;
  location: string;
  status: ProjectStatus;
  image: SiteImage;
  summary: string;
  /** Paragraphes de présentation de la page projet. */
  body: string[];
  /** Faits clés affichés en encadré. */
  facts: { label: string; value: string }[];
  /** Avancement mesurable (affiché en barre de progression). Absent si non renseigné. */
  progress?: { label: string; current: number; target: number; unit: string };
  /** Étapes marquantes, de la plus ancienne à la plus récente. */
  milestones?: { date: string; text: string }[];
  gallery: SiteImage[];
};

export const statusLabels: Record<ProjectStatus, string> = {
  "en-cours": "En cours",
  realise: "Réalisé",
  "en-preparation": "En préparation",
};

/**
 * Projets phares. Sources : cahier des charges KTGW et site de l'e.V.
 * Budgets et montants collectés : à saisir dans le dashboard (Phase 5/8).
 */
export const projects: Project[] = [
  {
    slug: "internat-jeunes-filles",
    title: "Internat pour jeunes filles",
    tagline: "Un toit sûr pour apprendre un métier",
    location: "Togo",
    status: "en-cours",
    image: images.ribbon,
    summary:
      "Un internat en blocs de terre comprimée pour héberger les apprenties venues de loin, afin qu'aucune jeune fille ne renonce à sa formation faute de logement.",
    body: [
      "Beaucoup de jeunes filles abandonnent leur apprentissage parce que le centre de formation est trop loin de chez elles. Les trajets quotidiens coûtent cher et les exposent à des risques. L'internat leur offre un cadre de vie sûr, à deux pas de leur lieu de formation.",
      "Le bâtiment, d'environ 300 m², est construit en blocs de terre comprimée (BTC). Ce matériau local et durable garde la fraîcheur. L'architecture est pensée pour le climat tropical : éclairage naturel, ventilation et gestion thermique limitent les besoins en énergie. Il compte 16 chambres de 4 lits et a été conçu pour pouvoir s'agrandir.",
      "Le 13 avril 2023, la fête des ouvriers (« Richtfest », une tradition allemande qui célèbre l'achèvement du gros œuvre) a réuni les partenaires, dont Togohilfe, un représentant de l'ambassade d'Allemagne et la Chambre des métiers de Cologne. Les autorités administratives, traditionnelles et religieuses étaient également présentes.",
      "Fin 2025, le premier bloc a été achevé. Il peut accueillir 24 apprenties.",
    ],
    facts: [
      { label: "Surface", value: "≈ 300 m²" },
      { label: "Chambres", value: "16 chambres de 4 lits" },
      { label: "Matériau", value: "Blocs de terre comprimée (BTC)" },
      { label: "Premier bloc", value: "24 apprenties, achevé fin 2025" },
    ],
    progress: { label: "Places disponibles", current: 24, target: 64, unit: "lits" },
    milestones: [
      { date: "2023-04-13", text: "Fête des ouvriers (Richtfest) avec les partenaires et les autorités" },
      { date: "2025-12-01", text: "Achèvement du premier bloc : 24 places pour les apprenties" },
    ],
    gallery: [images.ribbon, images.speech, images.guests, images.workersGroup],
  },
  {
    slug: "cefopexd",
    title: "Centre de formation CEFOPEXD",
    tagline: "Apprendre un métier pour gagner sa vie",
    location: "Devikinme",
    status: "en-cours",
    image: images.speech,
    summary:
      "Le centre de formation de Devikinme offre aux jeunes sortis de l'école une formation professionnelle qui leur permet de gagner leur vie.",
    body: [
      "Au Togo, de nombreux jeunes quittent l'école sans qualification. Le CEFOPEXD (Devikinme) leur propose une formation professionnelle concrète, tournée vers l'emploi et la création d'activité.",
      "La formation associe pratique en atelier et enseignements théoriques. Elle s'appuie sur l'expérience des partenaires allemands de l'artisanat, notamment la Chambre des métiers de Cologne.",
      "Les apprenants sont accompagnés jusqu'à leur insertion : recherche d'emploi, installation à leur compte et appui technique aux jeunes entrepreneurs.",
    ],
    facts: [
      { label: "Lieu", value: "Devikinme, Togo" },
      { label: "Public", value: "Jeunes sortis de l'école" },
      { label: "Approche", value: "Formation pratique et bilingue" },
      { label: "Objectif", value: "Insertion et création d'entreprise" },
    ],
    gallery: [images.speech, images.workersGroup, images.plantingPartners],
  },
  {
    slug: "femmes-solaires",
    title: "Femmes solaires",
    tagline: "L'énergie du soleil entre les mains des femmes",
    location: "Togo",
    status: "en-cours",
    image: images.plantingWoman,
    summary:
      "Des femmes découvrent et maîtrisent la technologie solaire pour éclairer leur foyer, développer une activité et transmettre leur savoir.",
    body: [
      "L'accès à l'énergie reste un défi dans de nombreuses communautés du Togo. Le projet « Femmes solaires » forme des femmes à la technologie solaire : comprendre une installation, l'utiliser, l'entretenir.",
      "Ces compétences leur ouvrent des activités génératrices de revenus et renforcent leur place dans la communauté. Le projet fait le lien entre autonomisation des femmes, énergies renouvelables et protection de l'environnement.",
    ],
    facts: [
      { label: "Public", value: "Femmes des communautés locales" },
      { label: "Domaine", value: "Énergies renouvelables" },
      { label: "Objectif", value: "Autonomie et revenus" },
    ],
    gallery: [images.plantingWoman, images.plantingEmbassy],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
