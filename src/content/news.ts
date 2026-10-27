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
    slug: "bourse-formation-mecatronique-cefopexd-2026",
    title: "Appel à candidature : Formation d'Excellence en Mécatronique avec Bourse de 65%",
    date: "2026-10-20",
    category: "Formations & Bourses",
    pinned: true,
    image: images.flyerMecatronique,
    excerpt:
      "L'ONG KommTogoGehweiter, KTGW-TOGO, le centre CEFOPEXD et leurs partenaires allemands lancent une formation professionnelle qualifiante en Mécatronique avec 50 bourses de 65%. Rentrée le 16 novembre 2026.",
    body: [
      "L'ONG KommTogoGehweiter, KTGW-TOGO, le centre de formation professionnelle CEFOPEXD et leurs partenaires allemands organisent une formation professionnelle qualifiante de haut niveau avec BOURSE en MÉCATRONIQUE.",
      "Le programme s'articule autour de 8 compétences de pointe : Électronique automobile, Diagnostic automobile assisté par ordinateur, Mécanique appliquée, Programmation, Systèmes embarqués, Systèmes Réseaux et Sécurité, Domotique, ainsi que des Cours d'Allemand gratuit pour favoriser les échanges avec l'artisanat et les entreprises d'Allemagne.",
      "Durée de la formation : 09 mois de formation intensive théorique et pratique en ateliers équipés + 03 mois de stage professionnel garanti en entreprise. Une bourse exceptionnelle de 65% est offerte aux 50 premiers inscrits (frais de formation réduits à seulement 65.000 FCFA payables en 3 tranches ; inscription 35.000 FCFA comprenant tenue de travail et boîte à outils complètes).",
      "Conditions d'admission : Niveau BAC, BAC+ ou étudiants, âgés de 18 à 28 ans. Les candidatures féminines sont vivement encouragées avec possibilité d'hébergement complet dans l'Internat pour les filles au sein même du centre CEFOPEXD à Dévikinmé (Commune des Lacs 3). Les garçons sont également les bienvenus.",
      "Composition du dossier : 1) Une lettre de demande d'inscription adressée au Président de l'ONG KommTogoGehweiter, 2) Une copie simple du relevé de notes du BAC, 3) Une copie simple d'acte de naissance ou pièce d'identité.",
      "Dépôt des candidatures : Envoyez votre dossier en fichiers PDF par e-mail à cefopexd@gmail.com ou par WhatsApp au +228 96 97 53 53. Clôture des candidatures le 20 octobre 2026 à 17h00. Rentrée officielle le 16 novembre 2026.",
    ],
    links: [
      { label: "Postuler via WhatsApp (+228 96 97 53 53)", url: "https://wa.me/22896975353" },
      { label: "Consulter la page Formations", url: "/formations#bourse-mecatronique" },
    ],
  },
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
