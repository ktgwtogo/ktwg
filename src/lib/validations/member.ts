import { z } from "zod";

/** Schémas de l'espace membre : compte, profil et demande d'adhésion. */

const email = z.string().trim().min(1, "Indiquez votre adresse e-mail.").pipe(z.email("Cette adresse e-mail n'est pas valide."));
const password = z.string().min(8, "8 caractères minimum.").max(72, "72 caractères maximum.");
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ().-]{8,20}$/, "Numéro invalide : indiquez l'indicatif, par exemple +228 90 00 00 00.");
const optional = (max: number) => z.string().trim().max(max, `${max} caractères maximum.`).optional();

export const signInSchema = z.object({ email, password: z.string().min(1, "Indiquez votre mot de passe.") });
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum).").max(120),
    email,
    password,
    confirm: z.string(),
    consent: z.boolean().refine((v) => v, "Votre accord est nécessaire pour créer un compte."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Les deux mots de passe ne correspondent pas." });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const resetSchema = z.object({ email });
export type ResetValues = z.infer<typeof resetSchema>;

export const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Les deux mots de passe ne correspondent pas." });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export const civilities = ["Mme", "M.", "Autre"] as const;

export const profileSchema = z.object({
  civility: z.enum(civilities, "Choisissez une civilité."),
  firstName: z.string().trim().min(1, "Indiquez votre prénom.").max(80),
  lastName: z.string().trim().min(1, "Indiquez votre nom.").max(80),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Indiquez votre date de naissance.")
    .refine((v) => {
      const age = (Date.now() - new Date(v).getTime()) / 3.15576e10;
      return age >= 14 && age <= 110;
    }, "Date de naissance invalide (14 ans minimum)."),
  nationality: z.string().trim().min(2, "Indiquez votre nationalité.").max(80),
  profession: z.string().trim().min(2, "Indiquez votre profession ou vos études.").max(120),
  organization: optional(160),
  phone,
  whatsapp: z.union([z.literal(""), phone]).optional(),
  address: z.string().trim().min(3, "Indiquez votre adresse.").max(200),
  city: z.string().trim().min(2, "Indiquez votre ville.").max(80),
  country: z.string().trim().min(2, "Indiquez votre pays.").max(80),
  bio: z.string().trim().min(30, "Présentez-vous en quelques phrases (30 caractères minimum).").max(2000, "2 000 caractères maximum."),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const membershipTypes = [
  { value: "adherent", label: "Adhérent·e", description: "Je soutiens le projet associatif et participe à la vie de l'association (cotisation annuelle)." },
  { value: "membre", label: "Membre actif·ve", description: "Je m'engage régulièrement : actions de terrain, projets, bénévolat." },
  { value: "donateur", label: "Donateur·rice", description: "Je soutiens financièrement les projets de l'association." },
] as const;
export const membershipTypeLabels: Record<(typeof membershipTypes)[number]["value"], string> = {
  adherent: "Adhérent·e",
  membre: "Membre actif·ve",
  donateur: "Donateur·rice",
};

export const memberInterests = [
  "Formation professionnelle",
  "Internat des jeunes filles",
  "Femmes solaires",
  "Environnement",
  "Clubs d'allemand",
  "Insertion / entrepreneuriat",
  "Collecte de fonds",
  "Communication",
] as const;

export const membershipSchema = z.object({
  type: z.enum(["adherent", "membre", "donateur"], "Choisissez votre type d'adhésion."),
  motivation: z.string().trim().min(20, "Expliquez votre intention en quelques lignes (20 caractères minimum).").max(3000),
  interests: z.preprocess((v) => (Array.isArray(v) ? v : v ? [v] : []), z.array(z.string()).min(1, "Choisissez au moins un domaine.")),
  skills: optional(1000),
  availability: optional(300),
  contribution: optional(500),
  referral: optional(200),
  statutes: z.boolean().refine((v) => v, "Vous devez accepter les statuts et le règlement de l'association."),
});
export type MembershipValues = z.infer<typeof membershipSchema>;

/** Champs du profil obligatoires avant une demande d'adhésion. */
export const requiredProfileFields = [
  ["civility", "Civilité"],
  ["first_name", "Prénom"],
  ["last_name", "Nom"],
  ["birth_date", "Date de naissance"],
  ["nationality", "Nationalité"],
  ["profession", "Profession"],
  ["phone", "Téléphone"],
  ["address", "Adresse"],
  ["city", "Ville"],
  ["country", "Pays"],
  ["bio", "Présentation (bio)"],
  ["photo_path", "Photo"],
] as const;

export function missingProfileFields(profile: Partial<Record<(typeof requiredProfileFields)[number][0], string | null>>) {
  return requiredProfileFields.filter(([key]) => !profile[key]).map(([, label]) => label);
}
