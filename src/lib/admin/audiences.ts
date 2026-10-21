/** Publics des e-mails groupés. */
export const audiences = [
  { id: "membres", label: "Tous les membres validés" },
  { id: "membres:adherent", label: "Adhérent·es" },
  { id: "membres:membre", label: "Membres actif·ves" },
  { id: "membres:donateur", label: "Donateur·rices" },
  { id: "bureau", label: "Le bureau (comptes de l'équipe)" },
  { id: "newsletter", label: "Abonné·es à la newsletter" },
  { id: "comptes", label: "Tous les comptes inscrits sur le site" },
] as const;

export type AudienceId = (typeof audiences)[number]["id"];
export const audienceLabel = (id: string) => audiences.find((a) => a.id === id)?.label ?? id;
