import { AlertCircle, ArrowRight, Clock, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MembershipForm } from "@/components/member/membership-form";
import { Link, redirect } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { membershipStatusLabels, membershipStatusTone } from "@/lib/member/labels";
import { getMember } from "@/lib/member/session";
import { cn } from "@/lib/utils";
import { membershipTypeLabels, missingProfileFields } from "@/lib/validations/member";

export const metadata: Metadata = { title: "Adhésion", robots: { index: false } };

/** Demande d'adhésion et suivi de son traitement. */
export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const { profile } = member;

  const { data: applications } = await member.supabase
    .from("membership_applications")
    .select("id, type, status, motivation, decision_note, created_at, decided_at")
    .eq("user_id", member.user.id)
    .order("created_at", { ascending: false });

  const missing = missingProfileFields(profile);
  const canApply = profile.membership_status === "aucune" || profile.membership_status === "refusee";

  return (
    <div className="flex flex-col gap-6">
      {profile.membership_status === "validee" && (
        <Banner icon={PartyPopper} tone="bg-ktgw-green/10 text-ktgw-green-strong" title="Votre adhésion est validée !">
          Vous êtes {profile.membership_type ? membershipTypeLabels[profile.membership_type].toLowerCase() : "membre"} de KTGW Togo
          {profile.member_since ? ` depuis le ${formatDate(profile.member_since, locale)}` : ""}
          {profile.member_number ? ` (n° ${profile.member_number})` : ""}.{" "}
          <Link href="/mon-espace/documents" className="font-semibold underline underline-offset-2">
            Voir les documents des membres
          </Link>{" "}
          ·{" "}
          <Link href="/mon-espace/carte" className="font-semibold underline underline-offset-2">
            Voir ma carte de membre
          </Link>
        </Banner>
      )}
      {profile.membership_status === "en_attente" && (
        <Banner icon={Clock} tone="bg-ktgw-sun/15 text-ktgw-orange" title="Votre demande est en cours d'examen">
          L&apos;association étudie votre demande. Vous recevrez une notification dans votre espace (et par e-mail) dès la décision.
        </Banner>
      )}

      {canApply && (
        <section aria-labelledby="demande" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-8">
          <h2 id="demande" className="text-2xl font-bold">
            {profile.membership_status === "refusee" ? "Faire une nouvelle demande d'adhésion" : "Demander mon adhésion"}
          </h2>
          <p className="mt-1 mb-8 text-muted-foreground">
            Votre demande sera examinée par l&apos;administration de l&apos;association. Une fois acceptée, votre statut de membre apparaîtra dans votre
            espace.
          </p>
          {missing.length > 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-2xl bg-muted p-6">
              <p className="flex items-center gap-2 font-semibold">
                <AlertCircle aria-hidden className="size-5 text-ktgw-orange" />
                Complétez d&apos;abord votre profil
              </p>
              <p className="text-sm text-muted-foreground">Informations manquantes : {missing.join(", ")}.</p>
              <Link href="/mon-espace/profil" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white dark:bg-white dark:text-ink">
                Compléter mon profil
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          ) : (
            <MembershipForm />
          )}
        </section>
      )}

      {applications && applications.length > 0 && (
        <section aria-labelledby="historique" className="flex flex-col gap-4">
          <h2 id="historique" className="text-xl font-bold">
            Mes demandes
          </h2>
          <ul className="flex flex-col gap-3">
            {applications.map((a) => (
              <li key={a.id} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {membershipTypeLabels[a.type]} · demande du {formatDate(a.created_at, locale)}
                  </p>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", membershipStatusTone[a.status])}>{membershipStatusLabels[a.status]}</span>
                </div>
                {a.decision_note && <p className="mt-2 text-sm text-muted-foreground">Message de l&apos;association : {a.decision_note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Banner({ icon: Icon, tone, title, children }: { icon: typeof Clock; tone: string; title: string; children: React.ReactNode }) {
  return (
    <div role="status" className={cn("flex gap-4 rounded-3xl p-6", tone)}>
      <Icon aria-hidden className="size-7 shrink-0" />
      <div>
        <p className="text-lg font-bold">{title}</p>
        <p className="mt-1 text-sm text-foreground/80">{children}</p>
      </div>
    </div>
  );
}
