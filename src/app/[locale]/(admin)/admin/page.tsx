import { ArrowRight, BadgeCheck, ClipboardCheck, HandCoins, Inbox, Mail, Ticket, UsersRound } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { PageHeading } from "@/components/admin/page-heading";
import { QuickAccess } from "@/components/admin/quick-access";
import { ValidationRule } from "@/components/admin/validation-rule";
import { Link, redirect } from "@/i18n/navigation";
import { guides } from "@/lib/admin/guides";
import { auditLabel } from "@/lib/admin/labels";
import { getAdminNav } from "@/lib/admin/nav";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";

type Stat = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  icon: typeof Inbox;
  tone: string;
};

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

/** Vue d'ensemble : accès rapides, chiffres clés selon le poste, activité des 6 derniers mois, tâches et modes d'emploi. */
export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  const { supabase } = staff;
  const items = await getAdminNav(staff);
  const showStats = staff.can("dashboard.view");

  const head = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const stats: Stat[] = [];
  const monthly: { created_at: string }[] = [];

  if (staff.presidency && showStats) {
    const [approvals, team] = await Promise.all([
      head(supabase.from("approval_requests").select("id", { count: "exact", head: true }).eq("status", "en_attente")),
      head(supabase.from("profiles").select("id", { count: "exact", head: true }).neq("role", "member").eq("is_active", true)),
    ]);
    stats.push(
      {
        label: "Demandes à valider",
        value: String(approvals),
        href: "/admin/validations",
        icon: ClipboardCheck,
        tone: "bg-ktgw-sun/20 text-ktgw-orange",
      },
      {
        label: "Comptes du bureau actifs",
        value: String(team),
        href: "/admin/equipe",
        icon: UsersRound,
        tone: "bg-ink/10 text-ink dark:bg-white/10 dark:text-white",
      },
    );
  }
  if (showStats && staff.can("members.view")) {
    const [members, pending, accounts] = await Promise.all([
      head(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("membership_status", "validee")),
      head(supabase.from("membership_applications").select("id", { count: "exact", head: true }).eq("status", "en_attente")),
      supabase.from("profiles").select("created_at").gte("created_at", since.toISOString()),
    ]);
    monthly.push(...(accounts.data ?? []));
    stats.push(
      {
        label: "Membres validés",
        value: String(members),
        icon: BadgeCheck,
        tone: "bg-ktgw-green/15 text-ktgw-green-strong",
      },
      {
        label: "Adhésions à traiter",
        value: String(pending),
        href: "/admin/adhesions",
        icon: BadgeCheck,
        tone: "bg-ktgw-sun/20 text-ktgw-orange",
      },
    );
  }
  if (showStats && staff.can("donations.manage")) {
    const { data } = await supabase.from("donation_declarations").select("amount_fcfa, created_at, status").gte("created_at", since.toISOString());
    const rows = data ?? [];
    monthly.push(...rows);
    const thisMonth = rows.filter((d) => d.created_at >= monthStart).reduce((s, d) => s + d.amount_fcfa, 0);
    stats.push(
      {
        label: "Dons déclarés ce mois",
        value: fcfa(thisMonth),
        icon: HandCoins,
        tone: "bg-ktgw-red/10 text-ktgw-red-strong",
      },
      {
        label: "Dons à vérifier",
        value: String(rows.filter((d) => d.status === "nouveau").length),
        icon: HandCoins,
        tone: "bg-ktgw-sun/20 text-ktgw-orange",
      },
    );
  }
  if (showStats && staff.can("inbox.manage")) {
    const [messages, partners] = await Promise.all([
      supabase.from("contact_messages").select("created_at, status").gte("created_at", since.toISOString()),
      head(supabase.from("partnership_requests").select("id", { count: "exact", head: true }).eq("status", "nouveau")),
    ]);
    monthly.push(...(messages.data ?? []));
    stats.push(
      {
        label: "Messages non traités",
        value: String((messages.data ?? []).filter((m) => m.status === "nouveau").length),
        icon: Inbox,
        tone: "bg-ink/10 text-ink dark:bg-white/10 dark:text-white",
      },
      {
        label: "Partenariats à étudier",
        value: String(partners),
        icon: Inbox,
        tone: "bg-ktgw-green/15 text-ktgw-green-strong",
      },
    );
  }
  if (showStats && staff.can("projects.manage")) {
    const [registrations, trainings] = await Promise.all([
      supabase.from("event_registrations").select("created_at").gte("created_at", since.toISOString()),
      head(supabase.from("training_applications").select("id", { count: "exact", head: true }).eq("status", "nouveau")),
    ]);
    monthly.push(...(registrations.data ?? []));
    stats.push(
      {
        label: "Inscriptions aux événements (6 mois)",
        value: String(registrations.data?.length ?? 0),
        icon: Ticket,
        tone: "bg-ktgw-green/15 text-ktgw-green-strong",
      },
      {
        label: "Candidatures aux formations",
        value: String(trainings),
        icon: Ticket,
        tone: "bg-ktgw-sun/20 text-ktgw-orange",
      },
    );
  }
  if (showStats && staff.can("newsletter.manage")) {
    const subscribers = await head(
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).not("confirmed_at", "is", null).is("unsubscribed_at", null),
    );
    stats.push({
      label: "Abonné·es à la newsletter",
      value: String(subscribers),
      icon: Mail,
      tone: "bg-ktgw-red/10 text-ktgw-red-strong",
    });
  }

  // Activité mensuelle : tout ce que le poste peut voir (comptes, dons, messages, inscriptions).
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    return {
      key: d.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat(locale, { month: "short" }).format(d),
      value: 0,
    };
  });
  for (const row of monthly) {
    const m = months.find((x) => x.key === row.created_at.slice(0, 7));
    if (m) m.value += 1;
  }
  const max = Math.max(1, ...months.map((m) => m.value));

  const { data: recent } = staff.presidency
    ? await supabase.from("audit_log").select("id, action, entity, details, created_at, actor_id").order("created_at", { ascending: false }).limit(8)
    : { data: null };
  const actorIds = [...new Set((recent ?? []).map((r) => r.actor_id).filter(Boolean))] as string[];
  const { data: actors } = actorIds.length ? await supabase.from("profiles").select("id, full_name, email").in("id", actorIds) : { data: [] };
  const actorName = new Map((actors ?? []).map((a) => [a.id, a.full_name ?? a.email]));

  const firstName = (staff.profile.full_name ?? "").split(" ")[0];
  const myGuides = guides.filter((g) => g.href !== "/admin" && items.some((i) => i.href === g.href));

  return (
    <>
      <PageHeading
        title={`Bonjour${firstName ? ` ${firstName}` : ""} !`}
        description={staff.presidency ? "Vue d'ensemble de l'association et des actions de votre équipe." : `Votre poste : ${staff.position?.name}.`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="xl:order-2">
          <QuickAccess
            items={items}
            user={{
              name: staff.profile.full_name ?? staff.profile.email,
              position: staff.position?.name ?? (staff.presidency ? "Présidence" : "Équipe"),
            }}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6 xl:order-1">
          <ValidationRule presidency={staff.presidency} />

          {stats.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {stats.map((s) => {
                const body = (
                  <>
                    <span className={`flex size-11 items-center justify-center rounded-xl ${s.tone}`}>
                      <s.icon aria-hidden className="size-5" />
                    </span>
                    <p className="mt-4 text-3xl font-extrabold tabular-nums">{s.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      {s.label}
                      {s.href && <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />}
                    </p>
                  </>
                );
                return (
                  <li key={s.label}>
                    {s.href ? (
                      <Link href={s.href} className="group block h-full rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 hover:ring-ktgw-green/40">
                        {body}
                      </Link>
                    ) : (
                      <div className="h-full rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {showStats && (
            <div className="grid gap-6 lg:grid-cols-5">
              <section aria-labelledby="activite" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 lg:col-span-3">
                <h2 id="activite" className="text-lg font-bold">
                  Activité des 6 derniers mois
                </h2>
                <p className="text-sm text-muted-foreground">Nouveaux comptes, dons, messages et inscriptions visibles par votre poste.</p>
                <ol className="mt-6 flex h-48 items-end gap-3" aria-label="Nombre d'éléments reçus par mois">
                  {months.map((m) => (
                    <li key={m.key} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-xs font-semibold tabular-nums">{m.value}</span>
                      <span
                        className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-ktgw-green-strong to-ktgw-green"
                        style={{
                          height: `${Math.max(4, (m.value / max) * 140)}px`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground capitalize">{m.label}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {staff.presidency && (
                <section aria-labelledby="dernieres-actions" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h2 id="dernieres-actions" className="text-lg font-bold">
                      Dernières actions
                    </h2>
                    <Link href="/admin/journal" className="text-sm font-semibold text-ktgw-red">
                      Tout voir
                    </Link>
                  </div>
                  {!recent?.length ? (
                    <p className="mt-4 text-sm text-muted-foreground">Aucune action enregistrée pour le moment.</p>
                  ) : (
                    <ul className="mt-4 flex flex-col gap-3">
                      {recent.map((r) => (
                        <li key={r.id} className="text-sm">
                          <p>
                            <strong>{actorName.get(r.actor_id ?? "") ?? "Système"}</strong> · {auditLabel(r.action)}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(r.created_at, locale, "short")}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>
          )}

          <section aria-labelledby="mes-taches" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="mes-taches" className="text-lg font-bold">
                Mes tâches : comment faire
              </h2>
              <Link href="/admin/guide" className="text-sm font-semibold text-ktgw-red">
                Mode d&apos;emploi complet
              </Link>
            </div>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {myGuides.map((g) => (
                <li key={g.href}>
                  <details className="group h-full rounded-2xl bg-muted/50 ring-1 ring-foreground/5 open:bg-ktgw-green/5">
                    <summary className="flex cursor-pointer list-none flex-col gap-0.5 p-4">
                      <span className="font-semibold text-ktgw-green-dark dark:text-ktgw-green">{g.title}</span>
                      <span className="text-sm text-muted-foreground">{g.summary}</span>
                    </summary>
                    <div className="flex flex-col gap-2 px-4 pb-4">
                      <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm marker:font-bold marker:text-ktgw-green-strong">
                        {g.steps.map((step) => (
                          <li key={step}>{step.replace(/^\d\.\s/, "")}</li>
                        ))}
                      </ol>
                      <Link href={g.href} className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-ktgw-red">
                        Ouvrir
                        <ArrowRight aria-hidden className="size-4" />
                      </Link>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
