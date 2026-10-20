import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { NewPasswordForm } from "@/components/member/new-password-form";

export const metadata: Metadata = { title: "Mot de passe", robots: { index: false } };

export default async function PasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section aria-labelledby="mot-de-passe" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-8">
      <h2 id="mot-de-passe" className="text-2xl font-bold">
        Choisir un nouveau mot de passe
      </h2>
      <p className="mt-1 mb-6 text-muted-foreground">Utilisé pour vous connecter avec votre adresse e-mail.</p>
      <NewPasswordForm />
    </section>
  );
}
