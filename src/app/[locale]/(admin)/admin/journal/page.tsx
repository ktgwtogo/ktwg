import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { auditLabel } from "@/lib/admin/labels";
import { getStaff } from "@/lib/admin/staff";
import { formatDate, formatTime } from "@/lib/format";

const PAGE = 50;

/** Journal de toutes les actions de l'équipe : présidence uniquement. */
export default async function JournalPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.presidency) return <Forbidden />;
  const page = Math.max(0, Number((await searchParams).page) || 0);

  const { data: entries } = await staff.supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE);
  const rows = (entries ?? []).slice(0, PAGE);
  const ids = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))] as string[];
  const { data: actors } = ids.length ? await staff.supabase.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] };
  const name = new Map((actors ?? []).map((a) => [a.id, a.full_name ?? a.email]));

  return (
    <>
      <PageHeading title="Journal d'activité" description="Chaque action de l'équipe est enregistrée : qui, quoi, quand. Visible par la présidence uniquement." />
      {!rows.length ? (
        <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">Aucune action enregistrée.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-card shadow-soft ring-1 ring-foreground/5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-5 py-3">Date</th>
                <th scope="col" className="px-5 py-3">Personne</th>
                <th scope="col" className="px-5 py-3">Action</th>
                <th scope="col" className="px-5 py-3">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const details = r.details as Record<string, unknown>;
                const summary = ["title", "email", "poste", "name", "note"]
                  .map((k) => details[k])
                  .filter((v) => typeof v === "string" && v)
                  .join(" · ");
                return (
                  <tr key={r.id}>
                    <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(r.created_at, locale, "short")} {formatTime(r.created_at, locale)}
                    </td>
                    <td className="px-5 py-3 font-semibold">{name.get(r.actor_id ?? "") ?? "Système"}</td>
                    <td className="px-5 py-3">{auditLabel(r.action)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{summary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between">
        {page > 0 ? (
          <Link href={{ pathname: "/admin/journal", query: { page: page - 1 } }} className="font-semibold text-ktgw-red">
            ← Plus récentes
          </Link>
        ) : (
          <span />
        )}
        {(entries?.length ?? 0) > PAGE && (
          <Link href={{ pathname: "/admin/journal", query: { page: page + 1 } }} className="font-semibold text-ktgw-red">
            Plus anciennes →
          </Link>
        )}
      </div>
    </>
  );
}
