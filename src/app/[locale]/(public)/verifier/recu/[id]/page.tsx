import { BadgeCheck, CircleX } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/section";
import { receiptNature } from "@/lib/email/messages";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vérification d'un reçu", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dmy = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

/**
 * Page ouverte en scannant le QR code d'un reçu : confirme qu'il a bien été émis par KTGW Togo
 * et en rappelle l'essentiel, pour comparaison avec le document présenté (pas de coordonnées).
 */
export default async function VerifyReceiptPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const { data: d } = UUID.test(id)
    ? await createAdminClient()
        .from("donation_declarations")
        .select("kind, frequency, name, amount_fcfa, item_description, receipt_number, received_at, created_at, status")
        .eq("id", id)
        .eq("status", "traite")
        .not("receipt_number", "is", null)
        .maybeSingle()
    : { data: null };

  const rows: [string, string][] = d
    ? [
        ["N° de reçu", d.receipt_number ?? ""],
        ["Date", dmy(d.received_at ?? d.created_at)],
        ["Donateur", d.name],
        ["Nature", receiptNature(d)],
        d.kind === "nature" ? ["Don", d.item_description ?? "Objets et matériel"] : ["Montant", `${d.amount_fcfa.toLocaleString("fr-FR")} FCFA`],
      ]
    : [];

  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-xl ring-1 ring-foreground/5">
        <Logo className="mx-auto h-20" />
        <p className="mt-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Vérification de reçu</p>
        {d ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl bg-ktgw-green/15 p-6 text-ktgw-green-strong">
            <BadgeCheck aria-hidden className="size-12" />
            <p className="text-2xl font-extrabold">Reçu authentique</p>
            <p className="text-sm text-foreground/80">
              Ce reçu a bien été émis par KTGW Togo. Vérifiez que les informations ci-dessous correspondent au document.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl bg-destructive/10 p-6 text-destructive">
            <CircleX aria-hidden className="size-12" />
            <p className="text-2xl font-extrabold">Reçu inconnu</p>
            <p className="text-sm text-foreground/80">Ce QR code ne correspond à aucun reçu émis par KTGW Togo.</p>
          </div>
        )}
        {d && (
          <dl className="mt-6 grid gap-3 text-left text-sm">
            {rows.map(([label, value], i) => (
              <div key={label} className={i < rows.length - 1 ? "flex justify-between gap-4 border-b pb-2" : "flex justify-between gap-4"}>
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="text-right font-semibold whitespace-pre-line">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          Vérification effectuée le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Lome" }).format(new Date())} sur le registre de
          KTGW Togo.
        </p>
      </div>
    </Container>
  );
}
