"use client";

import { Send } from "lucide-react";
import { contactSchema, contactSubjects, type ContactValues } from "@/lib/validations/forms";
import { ConsentField, DeliveryPanel, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./fields";
import { useDeliveryForm } from "./use-delivery-form";

export function ContactForm({ defaultSubject }: { defaultSubject?: ContactValues["subject"] }) {
  const { form, delivery, onSubmit, reset, errors } = useDeliveryForm<ContactValues>({
    schema: contactSchema,
    defaultValues: { country: "Togo", subject: defaultSubject, consent: false },
    subject: (v) => `Contact : ${v.subject}`,
    toFields: (v) => ({ Nom: v.name, "E-mail": v.email, Téléphone: v.phone, Pays: v.country, Sujet: v.subject, Message: v.message }),
  });
  const { register } = form;

  if (delivery)
    return (
      <div id="form-result">
        <DeliveryPanel delivery={delivery} onReset={reset} title="Votre message est prêt !" />
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
      <Honeypot registration={register("website")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nom complet" required autoComplete="name" registration={register("name")} error={errors.name} />
        <TextField label="E-mail" required type="email" autoComplete="email" registration={register("email")} error={errors.email} />
        <TextField
          label="Téléphone"
          type="tel"
          autoComplete="tel"
          placeholder="+228 90 00 00 00"
          hint="Avec l'indicatif international"
          registration={register("phone")}
          error={errors.phone}
        />
        <TextField label="Pays" required autoComplete="country-name" registration={register("country")} error={errors.country} />
      </div>
      <SelectField label="Sujet" required options={contactSubjects} registration={register("subject")} error={errors.subject} />
      <TextAreaField label="Votre message" required rows={6} registration={register("message")} error={errors.message} />
      <ConsentField registration={register("consent")} error={errors.consent} />
      <div>
        <SubmitButton>
          <Send aria-hidden />
          Préparer l&apos;envoi
        </SubmitButton>
      </div>
    </form>
  );
}
