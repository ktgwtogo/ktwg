import type { Permission } from "./permissions";

/** Boîtes de réception : demandes envoyées par les formulaires du site, et leur responsable. */
export const inboxes = [
  { id: "contact", table: "contact_messages", label: "Messages de contact", permission: "inbox.manage", title: (r: Row) => `${r.name} — ${r.subject}` },
  { id: "partenariats", table: "partnership_requests", label: "Partenariats", permission: "inbox.manage", title: (r: Row) => `${r.organization} (${r.partner_type})` },
  { id: "benevolat", table: "engagement_applications", label: "Bénévolat et adhésion", permission: "members.manage", title: (r: Row) => `${r.name} — ${r.type}` },
  { id: "formations", table: "training_applications", label: "Candidatures aux formations", permission: "projects.manage", title: (r: Row) => `${r.name} — ${r.track}` },
  { id: "evenements", table: "event_registrations", label: "Inscriptions aux événements", permission: "projects.manage", title: (r: Row) => `${r.name} (${r.seats} place(s))` },
] as const satisfies readonly { id: string; table: string; label: string; permission: Permission; title: (r: Row) => string }[];

type Row = Record<string, unknown>;
export type Inbox = (typeof inboxes)[number];
export const getInbox = (id: string) => inboxes.find((i) => i.id === id);

export const submissionStatuses = [
  { value: "nouveau", label: "Nouveau" },
  { value: "en_cours", label: "En cours" },
  { value: "traite", label: "Traité" },
  { value: "archive", label: "Archivé" },
] as const;

/** Libellés lisibles des colonnes affichées dans le détail d'une demande. */
export const columnLabels: Record<string, string> = {
  name: "Nom",
  email: "E-mail",
  phone: "Téléphone",
  country: "Pays",
  subject: "Sujet",
  message: "Message",
  partner_type: "Type",
  organization: "Organisation",
  website: "Site web",
  contact_name: "Contact",
  contact_role: "Fonction",
  interests: "Intérêts",
  contributions: "Apports",
  budget: "Budget",
  type: "Démarche",
  profile: "Profil",
  skills: "Compétences",
  availability: "Disponibilités",
  age: "Âge",
  city: "Ville",
  level: "Niveau",
  track: "Filière",
  boarding: "Demande d'Internat (filles)",
  gender: "Genre",
  has_bac: "Titulaire du BAC",
  bac_series: "Série du BAC",
  bac_year: "Année d'obtention du BAC",
  diploma_bac: "Copie / Référence du BAC",
  id_card: "Copie pièce d'identité / Acte",
  motivation: "Motivation & Projet professionnel",
  seats: "Places",
  needs: "Besoins",
  locale: "Langue",
};

export const donationMethods = [
  "T-Money",
  "Moov Money (Flooz)",
  "Mobile Money (autre pays)",
  "Cryptomonnaie",
  "Virement",
  "Espèces",
  "Chèque",
  "Carte bancaire",
  "En nature",
] as const;
