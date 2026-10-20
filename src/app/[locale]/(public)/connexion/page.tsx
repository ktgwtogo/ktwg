import { CalendarCheck, FileText, LockKeyhole, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { redirect as nextRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { EmailAuth } from "@/components/auth/email-auth";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/section";
import { Link, redirect } from "@/i18n/navigation";
import { authProviders } from "@/lib/auth/providers";
import { safeNext } from "@/lib/auth/safe-next";
import { getMember } from "@/lib/member/session";

/** Pages personnelles : toujours rendues à la demande, jamais mises en cache. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

const errors: Record<string, string> = {
  code: "La connexion a été interrompue. Réessayez.",
  session: "Votre session n'a pas pu être ouverte. Réessayez, ou contactez-nous si le problème persiste.",
  lien: "Ce lien n'est plus valide (il a peut-être déjà servi). Connectez-vous, ou demandez un nouveau lien.",
};

/** Page de connexion et d'inscription (Google ou e-mail, via Supabase Auth). */
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

  // `next` contient déjà le préfixe de langue (posé par le middleware).
  if (await getMember()) return next ? nextRedirect(safeNext(next)) : redirect({ href: "/mon-espace", locale });
  const providers = await authProviders();
  const open = providers.google || providers.email;

  return (
    <Container className="flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-xl ring-1 ring-foreground/5 sm:p-10">
        <Logo className="mx-auto h-24" />
        <h1 className="mt-6 text-3xl font-extrabold">Espace membre</h1>
        <p className="mt-2 text-muted-foreground">
          Créez votre compte ou connectez-vous pour compléter votre profil, demander votre adhésion et accéder aux documents de l&apos;association.
        </p>

        {erreur && errors[erreur] && (
          <p role="alert" className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {errors[erreur]}
          </p>
        )}

        {providers.google && <GoogleSignIn next={next} />}
        {providers.google && providers.email && (
          <div className="mt-6 flex items-center gap-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            ou avec votre e-mail
            <span className="h-px flex-1 bg-border" />
          </div>
        )}
        {providers.email && <EmailAuth next={next} />}
        {!open && (
          <p className="mt-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <LockKeyhole aria-hidden className="size-4" />
            La connexion sera ouverte très prochainement.
          </p>
        )}

        <ul className="mt-8 flex flex-col gap-3 border-t pt-6 text-left text-sm">
          {[
            { icon: UserRound, text: "Mon profil et ma demande d'adhésion" },
            { icon: CalendarCheck, text: "Mes inscriptions, messages et notifications" },
            { icon: FileText, text: "Les documents officiels de l'association" },
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
