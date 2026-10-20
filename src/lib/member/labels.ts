import type { Database } from "@/types/database";

type Enums = Database["public"]["Enums"];

export const membershipStatusLabels: Record<Enums["membership_status"], string> = {
  aucune: "Non adhérent·e",
  en_attente: "Adhésion en cours d'examen",
  validee: "Adhésion validée",
  refusee: "Adhésion non retenue",
};

export const membershipStatusTone: Record<Enums["membership_status"], string> = {
  aucune: "bg-muted text-muted-foreground",
  en_attente: "bg-ktgw-sun/20 text-ktgw-orange",
  validee: "bg-ktgw-green/15 text-ktgw-green-strong",
  refusee: "bg-destructive/10 text-destructive",
};

export const roleLabels: Record<Enums["user_role"], string> = {
  member: "Compte personnel",
  editor: "Éditeur·rice",
  admin: "Administrateur·rice",
  super_admin: "Super administrateur·rice",
};

export const submissionStatusLabels: Record<Enums["submission_status"], string> = {
  nouveau: "Reçue",
  en_cours: "En cours de traitement",
  traite: "Traitée",
  archive: "Archivée",
};
