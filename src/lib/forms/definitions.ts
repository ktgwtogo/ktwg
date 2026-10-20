import type { z } from "zod";
import {
  contactSchema,
  donationDeclarationSchema,
  engagementSchema,
  eventRegistrationSchema,
  newsletterSchema,
  partnershipSchema,
  trainingApplicationSchema,
  type ContactValues,
  type DonationDeclarationValues,
  type EngagementValues,
  type EventRegistrationValues,
  type NewsletterValues,
  type PartnershipValues,
  type TrainingApplicationValues,
} from "@/lib/validations/forms";

/**
 * Définition de chaque formulaire public, partagée entre le navigateur et le serveur :
 * schéma de validation, table Supabase, objet du message et champs lisibles
 * (e-mail à l'équipe, ou envoi de secours par WhatsApp / e-mail).
 */

/** Contexte fourni par la page (ex. l'événement concerné). */
export type FormContext = { eventTitle?: string; eventSlug?: string; full?: boolean };

export type FormDefinition<T> = {
  schema: z.ZodType<T>;
  table: string;
  honeypot: string;
  /** Libellé court de la demande, repris dans l'accusé de réception. */
  label: string;
  subject: (values: T, ctx: FormContext) => string;
  fields: (values: T, ctx: FormContext) => Record<string, unknown>;
  /** Colonnes de la ligne insérée (hors event_id, locale, user_id, ajoutés par le serveur). */
  row: (values: T) => Record<string, unknown>;
};

const define = <T,>(d: FormDefinition<T>) => d;
const orNull = (v: string | undefined) => (v ? v : null);

export const formDefinitions = {
  contact: define<ContactValues>({
    schema: contactSchema,
    table: "contact_messages",
    honeypot: "website",
    label: "votre message",
    subject: (v) => `Contact : ${v.subject}`,
    fields: (v) => ({ Nom: v.name, "E-mail": v.email, Téléphone: v.phone, Pays: v.country, Sujet: v.subject, Message: v.message }),
    row: (v) => ({ name: v.name, email: v.email, phone: orNull(v.phone), country: v.country, subject: v.subject, message: v.message }),
  }),

  partnership: define<PartnershipValues>({
    schema: partnershipSchema,
    table: "partnership_requests",
    honeypot: "hp",
    label: "votre demande de partenariat",
    subject: (v) => `Demande de partenariat : ${v.organization}`,
    fields: (v) => ({
      "Type de partenaire": v.partnerType,
      Organisation: v.organization,
      Pays: v.country,
      "Site web": v.website,
      Contact: v.contactName,
      Fonction: v.contactRole,
      "E-mail": v.email,
      Téléphone: v.phone,
      "Domaines d'intérêt": v.interests,
      "Type d'apport": v.contributions,
      "Budget indicatif": v.budget,
      Message: v.message,
    }),
    row: (v) => ({
      partner_type: v.partnerType,
      organization: v.organization,
      country: v.country,
      website: orNull(v.website),
      contact_name: v.contactName,
      contact_role: orNull(v.contactRole),
      email: v.email,
      phone: orNull(v.phone),
      interests: v.interests,
      contributions: v.contributions,
      budget: v.budget,
      message: v.message,
    }),
  }),

  event: define<EventRegistrationValues>({
    schema: eventRegistrationSchema,
    table: "event_registrations",
    honeypot: "website",
    label: "votre inscription",
    subject: (_, ctx) => `${ctx.full ? "Liste d'attente" : "Inscription"} : ${ctx.eventTitle ?? "événement"}`,
    fields: (v, ctx) => ({
      Événement: ctx.eventTitle,
      Nom: v.name,
      "E-mail": v.email,
      Téléphone: v.phone,
      Organisation: v.organization,
      "Nombre de places": v.seats,
      "Besoins particuliers": v.needs,
    }),
    row: (v) => ({
      name: v.name,
      email: v.email,
      phone: v.phone,
      organization: orNull(v.organization),
      seats: Number(v.seats),
      needs: orNull(v.needs),
    }),
  }),

  engagement: define<EngagementValues>({
    schema: engagementSchema,
    table: "engagement_applications",
    honeypot: "website",
    label: "votre candidature",
    subject: (v) => `${v.type} : ${v.name}`,
    fields: (v) => ({
      Démarche: v.type,
      Nom: v.name,
      "E-mail": v.email,
      Téléphone: v.phone,
      Pays: v.country,
      Profil: v.profile,
      Compétences: v.skills,
      Disponibilités: v.availability,
      Message: v.message,
    }),
    row: (v) => ({
      type: v.type,
      name: v.name,
      email: v.email,
      phone: orNull(v.phone),
      country: v.country,
      profile: v.profile,
      skills: orNull(v.skills),
      availability: v.availability,
      message: orNull(v.message),
    }),
  }),

  training: define<TrainingApplicationValues>({
    schema: trainingApplicationSchema,
    table: "training_applications",
    honeypot: "website",
    label: "votre candidature",
    subject: (v) => `Candidature formation (${v.track}) : ${v.name}`,
    fields: (v) => ({
      Nom: v.name,
      Âge: v.age,
      Ville: v.city,
      Téléphone: v.phone,
      "E-mail": v.email,
      "Niveau scolaire": v.level,
      "Filière souhaitée": v.track,
      "Besoin de l'internat": v.boarding,
      Motivation: v.motivation,
    }),
    row: (v) => ({
      name: v.name,
      age: Number(v.age),
      city: v.city,
      phone: v.phone,
      email: orNull(v.email),
      level: v.level,
      track: v.track,
      boarding: Boolean(v.boarding),
      motivation: orNull(v.motivation),
    }),
  }),

  donation: define<DonationDeclarationValues>({
    schema: donationDeclarationSchema,
    table: "donation_declarations",
    honeypot: "website",
    label: "votre déclaration de don",
    subject: (v) => `Déclaration de don : ${Number(v.amount).toLocaleString("fr-FR")} FCFA`,
    fields: (v) => ({
      Donateur: v.name,
      "E-mail": v.email,
      Téléphone: v.phone,
      "Montant (FCFA)": Number(v.amount).toLocaleString("fr-FR"),
      Fréquence: v.frequency,
      "Moyen de paiement": v.method,
      "Projet soutenu": v.project,
      "Référence de transaction": v.reference,
    }),
    row: (v) => ({
      name: v.name,
      email: v.email,
      phone: orNull(v.phone),
      amount_fcfa: Number(v.amount),
      method: v.method,
      frequency: v.frequency,
      project: orNull(v.project),
      reference: orNull(v.reference),
    }),
  }),

  newsletter: define<NewsletterValues>({
    schema: newsletterSchema,
    table: "newsletter_subscribers",
    honeypot: "website",
    label: "votre inscription à la newsletter",
    subject: () => "Inscription à la newsletter",
    fields: (v) => ({ "E-mail": v.email }),
    row: (v) => ({ email: v.email.toLowerCase() }),
  }),
};

export type FormKind = keyof typeof formDefinitions;
