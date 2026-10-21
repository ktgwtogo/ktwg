import { images, type SiteImage } from "./images";

export type Post = {
  slug: string;
  title: string;
  /** Date ISO (AAAA-MM-JJ). */
  date: string;
  /** Rubrique (libre depuis l'administration). */
  category: string;
  image: SiteImage;
  excerpt: string;
  body: string[];
  gallery?: SiteImage[];
  /** Emplacements : "actualites", "accueil", "page:<adresse>". */
  placements?: string[];
  links?: { label: string; url: string }[];
  videoUrl?: string | null;
  author?: string | null;
  pinned?: boolean;
};

/** Actualités, de la plus récente à la plus ancienne. Faits issus du cahier des charges. */
export const posts: Post[] = [
  {
    slug: "premier-bloc-internat-acheve",
    title: "Internat des jeunes filles : le premier bloc est achevé",
    date: "2025-12-01",
    category: "Projets",
    image: images.ribbon,
    excerpt:
      "Fin 2025, le premier bloc de l'internat a été achevé. Il peut désormais accueillir 24 apprenties dans un cadre sûr et adapté au climat.",
    body: [
      "C'est une étape décisive pour le projet d'internat porté par KTGW Togo et ses partenaires : le premier bloc du bâtiment est achevé et peut accueillir 24 apprenties.",
      "Construit en blocs de terre comprimée, le bâtiment est conçu pour le climat tropical. L'éclairage naturel et la gestion thermique assurent un confort durable sans surconsommation d'énergie.",
      "Grâce à l'internat, des jeunes filles venues de loin peuvent suivre leur formation professionnelle sans trajets longs, coûteux et risqués. La suite du projet prévoit l'extension du bâtiment jusqu'à 16 chambres de 4 lits.",
    ],
    gallery: [images.ribbon, images.guests],
  },
  {
    slug: "richtfest-internat-13-avril-2023",
    title: "Richtfest : la fête des ouvriers célébrée à l'internat",
    date: "2023-04-13",
    category: "Vie de l'ONG",
    image: images.speech,
    excerpt:
      "Le 13 avril 2023, partenaires togolais et allemands, autorités et ouvriers se sont réunis pour célébrer l'achèvement du gros œuvre de l'internat.",
    body: [
      "Le « Richtfest » est une tradition allemande : on célèbre la fin du gros œuvre d'un bâtiment en remerciant celles et ceux qui l'ont construit. Le 13 avril 2023, KTGW Togo a fait vivre cette tradition sur le chantier de l'internat pour jeunes filles.",
      "La cérémonie a réuni les partenaires du projet (Togohilfe, un représentant de l'ambassade d'Allemagne et la Chambre des métiers de Cologne) ainsi que les autorités administratives, traditionnelles et religieuses.",
      "Les ouvriers du chantier ont été mis à l'honneur : leur travail donne corps à un projet qui changera la vie de nombreuses apprenties.",
    ],
    gallery: [images.speech, images.workersGroup, images.priest, images.guests],
  },
  {
    slug: "plantations-arbres-internat",
    title: "Des arbres plantés pour l'avenir de l'internat",
    date: "2023-04-13",
    category: "Environnement",
    image: images.plantingEmbassy,
    excerpt:
      "Lors de la cérémonie, partenaires, apprenties et officiels ont planté des arbres et un hibiscus autour du futur internat, un geste fort pour l'environnement.",
    body: [
      "La protection de l'environnement fait partie des objectifs de KTGW Togo. En marge de la fête des ouvriers, des arbres et un hibiscus ont été plantés autour du futur internat.",
      "Partenaires allemands, représentants de l'ambassade, apprenties et ouvriers ont mis la main à la terre. Les plantations ont ensuite été bénies.",
      "Ces arbres offriront de l'ombre et de la fraîcheur aux futures pensionnaires. Ils rappellent qu'éducation et environnement avancent ensemble.",
    ],
    gallery: [images.plantingEmbassy, images.plantingHibiscus, images.plantingPartners, images.plantingWoman, images.blessing],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
