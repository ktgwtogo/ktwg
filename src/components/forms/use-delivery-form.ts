"use client";

import { useLocale } from "next-intl";
import { useState, useTransition } from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import { submitForm } from "@/lib/forms/actions";
import { formDefinitions, type FormContext, type FormDefinition, type FormKind } from "@/lib/forms/definitions";
import { prepareDelivery, type Delivery } from "@/lib/forms/deliver";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { useSiteConfig } from "@/components/layout/site-config-provider";
import { takeTurnstileToken } from "./turnstile";

export type FormOutcome = { status: "sent" } | { status: "fallback"; delivery: Delivery };

/**
 * Hook commun aux formulaires publics : validation zod côté navigateur, puis envoi
 * à la Server Action (Turnstile, limitation d'envois, Supabase, e-mails).
 * Si le serveur ne peut pas enregistrer, le message est préparé pour WhatsApp / e-mail.
 */
export function useDeliveryForm<T extends FieldValues>({
  kind,
  defaultValues,
  context = {},
}: {
  kind: FormKind;
  defaultValues?: DefaultValues<T>;
  context?: FormContext;
}) {
  const def = formDefinitions[kind] as unknown as FormDefinition<T>;
  const form = useForm<T>({ resolver: zodResolver(def.schema), defaultValues, mode: "onTouched" });
  const locale = useLocale();
  const { togo } = useSiteConfig();
  const [outcome, setOutcome] = useState<FormOutcome | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = form.handleSubmit((values, event) => {
    // Robot détecté : on simule un succès sans rien envoyer
    if ((values as Record<string, unknown>)[def.honeypot]) return setOutcome({ status: "sent" });
    const turnstileToken = takeTurnstileToken((event?.target as HTMLFormElement | undefined) ?? null);
    setServerError(null);

    startTransition(async () => {
      const result = await submitForm(kind, values, { context, turnstileToken, locale }).catch(() => null);
      if (result?.ok) setOutcome({ status: "sent" });
      else if (!result || result.fallback) {
        setServerError(result?.error ?? null);
        setOutcome({ status: "fallback", delivery: prepareDelivery(def.subject(values, context), def.fields(values, context), togo) });
      } else return setServerError(result.error);
      requestAnimationFrame(() => document.getElementById("form-result")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    });
  });

  const reset = () => {
    setOutcome(null);
    setServerError(null);
    form.reset(defaultValues);
  };
  return { form, outcome, onSubmit, reset, pending, serverError, errors: form.formState.errors };
}
