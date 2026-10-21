import { Eye, Monitor, UserCheck, Users } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Stats = {
  views: number;
  visitors: number;
  members: number;
  today: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number }[];
  referrers: { source: string; views: number }[];
  devices: { device: string; visitors: number }[];
  active_members: { id: string; name: string; email: string; last_seen: string; views: number }[];
};

const periods = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "3 mois" },
  { days: 365, label: "12 mois" },
] as const;

const pageName = (path: string) => (path === "/" ? "Accueil" : decodeURIComponent(path).replace(/^\/(de|en)(?=\/|$)/, "").replace(/^\//, "") || "Accueil");

/** Fréquentation du site : visites, pages consultées, provenance, membres connectés. */
export default async function StatsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ jours?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("dashboard.view")) return <Forbidden />;
  const { jours } = await searchParams;
  const days = periods.find((p) => String(p.days) === jours)?.days ?? 30;

  const { data, error } = await staff.supabase.rpc("site_stats", { p_days: days });
  if (error || !data) {
    return (
      <>
        <PageHeading title="Statistiques de visite" />
        <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">Les statistiques ne sont pas encore disponibles.</p>
      </>
    );
  }
  const s = data as unknown as Stats;
  const max = Math.max(1, ...s.daily.map((d) => d.views));
  const maxPage = Math.max(1, ...s.pages.map((p) => p.views));
  const totalDevices = Math.max(1, s.devices.reduce((a, d) => a + d.visitors, 0));

  const cards = [
    { label: "Visiteurs", value: s.visitors, icon: Users, tone: "bg-ktgw-green/15 text-ktgw-green-strong" },
    { label: "Pages vues", value: s.views, icon: Eye, tone: "bg-ktgw-sun/20 text-ktgw-orange" },
    { label: "Membres connectés", value: s.members, icon: UserCheck, tone: "bg-ktgw-red/10 text-ktgw-red-strong" },
    { label: "Visiteurs aujourd'hui", value: s.today, icon: Monitor, tone: "bg-ink/10 text-ink dark:bg-white/10 dark:text-white" },
  ];

  return (
    <>
      <PageHeading title="Statistiques de visite" description="Fréquentation du site public, mesurée sans cookie publicitaire ni adresse IP." />
      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <Link
            key={p.days}
            href={{ pathname: "/admin/statistiques", query: { jours: p.days } }}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold", p.days === days ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card ring-1 ring-foreground/10")}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label} className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
            <span className={`flex size-11 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon aria-hidden className="size-5" />
            </span>
            <p className="mt-4 text-3xl font-extrabold tabular-nums">{c.value.toLocaleString("fr-FR")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
          </li>
        ))}
      </ul>

      <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
        <h2 className="text-lg font-bold">Pages vues par jour</h2>
        {!s.daily.length ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucune visite enregistrée sur la période.</p>
        ) : (
          <ol className="mt-6 flex h-48 items-end gap-1" aria-label="Pages vues par jour">
            {s.daily.map((d) => (
              <li key={d.day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${formatDate(d.day, locale, "short")} : ${d.views} pages vues, ${d.visitors} visiteurs`}>
                <span className="w-full rounded-t bg-gradient-to-t from-ktgw-green-strong to-ktgw-green" style={{ height: `${Math.max(3, (d.views / max) * 100)}%` }} />
              </li>
            ))}
          </ol>
        )}
        {s.daily.length > 0 && (
          <p className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatDate(s.daily[0].day, locale, "short")}</span>
            <span>{formatDate(s.daily.at(-1)!.day, locale, "short")}</span>
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 className="mb-4 text-lg font-bold">Pages les plus consultées</h2>
          <ul className="flex flex-col gap-3">
            {s.pages.map((p) => (
              <li key={p.path} className="text-sm">
                <div className="flex justify-between gap-3">
                  <a href={p.path} target="_blank" rel="noopener" className="truncate font-semibold hover:underline">
                    {pageName(p.path)}
                  </a>
                  <span className="tabular-nums text-muted-foreground">{p.views}</span>
                </div>
                <span className="mt-1 block h-2 rounded-full bg-ktgw-green/70" style={{ width: `${(p.views / maxPage) * 100}%` }} />
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
            <h2 className="mb-4 text-lg font-bold">Provenance des visites</h2>
            <ul className="flex flex-col divide-y text-sm">
              {s.referrers.map((r) => (
                <li key={r.source} className="flex justify-between py-2">
                  <span>{r.source}</span>
                  <span className="tabular-nums text-muted-foreground">{r.views}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
            <h2 className="mb-4 text-lg font-bold">Appareils</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {s.devices.map((d) => (
                <li key={d.device} className="flex justify-between">
                  <span className="capitalize">{d.device}</span>
                  <span className="font-semibold">{Math.round((d.visitors / totalDevices) * 100)} %</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {staff.can("members.view") && (
        <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 className="mb-1 text-lg font-bold">Membres ayant consulté le site</h2>
          <p className="mb-4 text-sm text-muted-foreground">Comptes connectés pendant la période, du plus récent au plus ancien.</p>
          {!s.active_members.length ? (
            <p className="text-sm text-muted-foreground">Aucun membre connecté sur la période.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th scope="col" className="py-2">Membre</th>
                    <th scope="col" className="py-2">Dernière visite</th>
                    <th scope="col" className="py-2 text-right">Pages vues</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {s.active_members.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2">
                        <Link href={`/admin/membres/${m.id}`} className="font-semibold hover:underline">
                          {m.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">{m.email}</span>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {formatDate(m.last_seen, locale, "short")} {formatTime(m.last_seen, locale)}
                      </td>
                      <td className="py-2 text-right tabular-nums">{m.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
