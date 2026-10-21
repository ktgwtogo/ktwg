import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/records-ui";
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
export default async function ReceiptPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
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
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-muted p-6 print:bg-white print:p-0">
      <style>{"@page { size: A4; margin: 18mm } @media print { html, body { background: white } }"}</style>
      <ReceiptDocument d={d} locale={locale} togo={togo} />
      <div className="flex flex-col items-center gap-2 print:hidden">
        <PrintButton label="Télécharger en PDF / imprimer" />
        <p className="text-sm text-muted-foreground">Choisissez « Enregistrer au format PDF » comme imprimante pour télécharger le reçu.</p>
      </div>
    </main>
  );
}
