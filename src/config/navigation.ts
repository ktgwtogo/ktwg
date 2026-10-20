/**
 * Structure de navigation du site.
 * `key` renvoie aux traductions du namespace « Nav » (src/messages/*.json).
 */

export type NavItem = { key: string; href: string };

/** Menu principal du header (§6.2 du cahier des charges). */
export const mainNav: NavItem[] = [
  { key: "about", href: "/a-propos" },
  { key: "projects", href: "/projets" },
  { key: "trainings", href: "/formations" },
  { key: "news", href: "/actualites" },
  { key: "events", href: "/evenements" },
  { key: "getInvolved", href: "/s-engager" },
  { key: "contact", href: "/contact" },
];

/** Colonnes de liens du footer (§8). */
export const footerNav = {
  navigation: [
    { key: "about", href: "/a-propos" },
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
    { key: "newsletter", href: "/#newsletter" },
  ],
  legal: [
    { key: "legalNotice", href: "/mentions-legales" },
    { key: "privacy", href: "/confidentialite" },
  ],
} satisfies Record<string, NavItem[]>;

/** Vrai si `href` correspond à la page courante ou à l'une de ses sous-pages. */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
