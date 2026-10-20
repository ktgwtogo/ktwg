import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { MemberNav } from "@/components/member/member-nav";
import { Container } from "@/components/shared/section";
import { Link, redirect } from "@/i18n/navigation";
import { membershipTypeLabels } from "@/lib/validations/member";
import { membershipStatusLabels, membershipStatusTone, roleLabels } from "@/lib/member/labels";
import { getMember, photoUrl } from "@/lib/member/session";
import { cn } from "@/lib/utils";

/** Pages personnelles : toujours rendues à la demande, jamais mises en cache. */
export const dynamic = "force-dynamic";

/** Gabarit de l'espace membre : identité, statut d'adhésion, onglets. */
export default async function MemberLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });

  const { profile } = member;
  const [photo, { count: unread }] = await Promise.all([
    photoUrl(member),
    member.supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", member.user.id).is("read_at", null),
  ]);
  const name = profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;

  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <header className="flex flex-col justify-between gap-6 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-4">
          {photo ? (
            // URL signée temporaire d'un bucket privé : pas d'optimisation next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="size-16 shrink-0 rounded-full object-cover ring-2 ring-ktgw-green/40 sm:size-20" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted sm:size-20">
              <UserRound aria-hidden className="size-8 text-muted-foreground" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className={cn("rounded-full px-3 py-1", membershipStatusTone[profile.membership_status])}>
                {membershipStatusLabels[profile.membership_status]}
                {profile.membership_status === "validee" && profile.membership_type ? ` · ${membershipTypeLabels[profile.membership_type]}` : ""}
              </span>
              {profile.member_number && <span className="rounded-full bg-muted px-3 py-1">N° {profile.member_number}</span>}
              {profile.role !== "member" && <span className="rounded-full bg-ink px-3 py-1 text-white dark:bg-white dark:text-ink">{roleLabels[profile.role]}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {profile.role !== "member" && (
            <Link href="/admin" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-white dark:bg-white dark:text-ink">
              <ShieldCheck aria-hidden className="size-4" />
              Administration
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-border px-5 text-sm font-semibold">
              <LogOut aria-hidden className="size-4" />
              Se déconnecter
            </button>
          </form>
        </div>
      </header>
      <MemberNav unread={unread ?? 0} />
      {children}
    </Container>
  );
}
