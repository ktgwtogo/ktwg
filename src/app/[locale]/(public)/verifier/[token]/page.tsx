import { createClient } from "@supabase/supabase-js";
import { BadgeCheck, CircleAlert, CircleX } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/section";
import { membershipTypeLabels } from "@/lib/validations/member";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vérification d'une carte de membre", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dmy = (iso: string) => iso.split("-").reverse().join("/");

/** Page ouverte en scannant le QR code d'une carte : confirme (ou non) sa validité. */
export default async function VerifyCardPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  let card: Database["public"]["Functions"]["verify_member_card"]["Returns"][number] | null = null;
  if (UUID.test(token) && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const db = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const { data } = await db.rpc("verify_member_card", { p_token: token });
    card = data?.[0] ?? null;
  }

  const state = !card
    ? { icon: CircleX, tone: "bg-destructive/10 text-destructive", title: "Carte inconnue", text: "Ce QR code ne correspond à aucune carte de membre KTGW Togo." }
    : card.status === "valide"
      ? { icon: BadgeCheck, tone: "bg-ktgw-green/15 text-ktgw-green-strong", title: "Carte valide", text: "Cette personne est membre de KTGW Togo." }
      : card.status === "expiree"
        ? { icon: CircleAlert, tone: "bg-ktgw-sun/20 text-ktgw-orange", title: "Carte expirée", text: "Cette carte n'est plus valable : son titulaire doit la renouveler." }
        : { icon: CircleX, tone: "bg-destructive/10 text-destructive", title: "Carte révoquée", text: "Cette carte a été annulée par l'association et n'est plus valable." };

  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-xl ring-1 ring-foreground/5">
        <Logo className="mx-auto h-20" />
        <p className="mt-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Vérification de carte de membre</p>
        <div className={`mt-6 flex flex-col items-center gap-2 rounded-2xl p-6 ${state.tone}`}>
          <state.icon aria-hidden className="size-12" />
          <p className="text-2xl font-extrabold">{state.title}</p>
          <p className="text-sm text-foreground/80">{state.text}</p>
        </div>
        {card && (
          <dl className="mt-6 grid gap-3 text-left text-sm">
            <div className="flex justify-between gap-4 border-b pb-2">
              <dt className="text-muted-foreground">Titulaire</dt>
              <dd className="font-semibold">{card.full_name}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b pb-2">
              <dt className="text-muted-foreground">N° de carte</dt>
              <dd className="font-semibold">{card.card_number}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b pb-2">
              <dt className="text-muted-foreground">Qualité</dt>
              <dd className="font-semibold">{membershipTypeLabels[card.membership_type]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Validité</dt>
              <dd className="font-semibold">
                du {dmy(card.issued_at)} au {dmy(card.expires_at)}
              </dd>
            </div>
          </dl>
        )}
        <p className="mt-6 text-xs text-muted-foreground">Vérification effectuée le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Lome" }).format(new Date())} sur le registre de KTGW Togo.</p>
      </div>
    </Container>
  );
}
