import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ProfileForm } from "@/components/member/profile-form";
import { redirect } from "@/i18n/navigation";
import { getMember, photoUrl } from "@/lib/member/session";
import type { ProfileValues } from "@/lib/validations/member";

export const metadata: Metadata = { title: "Mon profil", robots: { index: false } };

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const p = member.profile;

  // Prénom / nom proposés à partir du nom du compte (Google ou inscription) s'ils sont vides.
  const [first, ...rest] = (p.full_name ?? "").split(" ");
  const defaults: Partial<ProfileValues> = {
    civility: (p.civility as ProfileValues["civility"]) ?? undefined,
    firstName: p.first_name ?? first ?? "",
    lastName: p.last_name ?? rest.join(" "),
    birthDate: p.birth_date ?? "",
    nationality: p.nationality ?? "",
    profession: p.profession ?? "",
    organization: p.organization ?? "",
    phone: p.phone ?? "",
    whatsapp: p.whatsapp ?? "",
    address: p.address ?? "",
    city: p.city ?? "",
    country: p.country ?? "",
    bio: p.bio ?? "",
  };

  return (
    <section aria-labelledby="profil" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-8">
      <h2 id="profil" className="text-2xl font-bold">
        Mon profil
      </h2>
      <p className="mt-1 mb-8 text-muted-foreground">
        Ces informations sont conservées par l&apos;association pour gérer votre adhésion. Elles ne sont jamais publiées sur le site.
      </p>
      <ProfileForm userId={member.user.id} defaults={defaults} photoUrl={await photoUrl(member)} />
    </section>
  );
}
