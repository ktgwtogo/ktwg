import { z } from "zod";

/**
 * Schémas de validation des formulaires publics.
 * Partagés entre le navigateur (react-hook-form) et le serveur (Server Actions, Phase 6).
 */

const name = z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum).").max(120, "120 caractères maximum.");
const email = z.string().trim().min(1, "Indiquez votre adresse e-mail.").pipe(z.email("Cette adresse e-mail n'est pas valide."));
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ().-]{8,20}$/, "Numéro invalide : indiquez l'indicatif, par exemple +228 90 00 00 00.");
const optionalPhone = z.union([z.literal(""), phone]);
const country = z.string().trim().min(2, "Indiquez votre pays.").max(80);
const consent = z.boolean().refine((v) => v, "Votre accord est nécessaire pour traiter votre demande.");
/** Champ piège anti-robots : doit rester vide. */
const honeypot = z.string().max(0).optional();
/** Cases à cocher multiples : react-hook-form renvoie un tableau, une chaîne ou false. */
const multi = (message: string) =>
  z.preprocess((v) => (Array.isArray(v) ? v : v ? [v] : []), z.array(z.string()).min(1, message));

export const contactSubjects = [
  "Information générale",
  "Partenariat",
  "Formation / candidature",
  "Don",
  "Bénévolat / adhésion",
  "Presse / médias",
  "Autre",
] as const;

export const contactSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  country,
  subject: z.enum(contactSubjects, "Choisissez un sujet."),
  message: z.string().trim().min(20, "Votre message doit contenir au moins 20 caractères.").max(4000),
  consent,
  website: honeypot,
});
export type ContactValues = z.infer<typeof contactSchema>;

export const partnerTypes = ["ONG", "Entreprise", "Institution", "Fondation", "Ambassade", "Particulier"] as const;
export const partnerInterests = [
  "Formation professionnelle",
  "Internat des jeunes filles",
  "Femmes solaires",
  "Environnement",
  "Clubs d'allemand",
  "Insertion / entrepreneuriat",
] as const;
export const partnerContributions = ["Financier", "Technique", "Matériel", "Humain", "Mécénat de compétences"] as const;
export const budgetRanges = [
  "Moins de 1 000 €",
  "1 000 – 5 000 €",
  "5 000 – 20 000 €",
  "Plus de 20 000 €",
  "À définir ensemble",
] as const;

export const partnershipSchema = z.object({
  partnerType: z.enum(partnerTypes, "Choisissez un type de partenaire."),
  organization: z.string().trim().min(2, "Indiquez le nom de votre organisation.").max(160),
  country,
  website: z.union([z.literal(""), z.url("Adresse invalide (ex. https://exemple.org).")]),
  contactName: name,
  contactRole: z.string().trim().max(120).optional(),
  email,
  phone: optionalPhone,
  interests: multi("Choisissez au moins un domaine d'intérêt."),
  contributions: multi("Choisissez au moins un type d'apport."),
  budget: z.enum(budgetRanges, "Choisissez une fourchette indicative."),
  message: z.string().trim().min(20, "Présentez votre projet en quelques lignes (20 caractères minimum).").max(4000),
  consent,
  hp: honeypot,
});
export type PartnershipValues = z.infer<typeof partnershipSchema>;

export const eventRegistrationSchema = z.object({
  name,
  email,
  phone,
  organization: z.string().trim().max(160).optional(),
  seats: z.string().regex(/^(10|[1-9])$/, "Entre 1 et 10 places."),
  needs: z.string().trim().max(1000).optional(),
  consent,
  website: honeypot,
});
export type EventRegistrationValues = z.infer<typeof eventRegistrationSchema>;

export const engagementTypes = ["Bénévolat", "Adhésion"] as const;
export const availabilityOptions = ["Quelques heures par mois", "Ponctuellement (événements)", "Plusieurs jours par mois", "À distance"] as const;

export const engagementSchema = z.object({
  type: z.enum(engagementTypes, "Choisissez bénévolat ou adhésion."),
  name,
  email,
  phone: optionalPhone,
  country,
  profile: z.string().trim().min(2, "Présentez-vous en quelques mots (métier, études…).").max(200),
  skills: z.string().trim().max(1000).optional(),
  availability: multi("Indiquez au moins une disponibilité."),
  message: z.string().trim().max(2000).optional(),
  consent,
  website: honeypot,
});
export type EngagementValues = z.infer<typeof engagementSchema>;

export const schoolLevels = ["Primaire", "Collège (BEPC)", "Lycée", "Baccalauréat", "Études supérieures", "Autre"] as const;
export const trainingTracks = [
  "Coutellerie",
  "Comptabilité",
  "Mécanique",
  "Énergies renouvelables",
  "Informatique",
  "Je ne sais pas encore",
] as const;

export const trainingApplicationSchema = z.object({
  name,
  age: z.string().regex(/^\d{2}$/, "Indiquez votre âge en chiffres.").refine((v) => +v >= 14 && +v <= 40, "Âge accepté : de 14 à 40 ans."),
  city: z.string().trim().min(2, "Indiquez votre ville.").max(80),
  phone,
  email: z.union([z.literal(""), z.email("Cette adresse e-mail n'est pas valide.")]),
  level: z.enum(schoolLevels, "Choisissez votre niveau scolaire."),
  track: z.enum(trainingTracks, "Choisissez une filière."),
  boarding: z.boolean().optional(),
  motivation: z.string().trim().max(2000).optional(),
  consent,
  website: honeypot,
});
export type TrainingApplicationValues = z.infer<typeof trainingApplicationSchema>;

export const donationDeclarationSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  amount: z.string().regex(/^\d{3,9}$/, "Indiquez le montant en FCFA (chiffres uniquement)."),
  method: z.enum(["T-Money", "Moov Money (Flooz)", "Virement", "Espèces"], "Choisissez le moyen de paiement."),
  frequency: z.enum(["Ponctuel", "Mensuel"], "Choisissez la fréquence."),
  project: z.string().trim().max(120).optional(),
  reference: z.string().trim().max(80).optional(),
  consent,
  website: honeypot,
});
export type DonationDeclarationValues = z.infer<typeof donationDeclarationSchema>;

export const donationInKindSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  items: z.string().trim().min(5, "Décrivez ce que vous souhaitez donner.").max(2000),
  estimatedValue: z.union([z.literal(""), z.string().regex(/^\d{1,9}$/, "Valeur en FCFA (chiffres uniquement).")]).optional(),
  delivery: z.enum(["Je dépose au siège", "À récupérer chez moi", "Envoi / transport"], "Choisissez le mode de remise."),
  project: z.string().trim().max(120).optional(),
  consent,
  website: honeypot,
});
export type DonationInKindValues = z.infer<typeof donationInKindSchema>;

export const newsletterSchema = z.object({
  email,
  consent,
  website: honeypot,
});
export type NewsletterValues = z.infer<typeof newsletterSchema>;
