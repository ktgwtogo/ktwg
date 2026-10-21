import { ArrowLeft, Download, FolderOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { SendReceiptButton } from "@/components/admin/records-ui";
import { ReceiptDocument } from "@/components/receipts/receipt-document";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { receiptQrSvg } from "@/lib/receipts/qr";
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
  const [{ togo }, qr] = await Promise.all([getSiteConfig(), receiptQrSvg(d.id)]);
  const noEmail = d.email.endsWith("@ktgw.tg");

  return (
    <>
      <Link
        href={{ pathname: "/admin/dons", query: { vue: "recus" } }}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
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

      <ol className="grid gap-3 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 md:grid-cols-3">
        <li className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-wide text-ktgw-green-strong uppercase">1. Vérifier</p>
          <p className="text-sm text-muted-foreground">Relisez le reçu ci-dessous : nom, montant ou objets, moyen de paiement, affectation.</p>
        </li>
        <li className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-wide text-ktgw-green-strong uppercase">2. Télécharger</p>
          <a
            href={`/impression/recu/${d.id}?telecharger=1`}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold whitespace-nowrap text-white dark:bg-white dark:text-ink"
          >
            <Download aria-hidden className="size-4" />
            Télécharger en PDF (A4)
          </a>
        </li>
        <li className="flex flex-col gap-2">
          <p className="text-xs font-bold tracking-wide text-ktgw-green-strong uppercase">3. Envoyer</p>
          <SendReceiptButton id={d.id} sent={Boolean(d.receipt_sent_at)} />
          <p className="text-xs text-muted-foreground">
            {noEmail
              ? "Pas d'e-mail : déposé dans l'espace du donateur s'il a un compte, sinon remettez-le imprimé."
              : `Par e-mail à ${d.email} et dans son espace membre.`}
          </p>
        </li>
      </ol>
      {d.user_id && (
        <Link
          href={`/admin/membres/${d.user_id}`}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border-2 border-border px-4 text-sm font-semibold hover:bg-muted"
        >
          <FolderOpen aria-hidden className="size-4" />
          Dossier du donateur
        </Link>
      )}

      <div className="overflow-x-auto rounded-3xl bg-muted/60 p-4 sm:p-8">
        <div className="mx-auto w-fit">
          <ReceiptDocument d={d} locale={locale} togo={togo} qrSvg={qr} />
        </div>
      </div>
    </>
  );
}
