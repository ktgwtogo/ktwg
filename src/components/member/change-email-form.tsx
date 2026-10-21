"use client";

import { MailCheck, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ServerError, SubmitButton, TextField } from "@/components/forms/fields";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({ email: z.string().trim().min(1, "Indiquez la nouvelle adresse.").pipe(z.email("Adresse e-mail invalide.")) });
type Values = z.infer<typeof schema>;

/** Changement d'adresse e-mail : effectif après clic sur le lien envoyé à la nouvelle adresse. */
export function ChangeEmailForm({ current }: { current: string }) {
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched" });
  const { register, formState } = form;
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setError(null);
    if (email.toLowerCase() === current.toLowerCase()) return setError("C'est déjà votre adresse actuelle.");
    const redirect = new URL("/auth/callback", window.location.origin);
    redirect.searchParams.set("next", "/mon-espace/mot-de-passe");
    const { error } = await createClient().auth.updateUser({ email }, { emailRedirectTo: redirect.toString() });
    if (error) return setError(/registered|exists/i.test(error.message) ? "Cette adresse est déjà utilisée par un autre compte." : "Le changement a échoué. Réessayez.");
    setSentTo(email);
  });

  if (sentTo)
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
        <MailCheck aria-hidden className="size-5 shrink-0" />
        Ouvrez le lien de confirmation envoyé à {sentTo} (et, si demandé, celui envoyé à votre adresse actuelle) pour finaliser le changement.
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Adresse actuelle : <strong className="text-foreground">{current}</strong>
      </p>
      <TextField label="Nouvelle adresse e-mail" type="email" autoComplete="email" required registration={register("email")} error={formState.errors.email} />
      <ServerError message={error} />
      <div>
        <SubmitButton pending={formState.isSubmitting} captcha={false}>
          <Save aria-hidden />
          Changer d&apos;adresse
        </SubmitButton>
      </div>
    </form>
  );
}
