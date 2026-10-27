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
  TreePine,
  Users,
  Venus,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Les 13 objectifs statutaires de l'ONG. */
export const objectives: { title: string; icon: LucideIcon }[] = [
  { title: "Promouvoir l'éducation des enfants et la formation professionnelle des jeunes", icon: GraduationCap },
  { title: "Promouvoir la culture de l'excellence chez les apprenants", icon: Award },
  { title: "Encourager la créativité et l'esprit d'entreprendre", icon: Lightbulb },
  { title: "Favoriser l'insertion sociale et professionnelle des jeunes filles et garçons", icon: Users },
  { title: "Promouvoir l'équité et les droits des femmes", icon: Venus },
  { title: "Renforcer les capacités des jeunes artisans et artisanes", icon: Hammer },
  { title: "Assurer aux jeunes des activités génératrices de revenus", icon: Coins },
  { title: "Appuyer techniquement les jeunes entrepreneurs", icon: Wrench },
  { title: "Encourager l'autopromotion à travers les PME/PMI", icon: Rocket },
  { title: "Appuyer les initiatives privées des personnes handicapées et des plus démunis", icon: HandHeart },
  { title: "Promouvoir la salubrité, l'hygiène et la santé", icon: HeartPulse },
  {
    title: "Contribuer au reboisement, à la protection de l'environnement et à la sensibilisation au changement climatique",
    icon: TreePine,
  },
  { title: "Développer les échanges culturels et linguistiques Togo–Allemagne", icon: Languages },
];

/** Les 5 domaines d'action. */
export const domains: { title: string; text: string; icon: LucideIcon; href: string }[] = [
  {
    title: "Formation professionnelle bilingue",
    text: "Des formations en français et en allemand : coutellerie, comptabilité, mécanique, énergies renouvelables, informatique.",
    icon: GraduationCap,
    href: "/formations",
  },
  {
    title: "Création d'entreprises & insertion",
    text: "Accompagnement des jeunes vers l'emploi, l'installation à leur compte et la création de PME.",
    icon: Briefcase,
    href: "/projets/cefopexd",
  },
  {
    title: "Éducation interculturelle",
    text: "Des clubs de langue allemande dans les écoles togolaises pour ouvrir les jeunes au monde.",
    icon: Globe2,
    href: "/formations#clubs-allemand",
  },
  {
    title: "Autonomisation des femmes",
    text: "Entrepreneuriat féminin, internat pour les apprenties et développement communautaire.",
    icon: Venus,
    href: "/projets/internat-jeunes-filles",
  },
  {
    title: "Environnement & reboisement",
    text: "Plantations d'arbres, sensibilisation au changement climatique et énergie solaire.",
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
  { name: "Lomé", lat: 6.13, lng: 1.22, hq: true },
  { name: "Aného", lat: 6.23, lng: 1.6 },
];

/** Filières de formation professionnelle. */
export const courses: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Mécatronique (avec Bourse 65%)",
    text: "Formation qualifiante de 09 mois + 03 mois de stage en entreprise : électronique auto, diagnostic, mécanique appliquée, programmation, systèmes embarqués, domotique et allemand gratuit. Bourse pour les 50 premiers inscrits et internat pour filles.",
    icon: Cpu,
  },
  {
    title: "Coutellerie",
    text: "Forge, façonnage et finition d'outils et de couteaux : un savoir-faire artisanal transmis avec des maîtres artisans.",
    icon: Hammer,
  },
  {
    title: "Comptabilité",
    text: "Tenue des comptes, gestion et outils numériques, pour travailler en entreprise ou gérer sa propre activité.",
    icon: Coins,
  },
  {
    title: "Mécanique",
    text: "Entretien et réparation, diagnostic et sécurité en atelier : des compétences très demandées.",
    icon: Wrench,
  },
  {
    title: "Énergies renouvelables",
    text: "Installation et maintenance de systèmes solaires, pour un accès durable à l'énergie.",
    icon: Lightbulb,
  },
  {
    title: "Informatique",
    text: "Bureautique, maintenance et outils numériques, la base de tous les métiers d'aujourd'hui.",
    icon: Building2,
  },
  {
    title: "Langue allemande",
    text: "Des cours d'allemand intégrés aux formations, pour les échanges avec les partenaires et l'ouverture internationale.",
    icon: Languages,
  },
];

/** Chiffres clés vérifiés (les autres indicateurs seront saisis dans le dashboard). */
export function keyFigures(partnerCount: number) {
  return [
    { value: new Date().getFullYear() - 2018, suffix: "", label: "années d'action au Togo", icon: "sprout" },
    { value: 6, suffix: "", label: "villes d'intervention", icon: "map" },
    { value: 13, suffix: "", label: "objectifs pour le Togo", icon: "target" },
    { value: 24, suffix: "", label: "places pour les apprenties à l'internat", icon: "home" },
    { value: partnerCount, suffix: "", label: "partenaires engagés", icon: "handshake" },
    { value: 3, suffix: "", label: "pays : Togo, Allemagne, France", icon: "globe" },
  ] as const;
}
