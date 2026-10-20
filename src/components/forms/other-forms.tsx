"use client";

import { Heart, Mail, Send, Ticket } from "lucide-react";
import { useState } from "react";
import {
  availabilityOptions,
  donationDeclarationSchema,
  engagementSchema,
  engagementTypes,
  eventRegistrationSchema,
  newsletterSchema,
  schoolLevels,
  trainingApplicationSchema,
  trainingTracks,
  type DonationDeclarationValues,
  type EngagementValues,
  type EventRegistrationValues,
  type NewsletterValues,
  type TrainingApplicationValues,
} from "@/lib/validations/forms";
import { ChoiceGroup, ConsentField, DeliveryPanel, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./fields";
import { useDeliveryForm } from "./use-delivery-form";

function Result({ children }: { children: React.ReactNode }) {
  return <div id="form-result">{children}</div>;
}

/** Inscription à un événement. */
export function EventRegistrationForm({ eventTitle, full }: { eventTitle: string; full?: boolean }) {
  const { form, delivery, onSubmit, reset, errors } = useDeliveryForm<EventRegistrationValues>({
    schema: eventRegistrationSchema,
    defaultValues: { seats: "1", consent: false },
    subject: () => `${full ? "Liste d'attente" : "Inscription"} : ${eventTitle}`,
    toFields: (v) => ({
      Événement: eventTitle,
      Nom: v.name,
      "E-mail": v.email,
      Téléphone: v.phone,
      Organisation: v.organization,
      "Nombre de places": v.seats,
      "Besoins particuliers": v.needs,
    }),
  });
  const { register } = form;
  if (delivery)
    return (
      <Result>
        <DeliveryPanel delivery={delivery} onReset={reset} title="Votre inscription est prête !" />
      </Result>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
      <Honeypot registration={register("website")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom complet" required autoComplete="name" registration={register("name")} error={errors.name} />
        <TextField label="E-mail" required type="email" autoComplete="email" registration={register("email")} error={errors.email} />
        <TextField label="Téléphone" required type="tel" autoComplete="tel" placeholder="+228 …" registration={register("phone")} error={errors.phone} />
        <TextField label="Organisation" autoComplete="organization" registration={register("organization")} error={errors.organization} />
      </div>
      <TextField label="Nombre de places" required type="number" min={1} max={10} inputMode="numeric" registration={register("seats")} error={errors.seats} className="sm:max-w-48" />
      <TextAreaField label="Besoins particuliers (accessibilité, régime…)" rows={3} registration={register("needs")} error={errors.needs} />
      <ConsentField registration={register("consent")} error={errors.consent} />
      <div>
        <SubmitButton>
          <Ticket aria-hidden />
          {full ? "Rejoindre la liste d'attente" : "Je m'inscris"}
        </SubmitButton>
      </div>
    </form>
  );
}

/** Bénévolat ou adhésion. */
export function EngagementForm({ defaultType = "Bénévolat" }: { defaultType?: EngagementValues["type"] }) {
  const { form, delivery, onSubmit, reset, errors } = useDeliveryForm<EngagementValues>({
    schema: engagementSchema,
    defaultValues: { type: defaultType, consent: false, availability: [] },
    subject: (v) => `${v.type} : ${v.name}`,
    toFields: (v) => ({
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
  });
  const { register } = form;
  if (delivery)
    return (
      <Result>
        <DeliveryPanel delivery={delivery} onReset={reset} title="Merci pour votre engagement !" />
      </Result>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
      <Honeypot registration={register("website")} />
      <ChoiceGroup legend="Je souhaite" type="radio" required options={engagementTypes} registration={register("type")} error={errors.type} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom complet" required autoComplete="name" registration={register("name")} error={errors.name} />
        <TextField label="E-mail" required type="email" autoComplete="email" registration={register("email")} error={errors.email} />
        <TextField label="Téléphone" type="tel" autoComplete="tel" registration={register("phone")} error={errors.phone} />
        <TextField label="Pays" required autoComplete="country-name" registration={register("country")} error={errors.country} />
      </div>
      <TextField label="Profil (métier, études…)" required registration={register("profile")} error={errors.profile} />
      <TextAreaField label="Compétences que vous souhaitez partager" rows={3} registration={register("skills")} error={errors.skills} />
      <ChoiceGroup legend="Disponibilités" required options={availabilityOptions} registration={register("availability")} error={errors.availability as never} />
      <TextAreaField label="Un mot pour nous ?" rows={3} registration={register("message")} error={errors.message} />
      <ConsentField registration={register("consent")} error={errors.consent} />
      <div>
        <SubmitButton>
          <Send aria-hidden />
          Envoyer ma candidature
        </SubmitButton>
      </div>
    </form>
  );
}

/** Candidature à une formation (apprenant·e). */
export function TrainingApplicationForm() {
  const { form, delivery, onSubmit, reset, errors } = useDeliveryForm<TrainingApplicationValues>({
    schema: trainingApplicationSchema,
    defaultValues: { consent: false, boarding: false, email: "" },
    subject: (v) => `Candidature formation (${v.track}) : ${v.name}`,
    toFields: (v) => ({
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
  });
  const { register } = form;
  if (delivery)
    return (
      <Result>
        <DeliveryPanel delivery={delivery} onReset={reset} title="Votre candidature est prête !" />
      </Result>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
      <Honeypot registration={register("website")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom et prénom" required autoComplete="name" registration={register("name")} error={errors.name} />
        <TextField label="Âge" required type="number" inputMode="numeric" min={14} max={40} registration={register("age")} error={errors.age} />
        <TextField label="Ville" required autoComplete="address-level2" registration={register("city")} error={errors.city} />
        <TextField label="Téléphone" required type="tel" autoComplete="tel" placeholder="+228 …" registration={register("phone")} error={errors.phone} />
        <TextField label="E-mail (facultatif)" type="email" autoComplete="email" registration={register("email")} error={errors.email} />
        <SelectField label="Niveau scolaire" required options={schoolLevels} registration={register("level")} error={errors.level} />
      </div>
      <SelectField label="Filière souhaitée" required options={trainingTracks} registration={register("track")} error={errors.track} />
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-card p-4 text-sm has-checked:border-ktgw-green has-checked:bg-ktgw-green/10">
        <input type="checkbox" className="size-4 accent-[var(--ktgw-green-strong)]" {...register("boarding")} />
        Je suis une jeune fille et j&apos;aurais besoin d&apos;une place à l&apos;internat
      </label>
      <TextAreaField label="Pourquoi souhaitez-vous suivre cette formation ?" rows={4} registration={register("motivation")} error={errors.motivation} />
      <ConsentField registration={register("consent")} error={errors.consent} />
      <div>
        <SubmitButton>
          <Send aria-hidden />
          Préparer ma candidature
        </SubmitButton>
      </div>
    </form>
  );
}

const presetAmounts = ["5000", "10000", "25000", "50000"];

/** Déclaration de don (Mobile Money / virement) avec montants prédéfinis. */
export function DonationDeclarationForm({ project }: { project?: string }) {
  const { form, delivery, onSubmit, reset, errors } = useDeliveryForm<DonationDeclarationValues>({
    schema: donationDeclarationSchema,
    defaultValues: { amount: "10000", frequency: "Ponctuel", consent: false, project: project ?? "" },
    subject: (v) => `Déclaration de don : ${Number(v.amount).toLocaleString("fr-FR")} FCFA`,
    toFields: (v) => ({
      Donateur: v.name,
      "E-mail": v.email,
      Téléphone: v.phone,
      "Montant (FCFA)": Number(v.amount).toLocaleString("fr-FR"),
      Fréquence: v.frequency,
      "Moyen de paiement": v.method,
      "Projet soutenu": v.project,
      "Référence de transaction": v.reference,
    }),
  });
  const { register, setValue, watch } = form;
  const amount = watch("amount");
  const [custom, setCustom] = useState(false);

  if (delivery)
    return (
      <Result>
        <DeliveryPanel delivery={delivery} onReset={reset} title="Merci pour votre générosité !" />
      </Result>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-6">
      <Honeypot registration={register("website")} />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1.5 text-sm font-semibold">Montant du don (FCFA)</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {presetAmounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setCustom(false);
                setValue("amount", a, { shouldValidate: true });
              }}
              aria-pressed={!custom && amount === a}
              className="h-12 rounded-xl border-2 border-input bg-card font-heading font-bold transition-colors hover:border-ktgw-red aria-pressed:border-ktgw-red-strong aria-pressed:bg-ktgw-red-strong aria-pressed:text-white"
            >
              {Number(a).toLocaleString("fr-FR")}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setCustom(true);
              setValue("amount", "");
            }}
            aria-pressed={custom}
            className="col-span-2 h-12 rounded-xl border-2 border-input bg-card font-semibold transition-colors hover:border-ktgw-red aria-pressed:border-ktgw-red-strong aria-pressed:bg-accent sm:col-span-1"
          >
            Autre montant
          </button>
        </div>
        <TextField
          label="Montant en FCFA"
          required
          inputMode="numeric"
          className={custom ? "" : "sr-only"}
          registration={register("amount")}
          error={errors.amount}
        />
      </fieldset>
      <ChoiceGroup legend="Fréquence" type="radio" required options={["Ponctuel", "Mensuel"]} registration={register("frequency")} error={errors.frequency} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom complet" required autoComplete="name" registration={register("name")} error={errors.name} />
        <TextField label="E-mail" required type="email" autoComplete="email" registration={register("email")} error={errors.email} />
        <TextField label="Téléphone" type="tel" autoComplete="tel" registration={register("phone")} error={errors.phone} />
        <SelectField
          label="Moyen de paiement utilisé"
          required
          options={["T-Money", "Moov Money (Flooz)", "Virement", "Espèces"]}
          registration={register("method")}
          error={errors.method}
        />
        <TextField label="Projet soutenu (facultatif)" registration={register("project")} error={errors.project} />
        <TextField label="Référence de la transaction" hint="Indiquée dans le SMS de confirmation" registration={register("reference")} error={errors.reference} />
      </div>
      <ConsentField registration={register("consent")} error={errors.consent} />
      <div>
        <SubmitButton>
          <Heart aria-hidden className="fill-current" />
          Déclarer mon don
        </SubmitButton>
      </div>
    </form>
  );
}

/** Inscription à la newsletter (double opt-in automatisé en Phase 6). */
export function NewsletterForm({ inverted = false }: { inverted?: boolean }) {
  const { form, delivery, onSubmit, reset, errors } = useDeliveryForm<NewsletterValues>({
    schema: newsletterSchema,
    defaultValues: { consent: false },
    subject: () => "Inscription à la newsletter",
    toFields: (v) => ({ "E-mail": v.email }),
  });
  const { register } = form;
  if (delivery)
    return (
      <Result>
        <DeliveryPanel delivery={delivery} onReset={reset} title="Plus qu'un clic pour vous inscrire !" />
      </Result>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="relative flex w-full flex-col gap-4">
      <Honeypot registration={register("website")} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <TextField
          label="Votre adresse e-mail"
          type="email"
          autoComplete="email"
          placeholder="prenom.nom@exemple.com"
          registration={register("email")}
          error={errors.email}
          className={inverted ? "flex-1 [&_label]:sr-only [&_p[role=alert]]:text-white" : "flex-1 [&_label]:sr-only"}
        />
        <SubmitButton>
          <Mail aria-hidden />
          Je m&apos;abonne
        </SubmitButton>
      </div>
      <div className={inverted ? "[&_label]:text-white/80 [&_a]:text-white [&_p[role=alert]]:text-white" : undefined}>
        <ConsentField registration={register("consent")} error={errors.consent} />
      </div>
    </form>
  );
}
