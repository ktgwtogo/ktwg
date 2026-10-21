import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/records-ui";
import { Logo } from "@/components/shared/logo";
import { redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { getMember } from "@/lib/member/session";
import { getSiteConfig } from "@/lib/site/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reçu", robots: { index: false } };

/** Reçu d'un don ou d'une cotisation encaissés (trésorerie, ou la personne concernée). */
export default async function ReceiptPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const staff = await getStaff();
  const db = staff?.can("donations.manage") ? staff.supabase : member.supabase;

  const { data: d } = await db.from("donation_declarations").select("*").eq("id", id).maybeSingle();
  if (!d || d.status !== "traite" || !d.receipt_number) notFound();
  if (!staff?.can("donations.manage") && d.user_id !== member.user.id) notFound();
  const { togo } = await getSiteConfig();

  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-muted p-6 print:bg-white print:p-0">
      <style>{"@page { size: A4; margin: 18mm } @media print { html, body { background: white } }"}</style>
      <article className="w-full max-w-[180mm] rounded-2xl bg-white p-10 text-ink shadow-xl print:rounded-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-4 border-ktgw-green pb-6">
          <div className="flex items-center gap-4">
            <Logo className="h-16 w-auto" />
            <div>
              <p className="text-xl font-extrabold">KTGW Togo</p>
              <p className="text-sm text-neutral-600">KommTogoGehWeiter Togo — ONG</p>
              <p className="text-sm text-neutral-600">
                {togo.address.street}, {togo.address.city} — {togo.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-ktgw-green-strong">REÇU</p>
            <p className="font-semibold">{d.receipt_number}</p>
            <p className="text-sm text-neutral-600">{formatDate(d.received_at ?? d.created_at, locale)}</p>
          </div>
        </header>

        <section className="mt-8 flex flex-col gap-4 text-base">
          <p>
            KTGW Togo certifie avoir reçu de <strong>{d.name}</strong> la somme de :
          </p>
          <p className="rounded-xl bg-ktgw-green/10 p-6 text-center text-3xl font-extrabold text-ktgw-green-strong">{d.amount_fcfa.toLocaleString("fr-FR")} FCFA</p>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr>
                <th scope="row" className="py-2 text-left font-semibold">Nature</th>
                <td className="py-2 capitalize">{d.kind === "cotisation" ? "Cotisation annuelle" : `Don ${d.frequency.toLowerCase()}`}</td>
              </tr>
              <tr>
                <th scope="row" className="py-2 text-left font-semibold">Moyen de paiement</th>
                <td className="py-2">{d.method}</td>
              </tr>
              {d.reference && (
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold">Référence</th>
                  <td className="py-2">{d.reference}</td>
                </tr>
              )}
              {d.project && (
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold">Affectation</th>
                  <td className="py-2">{d.project}</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-6">Nous vous remercions chaleureusement pour votre soutien à l&apos;éducation et à la formation des jeunes au Togo.</p>
        </section>

        <footer className="mt-16 flex justify-end">
          <div className="text-center">
            <p className="text-sm text-neutral-600">Pour l&apos;association, la trésorerie</p>
            <div className="mt-14 w-56 border-t border-neutral-400" />
          </div>
        </footer>
      </article>
      <PrintButton />
    </main>
  );
}
