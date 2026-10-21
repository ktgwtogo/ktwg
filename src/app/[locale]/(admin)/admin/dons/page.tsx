import { Download, Receipt } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { DonationActions, PaymentForm } from "@/components/admin/records-ui";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
const views = [
  { id: "a-verifier", label: "À vérifier", status: "nouveau" },
  { id: "encaisses", label: "Encaissés", status: "traite" },
  { id: "ecartes", label: "Écartés", status: "archive" },
] as const;

/** Dons et cotisations : vérification des déclarations, saisie, reçus, totaux. */
export default async function DonationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vue?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("donations.manage")) return <Forbidden />;
  const { vue } = await searchParams;
  const view = views.find((v) => v.id === vue) ?? views[0];

  const year = new Date().getFullYear();
  const [{ data: rows }, { data: cashed }] = await Promise.all([
    staff.supabase.from("donation_declarations").select("*").eq("status", view.status).order("created_at", { ascending: false }).limit(200),
    staff.supabase.from("donation_declarations").select("amount_fcfa, kind, received_at").eq("status", "traite").gte("received_at", `${year}-01-01`),
  ]);
  const month = new Date().toISOString().slice(0, 7);
  const sum = (filter: (r: { kind: string; received_at: string | null }) => boolean) =>
    (cashed ?? []).filter(filter).reduce((s, r) => s + r.amount_fcfa, 0);
  const totals = [
    { label: `Dons encaissés en ${year}`, value: fcfa(sum((r) => r.kind === "don")) },
    { label: `Cotisations encaissées en ${year}`, value: fcfa(sum((r) => r.kind === "cotisation")) },
    { label: "Encaissé ce mois-ci", value: fcfa(sum((r) => (r.received_at ?? "").startsWith(month))) },
  ];

  return (
    <>
      <PageHeading title="Dons et cotisations" description="Vérifiez les déclarations faites sur le site, enregistrez les paiements reçus et éditez les reçus.">
        {/* Téléchargement de fichier (route API), pas une page : un <a> est voulu. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/export/dons" className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-sm font-semibold">
          <Download aria-hidden className="size-4" />
          Exporter (Excel)
        </a>
      </PageHeading>

      <ul className="grid gap-4 sm:grid-cols-3">
        {totals.map((t) => (
          <li key={t.label} className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
            <p className="text-2xl font-extrabold tabular-nums">{t.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.label}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {views.map((v) => (
              <Link
                key={v.id}
                href={{ pathname: "/admin/dons", query: { vue: v.id } }}
                className={cn("rounded-full px-4 py-2 text-sm font-semibold", v.id === view.id ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card ring-1 ring-foreground/10")}
              >
                {v.label}
              </Link>
            ))}
          </div>
          {!rows?.length ? (
            <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">Rien dans cette catégorie.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((d) => (
                <li key={d.id} className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {fcfa(d.amount_fcfa)} · <span className="capitalize">{d.kind}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {d.name} · {d.method}
                      {d.reference ? ` · réf. ${d.reference}` : ""}
                      {d.project ? ` · ${d.project}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.receipt_number ? `Reçu ${d.receipt_number} · ` : ""}
                      {formatDate(d.received_at ?? d.created_at, locale, "short")}
                    </p>
                  </div>
                  {d.status === "nouveau" && <DonationActions id={d.id} />}
                  {d.status === "traite" && (
                    <a href={`/impression/recu/${d.id}`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-2 rounded-lg border-2 border-border px-3 text-sm font-semibold">
                      <Receipt aria-hidden className="size-4" />
                      Reçu
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="h-fit rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 className="mb-4 text-xl font-bold">Enregistrer un paiement reçu</h2>
          <PaymentForm />
        </section>
      </div>
    </>
  );
}
