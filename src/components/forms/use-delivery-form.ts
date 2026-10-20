"use client";

import { useState } from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import type { z } from "zod";
import { prepareDelivery, type Delivery } from "@/lib/forms/deliver";
import { zodResolver } from "@/lib/forms/zod-resolver";

/**
 * Hook commun aux formulaires publics : validation zod, champ piège,
 * puis préparation du message (WhatsApp / e-mail).
 * Phase 6 : `onValid` appellera une Server Action (Supabase + Resend + Turnstile).
 */
export function useDeliveryForm<T extends FieldValues>({
  schema,
  defaultValues,
  subject,
  toFields,
  honeypotKey = "website",
}: {
  schema: z.ZodType<T>;
  defaultValues?: DefaultValues<T>;
  subject: (values: T) => string;
  toFields: (values: T) => Record<string, unknown>;
  honeypotKey?: string;
}) {
  const form = useForm<T>({ resolver: zodResolver(schema), defaultValues, mode: "onTouched" });
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  const onSubmit = form.handleSubmit((values) => {
    // Robot détecté : on simule un succès sans rien préparer
    if ((values as Record<string, unknown>)[honeypotKey]) return;
    setDelivery(prepareDelivery(subject(values), toFields(values)));
    requestAnimationFrame(() => document.getElementById("form-result")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  });

  const reset = () => setDelivery(null);
  return { form, delivery, onSubmit, reset, errors: form.formState.errors };
}
