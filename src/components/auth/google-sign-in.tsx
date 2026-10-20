"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/client";

/** Bouton « Continuer avec Google » (Supabase Auth, flux PKCE). */
export function GoogleSignIn({ next }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setPending(true);
    setError(null);
    const redirectTo = new URL("/auth/callback", window.location.origin);
    const locale = document.documentElement.lang;
    redirectTo.searchParams.set("next", safeNext(next, locale && locale !== "fr" ? `/${locale}/mon-espace` : "/mon-espace"));
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
    if (error) {
      setPending(false);
      setError("La connexion avec Google n'a pas pu démarrer. Réessayez dans un instant.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        aria-busy={pending}
        className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-white font-semibold text-ink transition-colors hover:border-ktgw-green disabled:opacity-70"
      >
        {pending ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <FcGoogle aria-hidden className="size-5" />}
        Continuer avec Google
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
