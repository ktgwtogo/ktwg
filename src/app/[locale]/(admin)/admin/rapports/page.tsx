import { Download, FilePlus2 } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { DeleteReportButton } from "@/components/admin/comms-ui";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const status: Record<string, [string, string]> = {
  brouillon: ["Brouillon", "bg-muted text-muted-foreground"],
  soumis: ["En attente de validation", "bg-ktgw-sun/20 text-ktgw-orange"],
  valide: ["Validé et diffusé", "bg-ktgw-green/15 text-ktgw-green-strong"],
  refuse: ["Refusé — à corriger", "bg-destructive/10 text-destructive"],
};
const categories: Record<string, string> = {
  activite: "Activité",
  financier: "Financier",
  projet: "Projet",
  reunion: "Réunion",
  autre: "Autre",
};

/** Rapports d'activité : ceux du poste, et ceux validés à destination du poste. */
export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("reports.view") && !staff.can("reports.write")) return <Forbidden />;

  // RLS : ses propres rapports + ceux validés qui concernent son poste (tout pour la présidence).
  const { data: reports } = await staff.supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(200);
  const mine = (reports ?? []).filter((r) => r.author_id === staff.user.id && r.status !== "valide");
  const published = (reports ?? []).filter((r) => r.status === "valide");
  const pending = staff.presidency ? (reports ?? []).filter((r) => r.status === "soumis" && r.author_id !== staff.user.id) : [];

  return (
    <>
      <PageHeading title="Rapports d'activité" description="Les rapports sont soumis à la présidence, puis diffusés par e-mail aux membres du bureau concernés.">
        {staff.can("reports.write") && (
          <Link href="/admin/rapports/nouveau" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ktgw-green-strong px-5 text-sm font-semibold text-white">
            <FilePlus2 aria-hidden className="size-4" />
            Nouveau rapport
          </Link>
        )}
      </PageHeading>

      {pending.length > 0 && (
        <p className="rounded-2xl bg-ktgw-sun/15 px-5 py-4 text-sm font-semibold text-ktgw-orange">
          {pending.length} rapport(s) attendent votre validation.{" "}
          <Link href="/admin/validations" className="underline underline-offset-2">
            Ouvrir les validations
          </Link>
        </p>
      )}

      {mine.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Mes rapports en cours</h2>
          <ul className="flex flex-col gap-3">
            {mine.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {r.status === "brouillon" || r.status === "refuse" ? (
                    <Link href={`/admin/rapports/${r.id}`} className="font-semibold hover:underline">
                      {r.title}
                    </Link>
                  ) : (
                    <p className="font-semibold">{r.title}</p>
                  )}
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold", status[r.status][1])}>{status[r.status][0]}</span>
                    {r.period} · {formatDate(r.updated_at, locale, "short")}
                  </p>
                </div>
                {r.status === "brouillon" && <DeleteReportButton id={r.id} />}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Rapports validés</h2>
        {!published.length ? (
          <p className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">Aucun rapport validé pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {published.map((r) => (
              <li key={r.id} className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
                <details>
                  <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2">
                    <span>
                      <span className="mr-2 rounded-full bg-ktgw-green/10 px-2 py-0.5 text-xs font-semibold text-ktgw-green-strong">{categories[r.category]}</span>
                      <span className="font-semibold">{r.title}</span>
                      {r.period && <span className="text-muted-foreground"> · {r.period}</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">Validé le {formatDate(r.validated_at ?? r.updated_at, locale, "short")}</span>
                  </summary>
                  <p className="mt-4 font-medium">{r.summary}</p>
                  {r.body && <div className="mt-3 text-sm whitespace-pre-line text-muted-foreground">{r.body}</div>}
                  {r.file_path && (
                    <a href={`/api/reports/${r.id}/file`} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border-2 border-border px-4 text-sm font-semibold">
                      <Download aria-hidden className="size-4" />
                      {r.file_name ?? "Pièce jointe"}
                    </a>
                  )}
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
