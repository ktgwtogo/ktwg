"use client";

import { ArrowLeft, ArrowRight, Building2, Check, Send, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { budgetRanges, partnerContributions, partnerInterests, partnerTypes, type PartnershipValues } from "@/lib/validations/forms";
import { cn } from "@/lib/utils";
import { ChoiceGroup, ConsentField, FormResult, Honeypot, keepFieldFocus, SelectField, ServerError, SubmitButton, TextAreaField, TextField } from "./fields";
import { useDeliveryForm } from "./use-delivery-form";

const steps = [
  { title: "Votre organisation", icon: Building2, fields: ["partnerType", "organization", "country", "website"] },
  { title: "Vos coordonnées", icon: UserRound, fields: ["contactName", "contactRole", "email", "phone"] },
  { title: "Votre projet", icon: Sparkles, fields: ["interests", "contributions", "budget", "message", "consent"] },
] as const;

/** Formulaire de partenariat en 3 étapes (validation à chaque étape). */
export function PartnershipForm() {
  const [step, setStep] = useState(0);
  const { form, outcome, onSubmit, reset, pending, serverError, errors } = useDeliveryForm<PartnershipValues>({
    kind: "partnership",
    defaultValues: { country: "", website: "", consent: false, interests: [], contributions: [] },
  });
  const { register, trigger } = form;

  const next = async () => {
    const ok = await trigger(steps[step].fields as unknown as (keyof PartnershipValues)[], { shouldFocus: true });
    if (ok) setStep((s) => s + 1);
  };

  if (outcome)
    return (
      <div className="flex flex-col gap-4">
        <FormResult
          outcome={outcome}
          onReset={() => {
            reset();
            setStep(0);
          }}
          sentTitle="Votre demande de partenariat est bien envoyée !"
        />
        <p className="text-center text-sm text-muted-foreground">
          Vous avez une plaquette ou un document de présentation (PDF) ? Envoyez-le en réponse à notre e-mail ou sur WhatsApp.
        </p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-8">
      <Honeypot registration={register("hp")} />

      {/* Indicateur d'étapes */}
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => (
          <li key={s.title} aria-current={i === step ? "step" : undefined} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-full border-2 transition-colors",
                i < step && "border-ktgw-green-strong bg-ktgw-green-strong text-white",
                i === step && "border-ktgw-red-strong bg-ktgw-red-strong text-white",
                i > step && "border-border text-muted-foreground"
              )}
            >
              {i < step ? <Check aria-hidden className="size-5" /> : <s.icon aria-hidden className="size-5" />}
            </span>
            <span className={cn("text-xs font-semibold sm:text-sm", i === step ? "text-foreground" : "text-muted-foreground")}>
              <span className="sr-only">Étape {i + 1} sur 3 : </span>
              {s.title}
            </span>
          </li>
        ))}
      </ol>

      <div className={cn("flex flex-col gap-5", step !== 0 && "hidden")}>
        <ChoiceGroup legend="Vous êtes" type="radio" required options={partnerTypes} registration={register("partnerType")} error={errors.partnerType} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Nom de l'organisation" required registration={register("organization")} error={errors.organization} />
          <TextField label="Pays" required autoComplete="country-name" registration={register("country")} error={errors.country} />
        </div>
        <TextField label="Site web" type="url" placeholder="https://" registration={register("website")} error={errors.website} />
      </div>

      <div className={cn("grid gap-5 sm:grid-cols-2", step !== 1 && "hidden")}>
        <TextField label="Nom et prénom" required autoComplete="name" registration={register("contactName")} error={errors.contactName} />
        <TextField label="Fonction" autoComplete="organization-title" registration={register("contactRole")} error={errors.contactRole} />
        <TextField label="E-mail" required type="email" autoComplete="email" registration={register("email")} error={errors.email} />
        <TextField label="Téléphone" type="tel" autoComplete="tel" placeholder="+49 …" registration={register("phone")} error={errors.phone} />
      </div>

      <div className={cn("flex flex-col gap-6", step !== 2 && "hidden")}>
        <ChoiceGroup legend="Domaines d'intérêt" required options={partnerInterests} registration={register("interests")} error={errors.interests as never} />
        <ChoiceGroup legend="Type d'apport envisagé" required options={partnerContributions} registration={register("contributions")} error={errors.contributions as never} />
        <SelectField label="Budget indicatif" required options={budgetRanges} registration={register("budget")} error={errors.budget} />
        <TextAreaField label="Présentez votre projet de partenariat" required registration={register("message")} error={errors.message} />
        <ConsentField registration={register("consent")} error={errors.consent} />
        <ServerError message={serverError} />
      </div>

      <div className="flex flex-col-reverse justify-between gap-3 border-t pt-6 sm:flex-row">
        {step > 0 ? (
          <Button type="button" variant="outline" size="xl" onMouseDown={keepFieldFocus} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft aria-hidden />
            Retour
          </Button>
        ) : (
          <span />
        )}
        {step < steps.length - 1 ? (
          <Button type="button" size="xl" onMouseDown={keepFieldFocus} onClick={next}>
            Continuer
            <ArrowRight aria-hidden />
          </Button>
        ) : (
          <SubmitButton pending={pending}>
            <Send aria-hidden />
            Envoyer ma demande
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
