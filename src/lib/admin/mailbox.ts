/** Natures des envois déposés dans l'espace des membres (table documents). */
export const documentCategories = [
  { value: "document", label: "Document" },
  { value: "statuts", label: "Statuts" },
  { value: "reglement", label: "Règlement intérieur" },
  { value: "convocation", label: "Convocation" },
  { value: "compte-rendu", label: "Compte rendu / procès-verbal" },
  { value: "annonce", label: "Annonce" },
  { value: "evenement", label: "Événement" },
  { value: "publicite", label: "Publicité / promotion" },
  { value: "information", label: "Information" },
] as const;

export type DocumentCategory = (typeof documentCategories)[number]["value"];
export const categoryLabel = (v: string) => documentCategories.find((c) => c.value === v)?.label ?? "Document";

/** Destinataires possibles d'un envoi. */
export const documentAudiences = [
  { value: "members", label: "Tous les membres validés" },
  { value: "accounts", label: "Tous les comptes inscrits sur le site" },
  { value: "user", label: "Une seule personne" },
] as const;

export const audienceText = (audience: string) =>
  audience === "user" ? "Personnel" : audience === "accounts" ? "Tous les inscrits" : "Tous les membres";
