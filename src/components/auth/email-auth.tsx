"use client";

import { KeyRound, LogIn, MailCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ConsentField, ServerError, SubmitButton, TextField } from "@/components/forms/fields";
import { safeNext } from "@/lib/auth/safe-next";
import { zodResolver } from "@/lib/forms/zod-resolver";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  resetSchema,
  signInSchema,
  signUpSchema,
  type ResetValues,
  type SignInValues,
  type SignUpValues,
} from "@/lib/validations/member";

type Mode = "signin" | "signup" | "reset";

/** Traduction des erreurs Supabase Auth les plus courantes. */
function authError(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-mail ou mot de passe incorrect.";
  if (/email not confirmed/i.test(message)) return "Confirmez d'abord votre adresse : ouvrez le lien reçu par e-mail.";
  if (/already registered|already exists/i.test(message)) return "Un compte existe déjà avec cette adresse. Connectez-vous ou réinitialisez votre mot de passe.";
  if (/rate limit|too many/i.test(message)) return "Trop de tentatives. Patientez quelques minutes puis réessayez.";
  if (/password/i.test(message)) return "Mot de passe trop faible : utilisez au moins 8 caractères, avec lettres et chiffres.";
  return "L'opération n'a pas abouti. Réessayez dans un instant.";
}

function callbackUrl(next: string) {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", next);
  return url.toString();
}

/** Connexion, création de compte et mot de passe oublié par e-mail. */
export function EmailAuth({ next, initialMode = "signin" }: { next?: string; initialMode?: "signin" | "signup" }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [sentTo, setSentTo] = useState<{ email: string; kind: "signup" | "reset" } | null>(null);

  if (sentTo)
    return (
      <div role="status" className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-ktgw-green/10 p-6 text-center">
        <MailCheck aria-hidden className="size-10 text-ktgw-green-strong" />
        <p className="font-semibold">Vérifiez votre boîte e-mail</p>
        <p className="text-sm text-muted-foreground">
          {sentTo.kind === "signup"
            ? `Nous avons envoyé un lien de confirmation à ${sentTo.email}. Ouvrez-le pour activer votre compte.`
            : `Si un compte existe pour ${sentTo.email}, vous allez recevoir un lien pour choisir un nouveau mot de passe.`}
        </p>
        <p className="text-xs text-muted-foreground">Pensez à regarder dans les courriers indésirables.</p>
      </div>
    );

  const tabs: { id: Mode; label: string }[] = [
    { id: "signin", label: "Se connecter" },
    { id: "signup", label: "Créer un compte" },
  ];

  return (
    <div className="mt-6 text-left">
      {mode !== "reset" && (
        <div role="tablist" aria-label="Connexion ou inscription" className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => setMode(t.id)}
              className={cn(
                "h-10 rounded-lg text-sm font-semibold transition-colors",
                mode === t.id ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {mode === "signin" && <SignInForm next={next} onForgot={() => setMode("reset")} />}
      {mode === "signup" && <SignUpForm onSent={(email) => setSentTo({ email, kind: "signup" })} />}
      {mode === "reset" && <ResetForm onBack={() => setMode("signin")} onSent={(email) => setSentTo({ email, kind: "reset" })} />}
    </div>
  );
}

function SignInForm({ next, onForgot }: { next?: string; onForgot: () => void }) {
  const form = useForm<SignInValues>({ resolver: zodResolver(signInSchema), mode: "onTouched" });
  const [error, setError] = useState<string | null>(null);
  const { register, formState } = form;

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email: v.email, password: v.password });
    if (error) return setError(authError(error.message));
    window.location.assign(safeNext(next));
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextField label="E-mail" type="email" autoComplete="email" required registration={register("email")} error={formState.errors.email} />
      <TextField label="Mot de passe" type="password" autoComplete="current-password" required registration={register("password")} error={formState.errors.password} />
      <button type="button" onClick={onForgot} className="self-end text-sm font-medium text-ktgw-red underline underline-offset-2">
        Mot de passe oublié ?
      </button>
      <ServerError message={error} />
      <SubmitButton pending={formState.isSubmitting} captcha={false}>
        <LogIn aria-hidden />
        Se connecter
      </SubmitButton>
    </form>
  );
}

function SignUpForm({ onSent }: { onSent: (email: string) => void }) {
  const form = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema), mode: "onTouched", defaultValues: { consent: false } });
  const [error, setError] = useState<string | null>(null);
  const { register, formState } = form;

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    const { data, error } = await createClient().auth.signUp({
      email: v.email,
      password: v.password,
      options: { data: { full_name: v.fullName }, emailRedirectTo: callbackUrl("/mon-espace/profil") },
    });
    if (error) return setError(authError(error.message));
    // Confirmation d'e-mail désactivée dans Supabase : la session est ouverte tout de suite.
    if (data.session) return window.location.assign("/mon-espace/profil");
    // Adresse déjà inscrite : Supabase renvoie un utilisateur sans identité, sans envoyer d'e-mail.
    if (data.user && data.user.identities?.length === 0) return setError(authError("already registered"));
    onSent(v.email);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextField label="Nom complet" autoComplete="name" required registration={register("fullName")} error={formState.errors.fullName} />
      <TextField label="E-mail" type="email" autoComplete="email" required registration={register("email")} error={formState.errors.email} />
      <TextField
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        required
        hint="8 caractères minimum"
        registration={register("password")}
        error={formState.errors.password}
      />
      <TextField label="Confirmer le mot de passe" type="password" autoComplete="new-password" required registration={register("confirm")} error={formState.errors.confirm} />
      <ConsentField registration={register("consent")} error={formState.errors.consent} />
      <ServerError message={error} />
      <SubmitButton pending={formState.isSubmitting} captcha={false}>
        <UserPlus aria-hidden />
        Créer mon compte
      </SubmitButton>
    </form>
  );
}

function ResetForm({ onBack, onSent }: { onBack: () => void; onSent: (email: string) => void }) {
  const form = useForm<ResetValues>({ resolver: zodResolver(resetSchema), mode: "onTouched" });
  const [error, setError] = useState<string | null>(null);
  const { register, formState } = form;

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(v.email, { redirectTo: callbackUrl("/mon-espace/mot-de-passe") });
    if (error) return setError(authError(error.message));
    onSent(v.email);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Indiquez l&apos;adresse de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
      <TextField label="E-mail" type="email" autoComplete="email" required registration={register("email")} error={formState.errors.email} />
      <ServerError message={error} />
      <SubmitButton pending={formState.isSubmitting} captcha={false}>
        <KeyRound aria-hidden />
        Recevoir le lien
      </SubmitButton>
      <button type="button" onClick={onBack} className="text-sm font-medium text-muted-foreground underline underline-offset-2">
        Retour à la connexion
      </button>
    </form>
  );
}
