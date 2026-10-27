import {
  Award,
  Briefcase,
  Building2,
  Coins,
  Cpu,
  Globe2,
  GraduationCap,
  Hammer,
  HandHeart,
  HeartPulse,
  Languages,
  Lightbulb,
  Rocket,
  Sprout,
  Sun,
  TreePine,
  Users,
  UtensilsCrossed,
  Venus,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Présidence & Direction fondatrice de l'ONG */
export const presidentFounder = {
  name: "Monsieur Blaise-Pascal D'ALMEIDA",
  title: "Président-Fondateur de KTGW",
  role: "Président-Fondateur de l'ONG KommTogoGehweiter",
  greeting: "Au nom de toute l'équipe de KTGW Togo et de nos partenaires en Allemagne et en France, je vous souhaite la bienvenue.",
  quote: "Chaque centime investi dans l'éducation en Afrique protège des chemins dangereux vers l'Europe.",
};

/** Les 13 objectifs statutaires de l'ONG, alignés sur les ODD des Nations Unies. */
export const objectives: { title: string; icon: LucideIcon; odd: string; tag?: string }[] = [
  { title: "Promouvoir l'éducation des enfants et la formation professionnelle des jeunes", icon: GraduationCap, odd: "ODD 4", tag: "Éducation" },
  { title: "Promouvoir la culture de l'excellence chez les apprenants", icon: Award, odd: "ODD 4", tag: "Excellence" },
  { title: "Encourager la créativité et l'esprit d'entreprendre", icon: Lightbulb, odd: "ODD 8 & 9", tag: "Entrepreneuriat" },
  { title: "Favoriser l'insertion sociale et professionnelle des jeunes filles et garçons", icon: Users, odd: "ODD 8 & 10", tag: "Insertion" },
  { title: "Promouvoir l'équité et les droits des femmes", icon: Venus, odd: "ODD 5", tag: "Genre & Droits" },
  {
    title: "Transformation agroalimentaire & valorisation des produits locaux",
    icon: UtensilsCrossed,
    odd: "ODD 2 & 12",
    tag: "Agroalimentaire",
  },
  { title: "Renforcer les capacités des jeunes artisans et artisanes en formation artisanale appliquée", icon: Hammer, odd: "ODD 8", tag: "Artisanat" },
  { title: "Assurer aux jeunes des activités génératrices de revenus", icon: Coins, odd: "ODD 1 & 8", tag: "Revenus" },
  { title: "Appuyer techniquement les jeunes entrepreneurs", icon: Wrench, odd: "ODD 9", tag: "Technique" },
  { title: "Encourager l'autopromotion à travers les PME/PMI", icon: Rocket, odd: "ODD 8 & 9", tag: "PME" },
  { title: "Appuyer les initiatives privées des personnes handicapées et des plus démunis", icon: HandHeart, odd: "ODD 10", tag: "Inclusion" },
  { title: "Promouvoir la salubrité, l'hygiène et la santé communautaire", icon: HeartPulse, odd: "ODD 3 & 6", tag: "Santé" },
  {
    title: "Contribuer au reboisement, à la protection de l'environnement et à la transition écologique",
    icon: TreePine,
    odd: "ODD 13 & 15",
    tag: "Environnement",
  },
  { title: "Développer les échanges culturels et linguistiques Togo–Allemagne", icon: Languages, odd: "ODD 17", tag: "Coopération" },
];

/** Les 17 Objectifs de Développement Durable (ODD) des Nations Unies intégrés aux actions de KTGW Togo */
export const unSdgs: {
  number: number;
  title: string;
  enTitle: string;
  deTitle: string;
  actionTogo: string;
  color: string;
}[] = [
  { number: 1, title: "Pas de pauvreté", enTitle: "No Poverty", deTitle: "Keine Armut", actionTogo: "Insertion économique des jeunes et bourses de formation", color: "#E5243B" },
  { number: 2, title: "Faim « zéro »", enTitle: "Zero Hunger", deTitle: "Kein Hunger", actionTogo: "Transformation agroalimentaire et souveraineté locale", color: "#DDA63A" },
  { number: 3, title: "Bonne santé et bien-être", enTitle: "Good Health and Well-being", deTitle: "Gesundheit und Wohlergehen", actionTogo: "Hygiène, salubrité et prévention en ateliers", color: "#4C9F38" },
  { number: 4, title: "Éducation de qualité", enTitle: "Quality Education", deTitle: "Hochwertige Bildung", actionTogo: "Formations professionnelles bilingues & clubs scolaires", color: "#C5192D" },
  { number: 5, title: "Égalité entre les sexes", enTitle: "Gender Equality", deTitle: "Geschlechtergleichheit", actionTogo: "Internat filles CEFOPEXD, priorité féminine aux bourses", color: "#FF3A21" },
  { number: 6, title: "Eau propre et assainissement", enTitle: "Clean Water and Sanitation", deTitle: "Sauberes Wasser", actionTogo: "Infrastructures sanitaires sur les sites de formation", color: "#26BDE2" },
  { number: 7, title: "Énergie propre et d'un coût abordable", enTitle: "Affordable and Clean Energy", deTitle: "Bezahlbare Energie", actionTogo: "Programme Femmes Solaires et installations photovoltaïques", color: "#FCC30B" },
  { number: 8, title: "Travail décent et croissance économique", enTitle: "Decent Work and Economic Growth", deTitle: "Menschenwürdige Arbeit", actionTogo: "Métiers qualifiés d'avenir : mécatronique, artisanat", color: "#A21942" },
  { number: 9, title: "Industrie, innovation et infrastructure", enTitle: "Industry, Innovation and Infrastructure", deTitle: "Industrie, Innovation", actionTogo: "Mécatronique industrielle, systèmes électroniques modernes", color: "#FD6925" },
  { number: 10, title: "Inégalités réduites", enTitle: "Reduced Inequalities", deTitle: "Weniger Ungleichheiten", actionTogo: "Appui aux personnes démunies et en situation de handicap", color: "#DD1367" },
  { number: 11, title: "Villes et communautés durables", enTitle: "Sustainable Cities and Communities", deTitle: "Nachhaltige Städte", actionTogo: "Développement local participatif dans les 6 villes du Togo", color: "#FD9D24" },
  { number: 12, title: "Consommation et production responsables", enTitle: "Responsible Consumption", deTitle: "Nachhaltiger Konsum", actionTogo: "Valorisation locale et transformation des récoltes togolaises", color: "#BF8B2E" },
  { number: 13, title: "Lutte contre les changements climatiques", enTitle: "Climate Action", deTitle: "Maßnahmen zum Klimaschutz", actionTogo: "Sensibilisation écologique et transition énergétique", color: "#3F7E44" },
  { number: 14, title: "Vie aquatique", enTitle: "Life Below Water", deTitle: "Leben unter Wasser", actionTogo: "Protection du littoral et des lagunes d'Aného et Lomé", color: "#0A97D9" },
  { number: 15, title: "Vie terrestre", enTitle: "Life on Land", deTitle: "Leben an Land", actionTogo: "Reboisement intensif et agro-écologie communautaire", color: "#56C02B" },
  { number: 16, title: "Paix, justice et institutions efficaces", enTitle: "Peace, Justice and Strong Institutions", deTitle: "Frieden und Gerechtigkeit", actionTogo: "Gouvernance transparente, audits et collégialité", color: "#00689D" },
  { number: 17, title: "Partenariats pour la réalisation des objectifs", enTitle: "Partnerships for the Goals", deTitle: "Partnerschaften", actionTogo: "Pont de coopération solidaire Togo–Allemagne–France", color: "#19486A" },
];

/** Les 5 domaines d'action. */
export const domains: { title: string; text: string; icon: LucideIcon; href: string }[] = [
  {
    title: "Formation professionnelle bilingue",
    text: "Des formations de pointe en français et en allemand : mécatronique industrielle, formation artisanale appliquée, agroalimentaire, mécanique, énergies renouvelables, comptabilité et informatique.",
    icon: GraduationCap,
    href: "/formations",
  },
  {
    title: "Création d'entreprises & insertion",
    text: "Accompagnement intensif des jeunes vers l'emploi durable, l'installation à leur propre compte et la création de PME togolaises.",
    icon: Briefcase,
    href: "/projets/cefopexd",
  },
  {
    title: "Éducation interculturelle",
    text: "Clubs de langue allemande dans les établissements scolaires pour favoriser les échanges Togo–Allemagne et l'ouverture sur le monde.",
    icon: Globe2,
    href: "/formations#clubs-allemand",
  },
  {
    title: "Autonomisation des femmes & internat",
    text: "Internat sécurisé pour les apprenties au CEFOPEXD, entrepreneuriat féminin et leadership communautaire.",
    icon: Venus,
    href: "/projets/internat-jeunes-filles",
  },
  {
    title: "Environnement, reboisement & ODD",
    text: "Plantations d'arbres, énergies solaires, transformation agroalimentaire saine et lutte contre le dérèglement climatique.",
    icon: Sprout,
    href: "/projets/femmes-solaires",
  },
];

/** Villes d'intervention au Togo (coordonnées pour la carte de présence). */
export const cities: { name: string; lat: number; lng: number; hq?: boolean }[] = [
  { name: "Dapaong", lat: 10.86, lng: 0.21 },
  { name: "Kara", lat: 9.55, lng: 1.19 },
  { name: "Atakpamé", lat: 7.53, lng: 1.13 },
  { name: "Kpalimé", lat: 6.9, lng: 0.63 },
  { name: "Lomé (Siège Tokoin)", lat: 6.13, lng: 1.22, hq: true },
  { name: "Aného", lat: 6.23, lng: 1.6 },
];

/** Filières de formation professionnelle. */
export const courses: {
  title: string;
  badge?: string;
  text: string;
  icon: LucideIcon;
  prerequisites?: string;
  deadline?: string;
  startDate?: string;
}[] = [
  {
    title: "Mécatronique Industrielle & Systèmes Embarqués",
    badge: "Bourse 65% · Niveau BAC requis",
    text: "Formation qualifiante d'excellence de 09 mois + 03 mois de stage en entreprise : électronique automobile, diagnostic assisté par ordinateur, mécanique de précision, programmation, systèmes embarqués, domotique et allemand technique gratuit. Bourse pour les 50 premiers inscrits et internat sécurisé garanti pour les femmes.",
    icon: Cpu,
    prerequisites: "Niveau BAC ou BAC+ impératif (admission exclusive sur présentation du BAC)",
    deadline: "12 Novembre 2026",
    startDate: "16 Novembre 2026",
  },
  {
    title: "Formation artisanale appliquée",
    badge: "Savoir-faire pratique & emploi",
    text: "Façonnage de métaux, menuiserie d'art, forge, ferronnerie et confection d'équipements pratiques adaptés répondant aux commandes et besoins réels des communautés et ateliers togolais, sous le tutorat de maîtres artisans chevronnés.",
    icon: Hammer,
  },
  {
    title: "Transformation agroalimentaire & valorisation locale",
    badge: "Filière porteuse ODD 2 & 12",
    text: "Techniques modernes de séchage solaire de fruits (mangues, ananas, papaye), transformation de céréales locales, conditionnement hygiénique, conserves et commercialisation de produits togolais à forte valeur ajoutée.",
    icon: UtensilsCrossed,
  },
  {
    title: "Mécanique appliquée & maintenance industrielle",
    badge: "Forte demande",
    text: "Diagnostic électromécanique, révision des moteurs thermiques et électriques, maintenance préventive d'équipements d'ateliers et respect des normes de sécurité industrielle.",
    icon: Wrench,
  },
  {
    title: "Énergies renouvelables & solaire",
    badge: "Transition énergétique",
    text: "Dimensionnement, installation et maintenance d'équipements photovoltaïques et pompage solaire pour un accès universel à l'énergie propre.",
    icon: Sun,
  },
  {
    title: "Comptabilité & gestion d'entreprise",
    badge: "Gestion & PME",
    text: "Comptabilité générale, fiscalité pratique, logiciels de gestion et accompagnement à la création d'activités génératrices de revenus.",
    icon: Coins,
  },
  {
    title: "Informatique & technologies numériques",
    badge: "Compétences clés",
    text: "Bureautique avancée, maintenance matérielle, réseaux, cybersécurité de base et outils collaboratifs essentiels pour le monde professionnel.",
    icon: Building2,
  },
  {
    title: "Langue allemande appliquée",
    badge: "Ouverture internationale",
    text: "Apprentissage intensif de l'allemand professionnel intégré aux filières pour faciliter les opportunités de bourses, de stages et les échanges avec nos partenaires en Allemagne.",
    icon: Languages,
  },
];

/** Chiffres clés vérifiés (les autres indicateurs seront saisis dans le dashboard). */
export function keyFigures(partnerCount: number) {
  return [
    { value: new Date().getFullYear() - 2018, suffix: "+", label: "années d'action au Togo", icon: "sprout" },
    { value: 6, suffix: "", label: "villes d'intervention", icon: "map" },
    { value: 17, suffix: "", label: "ODD des Nations Unies intégrés", icon: "target" },
    { value: 24, suffix: "", label: "places à l'internat des filles", icon: "home" },
    { value: partnerCount, suffix: "", label: "partenaires engagés", icon: "handshake" },
    { value: 3, suffix: "", label: "pays : Togo, Allemagne, France", icon: "globe" },
  ] as const;
}
