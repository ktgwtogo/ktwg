import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutoPrint, PrintButton } from "@/components/admin/records-ui";
import { ReceiptDocument } from "@/components/receipts/receipt-document";
import { redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { getMember } from "@/lib/member/session";
import { getSiteConfig } from "@/lib/site/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reçu", robots: { index: false } };

/**
 * Reçu imprimable / PDF. Trésorerie et présidence : dès sa génération.
 * Donateur : une fois le reçu envoyé (la RLS limite aux dons de son compte ou de son e-mail).
 */
export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ telecharger?: string }>;
}) {
  const { locale, id } = await params;
  const { telecharger } = await searchParams;
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const staff = await getStaff();
  const treasury = Boolean(staff?.can("donations.manage"));
  const db = treasury ? staff!.supabase : member.supabase;

  const { data: d } = await db.from("donation_declarations").select("*").eq("id", id).maybeSingle();
  if (!d || d.status !== "traite" || !d.receipt_number) notFound();
  if (!treasury && !d.receipt_sent_at) notFound();
  const { togo } = await getSiteConfig();

  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-muted p-6 print:block print:min-h-0 print:bg-white print:p-0">
      <style>{"@page { size: A4 portrait; margin: 0 } @media print { html, body { background: white; margin: 0 } }"}</style>
      {telecharger && <AutoPrint />}
      <div className="flex flex-col items-center gap-2 print:hidden">
        <PrintButton label="Télécharger le reçu en PDF (A4)" />
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Dans la fenêtre d&apos;impression, choisissez « Enregistrer au format PDF », format A4, échelle 100 %, sans marges.
        </p>
      </div>
      <div className="max-w-full overflow-x-auto print:overflow-visible">
        <ReceiptDocument d={d} locale={locale} togo={togo} />
      </div>
    </main>
  );
}
