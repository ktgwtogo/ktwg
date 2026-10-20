"use client";

import { CheckCircle2, KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ServerError, SubmitButton, TextField } from "@/components/forms/fields";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { createClient } from "@/lib/supabase/client";
import { newPasswordSchema, type NewPasswordValues } from "@/lib/validations/member";

/** Choix d'un nouveau mot de passe (après le lien « mot de passe oublié », ou depuis l'espace). */
export function NewPasswordForm() {
  const form = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema), mode: "onTouched" });
  const { register, formState } = form;
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    const { error } = await createClient().auth.updateUser({ password: v.password });
    if (error) return setError(/different|same/i.test(error.message) ? "Choisissez un mot de passe différent de l'ancien." : "Le changement a échoué. Réessayez.");
    setDone(true);
    form.reset();
  });

  if (done)
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 font-semibold text-ktgw-green-strong">
        <CheckCircle2 aria-hidden className="size-5" />
        Votre mot de passe a été modifié.
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <TextField
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        required
        hint="8 caractères minimum"
        registration={register("password")}
        error={formState.errors.password}
      />
      <TextField label="Confirmer" type="password" autoComplete="new-password" required registration={register("confirm")} error={formState.errors.confirm} />
      <ServerError message={error} />
      <div>
        <SubmitButton pending={formState.isSubmitting} captcha={false}>
          <KeyRound aria-hidden />
          Enregistrer
        </SubmitButton>
      </div>
    </form>
  );
}
