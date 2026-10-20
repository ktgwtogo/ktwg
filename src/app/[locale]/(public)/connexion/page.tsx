import { CalendarCheck, LockKeyhole, MessageSquare, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { redirect as nextRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { FcGoogle } from "react-icons/fc";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/section";
import { Link, redirect } from "@/i18n/navigation";
import { isGoogleEnabled } from "@/lib/auth/providers";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

const errors: Record<string, string> = {
  code: "La connexion a été interrompue. Réessayez.",
  session: "Votre session n'a pas pu être ouverte. Réessayez, ou contactez-nous si le problème persiste.",
};

/** Page de connexion (Google via Supabase Auth). */
export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; erreur?: string }>;
}) {
  const { locale } = await params;
  const { next, erreur } = await searchParams;
  setRequestLocale(locale);

  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (configured) {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    // `next` contient déjà le préfixe de langue (posé par le middleware).
    if (user) return next ? nextRedirect(safeNext(next)) : redirect({ href: "/mon-espace", locale });
  }
  const googleEnabled = configured && (await isGoogleEnabled());

  return (
    <Container className="flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-xl ring-1 ring-foreground/5 sm:p-10">
        <Logo className="mx-auto h-24" />
        <h1 className="mt-6 text-3xl font-extrabold">Espace membre</h1>
        <p className="mt-2 text-muted-foreground">Connectez-vous pour suivre vos inscriptions, vos messages et vos engagements.</p>

        {erreur && errors[erreur] && (
          <p role="alert" className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {errors[erreur]}
          </p>
        )}

        {googleEnabled ? (
          <GoogleSignIn next={next} />
        ) : (
          <>
            <button
              type="button"
              disabled
              aria-describedby="signin-soon"
              className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-white font-semibold text-ink opacity-70"
            >
              <FcGoogle aria-hidden className="size-5" />
              Continuer avec Google
            </button>
            <p id="signin-soon" className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <LockKeyhole aria-hidden className="size-4" />
              La connexion sera ouverte très prochainement.
            </p>
          </>
        )}

        <ul className="mt-8 flex flex-col gap-3 border-t pt-6 text-left text-sm">
          {[
            { icon: CalendarCheck, text: "Mes inscriptions aux événements" },
            { icon: MessageSquare, text: "Mes messages et demandes" },
            { icon: UserRound, text: "Mon profil et mes données (RGPD)" },
          ].map((f) => (
            <li key={f.text} className="flex items-center gap-3">
              <f.icon aria-hidden className="size-5 text-ktgw-green" />
              {f.text}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          Une question ? <Link href="/contact" className="font-semibold text-ktgw-red underline underline-offset-2">Contactez-nous</Link>.
        </p>
      </div>
    </Container>
  );
}
