/**
 * Structure de navigation du site.
 * `key` renvoie aux traductions du namespace « Nav » (src/messages/*.json).
 */

export type NavItem = { key: string; href: string };
export type NavEntry = NavItem & { children?: NavItem[] };

/** Menu principal du header, avec sous-menus (§6.2 du cahier des charges). */
export const mainNav: NavEntry[] = [
  {
    key: "about",
    href: "/a-propos",
    children: [
      { key: "whoWeAre", href: "/a-propos" },
      { key: "objectives", href: "/objectifs" },
      { key: "transparency", href: "/transparence" },
      { key: "gallery", href: "/galerie" },
    ],
  },
  {
    key: "projects",
    href: "/projets",
    children: [
      { key: "projectCefopexd", href: "/projets/cefopexd" },
      { key: "projectBoarding", href: "/projets/internat-jeunes-filles" },
      { key: "projectSolar", href: "/projets/femmes-solaires" },
      { key: "allProjects", href: "/projets" },
    ],
  },
  {
    key: "trainings",
    href: "/formations",
    children: [
      { key: "ourCourses", href: "/formations#filieres" },
      { key: "germanClubs", href: "/formations#clubs-allemand" },
      { key: "apply", href: "/formations#candidature" },
    ],
  },
  { key: "news", href: "/actualites" },
  { key: "events", href: "/evenements" },
  {
    key: "getInvolved",
    href: "/s-engager",
    children: [
      { key: "donate", href: "/faire-un-don" },
      { key: "becomePartner", href: "/partenariat" },
      { key: "volunteer", href: "/s-engager#benevolat" },
      { key: "join", href: "/s-engager#adhesion" },
    ],
  },
  { key: "contact", href: "/contact" },
];

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
  const path = href.split("#")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
