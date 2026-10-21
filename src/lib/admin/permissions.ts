/**
 * Catalogue des permissions attribuables à un poste du bureau.
 * La présidence (rôles admin et super_admin) les possède toutes, en plus des
 * droits qui lui sont réservés : postes, comptes, validations, journal.
 */
export const permissionGroups = [
  {
    label: "Général",
    items: [
      { id: "dashboard.view", label: "Voir le tableau de bord et les statistiques" },
      { id: "reports.view", label: "Lire les rapports d'activité validés" },
      { id: "reports.write", label: "Rédiger et soumettre des rapports" },
    ],
  },
  {
    label: "Membres",
    items: [
      { id: "members.view", label: "Consulter le fichier des membres" },
      { id: "members.manage", label: "Traiter les adhésions et le bénévolat" },
      { id: "documents.manage", label: "Préparer les documents officiels" },
      { id: "inbox.manage", label: "Traiter les messages et demandes de partenariat" },
    ],
  },
  {
    label: "Finances",
    items: [{ id: "donations.manage", label: "Gérer les dons et cotisations" }],
  },
  {
    label: "Site et communication",
    items: [
      { id: "content.manage", label: "Modifier les actualités, annonces, galerie, partenaires" },
      { id: "pages.manage", label: "Modifier les pages, menus et textes du site" },
      { id: "newsletter.manage", label: "Préparer la newsletter et les e-mails groupés" },
      { id: "projects.manage", label: "Gérer projets, formations, événements et inscriptions" },
    ],
  },
] as const;

export type Permission = (typeof permissionGroups)[number]["items"][number]["id"];
export const allPermissions = permissionGroups.flatMap((g) => g.items.map((i) => i.id)) as Permission[];

/** Rôles de la présidence : tous les droits, et seuls à valider les publications. */
export const isPresidency = (role: string | null | undefined) => role === "admin" || role === "super_admin";

/** Le profil a-t-il ce droit ? (mêmes règles que la fonction SQL has_permission) */
export function can(profile: { role: string; is_active?: boolean }, permissions: readonly string[], permission: Permission) {
  if (profile.is_active === false) return false;
  return isPresidency(profile.role) || permissions.includes(permission);
}
