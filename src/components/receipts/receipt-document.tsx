import { Logo } from "@/components/shared/logo";
import { receiptNature } from "@/lib/email/messages";
import { formatDate } from "@/lib/format";
import type { SiteConfigData } from "@/lib/site/types";
import type { Database } from "@/types/database";

type Donation = Database["public"]["Tables"]["donation_declarations"]["Row"];

/** Reçu officiel KTGW (A4) : affiché dans l'administration, l'espace membre et à l'impression. */
export function ReceiptDocument({ d, locale, togo }: { d: Donation; locale: string; togo: SiteConfigData["togo"] }) {
  const inKind = d.kind === "nature";
  return (
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
          KTGW Togo certifie avoir reçu de <strong>{d.name}</strong> {inKind ? "le don en nature suivant :" : "la somme de :"}
        </p>
        {inKind ? (
          <p className="rounded-xl bg-ktgw-green/10 p-6 text-center text-lg font-bold whitespace-pre-line text-ktgw-green-strong">{d.item_description ?? "Objets et matériel"}</p>
        ) : (
          <p className="rounded-xl bg-ktgw-green/10 p-6 text-center text-3xl font-extrabold text-ktgw-green-strong">{d.amount_fcfa.toLocaleString("fr-FR")} FCFA</p>
        )}
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr>
              <th scope="row" className="py-2 text-left font-semibold">Nature</th>
              <td className="py-2">{receiptNature(d)}</td>
            </tr>
            {inKind ? (
              d.amount_fcfa > 0 && (
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold">Valeur estimée</th>
                  <td className="py-2">{d.amount_fcfa.toLocaleString("fr-FR")} FCFA</td>
                </tr>
              )
            ) : (
              <tr>
                <th scope="row" className="py-2 text-left font-semibold">Moyen de paiement</th>
                <td className="py-2">{d.method}</td>
              </tr>
            )}
            {d.reference && !inKind && (
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
  );
}
