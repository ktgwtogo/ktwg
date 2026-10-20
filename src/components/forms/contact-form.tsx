"use client";

import { Send } from "lucide-react";
import { contactSubjects, type ContactValues } from "@/lib/validations/forms";
import { ConsentField, FormResult, Honeypot, SelectField, ServerError, SubmitButton, TextAreaField, TextField } from "./fields";
import { useDeliveryForm } from "./use-delivery-form";

export function ContactForm({ defaultSubject }: { defaultSubject?: ContactValues["subject"] }) {
  const { form, outcome, onSubmit, reset, pending, serverError, errors } = useDeliveryForm<ContactValues>({
    kind: "contact",
    defaultValues: { country: "Togo", subject: defaultSubject, consent: false },
  });
  const { register } = form;

  if (outcome) return <FormResult outcome={outcome} onReset={reset} sentTitle="Votre message est bien envoyé !" />;

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
      <ServerError message={serverError} />
      <div>
        <SubmitButton pending={pending}>
          <Send aria-hidden />
          Envoyer mon message
        </SubmitButton>
      </div>
    </form>
  );
}
