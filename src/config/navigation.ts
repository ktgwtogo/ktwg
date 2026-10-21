import {
  BedDouble,
  FileCheck2,
  GraduationCap,
  HandHeart,
  Handshake,
  Heart,
  IdCard,
  Images,
  Languages,
  LayoutGrid,
  PenLine,
  Sun,
  Target,
  Users,
  Wrench,
  Link2,
  FileText,
  Calendar,
  Newspaper,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { images, type ImageKey } from "@/content/images";

/**
 * Structure de navigation du site.
 * `key` renvoie aux traductions du namespace « Nav » (src/messages/*.json) ;
 * la description d'un sous-lien est la clé `Nav.desc.<key>`.
 */

/** Icônes proposées pour les liens de sous-menu (désignées par leur nom pour être stockées en base). */
export const navIcons = {
  Users,
  Target,
  FileCheck2,
  Images,
  GraduationCap,
  BedDouble,
  Sun,
  LayoutGrid,
  Wrench,
  Languages,
  PenLine,
  Heart,
  Handshake,
  HandHeart,
  IdCard,
  Link2,
  FileText,
  Calendar,
  Newspaper,
  Phone,
} satisfies Record<string, LucideIcon>;
export type NavIconName = keyof typeof navIcons;

export type NavItem = { key: string; href: string };
/**
 * Lien de sous-menu. `label` et `description` remplacent les traductions
 * (liens ajoutés ou renommés depuis /admin → Menus).
 */
export type NavChild = { key?: string; label?: string; description?: string; href: string; icon: NavIconName };
/** Encadré mis en avant dans un sous-menu (textes : `Nav.featured.<key>.*`). */
export type NavFeatured = { image: ImageKey; href: string };
export type NavEntry = { key?: string; label?: string; href: string; children?: NavChild[]; featured?: NavFeatured };

/** Menu principal du header, avec sous-menus (§6.2 du cahier des charges). */
export const mainNav: NavEntry[] = [
  {
    key: "about",
    href: "/a-propos",
    children: [
      { key: "whoWeAre", href: "/a-propos", icon: "Users" },
      { key: "objectives", href: "/objectifs", icon: "Target" },
      { key: "transparency", href: "/transparence", icon: "FileCheck2" },
      { key: "gallery", href: "/galerie", icon: "Images" },
    ],
    featured: { image: "plantingPartners", href: "/a-propos" },
  },
  {
    key: "projects",
    href: "/projets",
    children: [
      { key: "projectCefopexd", href: "/projets/cefopexd", icon: "GraduationCap" },
      { key: "projectBoarding", href: "/projets/internat-jeunes-filles", icon: "BedDouble" },
      { key: "projectSolar", href: "/projets/femmes-solaires", icon: "Sun" },
      { key: "allProjects", href: "/projets", icon: "LayoutGrid" },
    ],
    featured: { image: "ribbon", href: "/faire-un-don?projet=internat-jeunes-filles" },
  },
  {
    key: "trainings",
    href: "/formations",
    children: [
      { key: "ourCourses", href: "/formations#filieres", icon: "Wrench" },
      { key: "germanClubs", href: "/formations#clubs-allemand", icon: "Languages" },
      { key: "apply", href: "/formations#candidature", icon: "PenLine" },
    ],
    featured: { image: "speech", href: "/formations#candidature" },
  },
  { key: "news", href: "/actualites" },
  { key: "events", href: "/evenements" },
  {
    key: "getInvolved",
    href: "/s-engager",
    children: [
      { key: "donate", href: "/faire-un-don", icon: "Heart" },
      { key: "becomePartner", href: "/partenariat", icon: "Handshake" },
      { key: "volunteer", href: "/s-engager#benevolat", icon: "HandHeart" },
      { key: "join", href: "/s-engager#adhesion", icon: "IdCard" },
    ],
    featured: { image: "plantingHibiscus", href: "/faire-un-don" },
  },
  { key: "contact", href: "/contact" },
];

/** Image d'un encadré de sous-menu. */
export const featuredImage = (key: ImageKey) => images[key];

/** Colonnes de liens du footer (§8). */
export const footerNav = {
  navigation: [
    { key: "about", href: "/a-propos" },
    { key: "objectives", href: "/objectifs" },
    { key: "projects", href: "/projets" },
    { key: "trainings", href: "/formations" },
    { key: "news", href: "/actualites" },
    { key: "events", href: "/evenements" },
    { key: "gallery", href: "/galerie" },
    { key: "transparency", href: "/transparence" },
  ],
  engage: [
    { key: "donate", href: "/faire-un-don" },
    { key: "becomePartner", href: "/partenariat" },
    { key: "volunteer", href: "/s-engager#benevolat" },
    { key: "join", href: "/s-engager#adhesion" },
    { key: "apply", href: "/formations#candidature" },
    { key: "newsletter", href: "/#newsletter" },
    { key: "contact", href: "/contact" },
  ],
  legal: [
    { key: "legalNotice", href: "/mentions-legales" },
    { key: "privacy", href: "/confidentialite" },
  ],
} satisfies Record<string, NavItem[]>;

/** Vrai si `href` correspond à la page courante ou à l'une de ses sous-pages. */
export function isActivePath(pathname: string, href: string) {
  const path = href.split("#")[0].split("?")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
