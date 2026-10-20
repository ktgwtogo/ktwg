"use client";

import { Send } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { ChoiceGroup, ServerError, SubmitButton, TextAreaField, TextField } from "@/components/forms/fields";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { submitMembership } from "@/lib/member/actions";
import { cn } from "@/lib/utils";
import { memberInterests, membershipSchema, membershipTypes, type MembershipValues } from "@/lib/validations/member";

/** Demande d'adhésion : type d'adhésion, intention, engagement. */
export function MembershipForm() {
  const form = useForm<MembershipValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: { interests: [], statutes: false },
    mode: "onTouched",
  });
  const { register, formState } = form;
  const errors = formState.errors;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = form.handleSubmit((values) => {
    setError(null);
    startTransition(async () => {
      const result = await submitMembership(values);
      if (!result.ok) setError(result.error);
      // En cas de succès, la page est revalidée et affiche la demande en attente.
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3" aria-describedby={errors.type ? "type-error" : undefined}>
        <legend className="mb-2 text-lg font-bold">
          Je souhaite devenir<span aria-hidden className="ml-0.5 text-ktgw-red">*</span>
        </legend>
        <div className="grid gap-3 md:grid-cols-3">
          {membershipTypes.map((t) => (
            <label
              key={t.value}
              className={cn(
                "flex cursor-pointer flex-col gap-1.5 rounded-2xl border-2 border-input bg-card p-5 transition-colors",
                "has-checked:border-ktgw-green has-checked:bg-ktgw-green/10 has-focus-visible:ring-3 has-focus-visible:ring-ktgw-sun/40"
              )}
            >
              <span className="flex items-center gap-2 font-bold">
                <input type="radio" value={t.value} className="size-4 accent-[var(--ktgw-green-strong)]" {...register("type")} />
                {t.label}
              </span>
              <span className="text-sm text-muted-foreground">{t.description}</span>
            </label>
          ))}
        </div>
        {errors.type?.message && (
          <p id="type-error" role="alert" className="text-sm font-medium text-destructive">
            {errors.type.message}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-2 text-lg font-bold">Mon intention</legend>
        <TextAreaField
          label="Pourquoi souhaitez-vous rejoindre KTGW Togo ?"
          required
          rows={6}
          registration={register("motivation")}
          error={errors.motivation}
        />
        <ChoiceGroup legend="Domaines qui m'intéressent" required options={memberInterests} registration={register("interests")} error={errors.interests as never} />
        <TextAreaField label="Compétences que je peux apporter" rows={3} registration={register("skills")} error={errors.skills} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Mes disponibilités" placeholder="Ex. week-ends, à distance…" registration={register("availability")} error={errors.availability} />
          <TextField label="Comment avez-vous connu l'association ?" registration={register("referral")} error={errors.referral} />
        </div>
        <TextAreaField
          label="Contribution envisagée (cotisation, don, temps…)"
          rows={2}
          registration={register("contribution")}
          error={errors.contribution}
        />
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            aria-invalid={errors.statutes ? true : undefined}
            className="mt-1 size-4 shrink-0 accent-[var(--ktgw-green-strong)]"
            {...register("statutes")}
          />
          <span>
            J&apos;adhère aux valeurs de KTGW Togo, je m&apos;engage à respecter ses statuts et son règlement intérieur, et j&apos;accepte que mes
            informations soient conservées pour la gestion des membres.<span aria-hidden className="ml-0.5 text-ktgw-red">*</span>
          </span>
        </label>
        {errors.statutes?.message && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errors.statutes.message}
          </p>
        )}
      </div>

      <ServerError message={error} />
      <div>
        <SubmitButton pending={pending} captcha={false}>
          <Send aria-hidden />
          Envoyer ma demande d&apos;adhésion
        </SubmitButton>
      </div>
    </form>
  );
}
