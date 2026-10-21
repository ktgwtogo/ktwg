import { Download, Eye } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { receiptNature } from "@/lib/email/messages";
import { formatDate } from "@/lib/format";
import { getMember } from "@/lib/member/session";

export const metadata: Metadata = {
  title: "Mes reçus",
  robots: { index: false },
};

/** Dons, dons en nature et cotisations de la personne connectée, avec leurs reçus officiels. */
export default async function MyReceiptsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });

  // RLS : uniquement les dons liés au compte ou à son adresse e-mail.
  const { data: rows } = await member.supabase
    .from("donation_declarations")
    .select("id, kind, amount_fcfa, method, frequency, item_description, receipt_number, receipt_sent_at, status, received_at, created_at")
    .in("status", ["nouveau", "en_cours", "traite"])
    .order("created_at", { ascending: false });

  return (
    <section aria-labelledby="recus" className="flex flex-col gap-4">
      <h2 id="recus" className="text-2xl font-bold">
        Mes dons, cotisations et reçus
      </h2>
      {rows?.some((d) => d.status === "traite") && (
        <dl className="grid gap-3 sm:grid-cols-3">
          {[
            ["Total de mes dons", rows.filter((d) => d.status === "traite" && d.kind === "don").reduce((s, d) => s + d.amount_fcfa, 0)],
            ["Total de mes cotisations", rows.filter((d) => d.status === "traite" && d.kind === "cotisation").reduce((s, d) => s + d.amount_fcfa, 0)],
            [
              `Versé en ${new Date().getFullYear()}`,
              rows
                .filter((d) => d.status === "traite" && d.kind !== "nature" && (d.received_at ?? "").startsWith(String(new Date().getFullYear())))
                .reduce((s, d) => s + d.amount_fcfa, 0),
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-ktgw-green/10 p-4">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-xl font-extrabold text-ktgw-green-strong">{value.toLocaleString("fr-FR")} FCFA</dd>
            </div>
          ))}
        </dl>
      )}
      {!rows?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed p-8 text-center text-muted-foreground">
          <p>Aucun don ni cotisation enregistré pour le moment.</p>
          <Link href="/faire-un-don" className="font-semibold text-ktgw-red underline underline-offset-2">
            Soutenir KTGW Togo
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((d) => (
            <li key={d.id} className="flex flex-col justify-between gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold">
                  {receiptNature(d)}
                  {d.kind === "nature" ? "" : ` · ${d.amount_fcfa.toLocaleString("fr-FR")} FCFA`}
                </p>
                {d.item_description && <p className="text-sm">{d.item_description}</p>}
                <p className="text-xs text-muted-foreground">
                  {formatDate(d.received_at ?? d.created_at, locale)} ·{" "}
                  {d.receipt_number && d.receipt_sent_at ? `Reçu n° ${d.receipt_number}` : "Reçu en cours de préparation par la trésorerie"}
                </p>
              </div>
              {d.status === "traite" && d.receipt_number && d.receipt_sent_at && (
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`/impression/recu/${d.id}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-border px-4 text-sm font-semibold whitespace-nowrap hover:bg-muted"
                  >
                    <Eye aria-hidden className="size-4" />
                    Voir
                  </a>
                  <a
                    href={`/impression/recu/${d.id}?telecharger=1`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-ktgw-green-strong px-4 text-sm font-semibold whitespace-nowrap text-white"
                  >
                    <Download aria-hidden className="size-4" />
                    Télécharger (PDF A4)
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
