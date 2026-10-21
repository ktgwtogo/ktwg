import { ArrowLeft, Download, FolderOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { SendReceiptButton } from "@/components/admin/records-ui";
import { ReceiptDocument } from "@/components/receipts/receipt-document";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { getSiteConfig } from "@/lib/site/settings";

/** Reçu généré : consultation, téléchargement, puis envoi au donateur (e-mail + espace membre). */
export default async function AdminReceiptPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("donations.manage")) return <Forbidden />;

  const { data: d } = await staff.supabase.from("donation_declarations").select("*").eq("id", id).maybeSingle();
  if (!d || d.status !== "traite" || !d.receipt_number) notFound();
  const { togo } = await getSiteConfig();
  const noEmail = d.email.endsWith("@ktgw.tg");

  return (
    <>
      <Link href={{ pathname: "/admin/dons", query: { vue: "recus" } }} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        Dons et cotisations
      </Link>
      <PageHeading
        title={`Reçu ${d.receipt_number}`}
        description={
          d.receipt_sent_at
            ? `Envoyé au donateur le ${formatDate(d.receipt_sent_at, locale)}.`
            : "Reçu généré, pas encore envoyé : vérifiez-le, téléchargez-le si besoin, puis envoyez-le au donateur."
        }
      />

      <div className="flex flex-wrap items-start gap-3 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
        <a href={`/impression/recu/${d.id}`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white dark:bg-white dark:text-ink">
          <Download aria-hidden className="size-4" />
          Télécharger (PDF)
        </a>
        <SendReceiptButton id={d.id} sent={Boolean(d.receipt_sent_at)} />
        {d.user_id && (
          <Link href={`/admin/membres/${d.user_id}`} className="inline-flex h-9 items-center gap-2 rounded-lg border-2 border-border px-3 text-sm font-semibold hover:bg-muted">
            <FolderOpen aria-hidden className="size-4" />
            Dossier du donateur
          </Link>
        )}
        <p className="w-full text-sm text-muted-foreground">
          {noEmail ? "Aucune adresse e-mail : le reçu sera déposé dans l'espace du donateur s'il a un compte, sinon remettez-le imprimé." : `Destinataire : ${d.email}`}
        </p>
      </div>

      <div className="flex justify-center overflow-x-auto rounded-3xl bg-muted/60 p-4 sm:p-8">
        <ReceiptDocument d={d} locale={locale} togo={togo} />
      </div>
    </>
  );
}
