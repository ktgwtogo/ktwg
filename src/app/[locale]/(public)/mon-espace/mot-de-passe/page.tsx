import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ChangeEmailForm } from "@/components/member/change-email-form";
import { NewPasswordForm } from "@/components/member/new-password-form";
import { redirect } from "@/i18n/navigation";
import { getMember } from "@/lib/member/session";

export const metadata: Metadata = { title: "Sécurité du compte", robots: { index: false } };

/** Mot de passe et adresse e-mail du compte. */
export default async function AccountSecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const mustChange = member.profile.must_change_password;
  const isStaff = member.profile.role !== "member";

  return (
    <div className="flex flex-col gap-6">
      {mustChange && (
        <p role="alert" className="flex items-start gap-3 rounded-2xl bg-ktgw-sun/15 p-5 font-semibold text-ktgw-orange">
          <ShieldAlert aria-hidden className="size-6 shrink-0" />
          Votre mot de passe est provisoire : choisissez votre propre mot de passe pour accéder à votre espace.
        </p>
      )}
      <section aria-labelledby="mot-de-passe" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-8">
        <h2 id="mot-de-passe" className="text-2xl font-bold">
          {mustChange ? "Choisir mon mot de passe" : "Changer de mot de passe"}
        </h2>
        <p className="mt-1 mb-6 text-muted-foreground">Utilisé pour vous connecter avec votre adresse e-mail.</p>
        <NewPasswordForm continueTo={mustChange ? (isStaff ? "/admin" : "/mon-espace") : undefined} />
      </section>
      {!mustChange && (
        <section aria-labelledby="adresse" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-8">
          <h2 id="adresse" className="text-2xl font-bold">
            Changer d&apos;adresse e-mail
          </h2>
          <p className="mt-1 mb-6 text-muted-foreground">Un lien de confirmation sera envoyé à la nouvelle adresse.</p>
          <ChangeEmailForm current={member.user.email ?? member.profile.email} />
        </section>
      )}
    </div>
  );
}
