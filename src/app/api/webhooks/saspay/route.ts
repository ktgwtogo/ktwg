import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NO_EMAIL, sendEmail, teamRecipients } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Données d'un événement `transaction.*` envoyé par SasPay (https://docs.saspay.me/api-reference/webhooks). */
type SasPayTransaction = {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: string;
  fee?: string;
  charged?: string;
  net_amount?: string;
  currency?: string;
  country?: string;
  network?: string;
  msisdn?: string;
};

/** Signature SasPay : HMAC-SHA256 (hex) de « horodatage.corps brut », horodatage à 5 minutes près. */
function verify(raw: string, timestamp: string | null, signature: string | null, secret: string) {
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature.toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

const CRYPTO = /crypto|usdt|usdc|btc|bitcoin|eth|trx|tron|bnb|sol/i;

/** Moyen de paiement enregistré, d'après le réseau et le pays transmis par SasPay. */
const methodFor = (network = "", country = "TG") =>
  CRYPTO.test(network)
    ? "Cryptomonnaie"
    : /card|visa|master/i.test(network)
      ? "Carte bancaire"
      : country.toUpperCase() !== "TG"
        ? "Mobile Money (autre pays)"
        : /moov|flooz/i.test(network)
          ? "Moov Money (Flooz)"
          : "T-Money";

const lastDigits = (phone: string | null | undefined) => (phone ?? "").replace(/\D/g, "").slice(-8);

/**
 * Paiement reçu par le lien SasPay (bouton « Payer maintenant » de la page Faire un don) :
 * le don est enregistré automatiquement comme encaissé, et son reçu généré (envoi au donateur après contrôle).
 * Si le donateur a déjà déclaré ce don (même numéro et même montant), sa déclaration est complétée.
 */
export async function POST(request: Request) {
  const secret = process.env.SASPAY_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook non configuré", { status: 503 });

  const raw = await request.text();
  if (!verify(raw, request.headers.get("x-webhook-timestamp"), request.headers.get("x-webhook-signature"), secret)) {
    return new Response("Signature invalide", { status: 403 });
  }

  let event: { event?: string; data?: SasPayTransaction };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Corps invalide", { status: 400 });
  }
  const t = event.data;
  if (event.event !== "transaction.success" || !t || t.status !== "SUCCESS" || t.type !== "PAIEMENT") {
    return Response.json({ ok: true, ignored: event.event ?? null });
  }

  const amount = Math.round(Number(t.amount));
  if (!Number.isFinite(amount) || amount <= 0) return Response.json({ ok: true, ignored: "montant" });

  const admin = createAdminClient();
  const reference = `SasPay ${t.reference}`.slice(0, 120);

  // Déjà enregistré (SasPay renvoie l'événement en cas d'échec de livraison).
  const { data: existing } = await admin.from("donation_declarations").select("id").eq("reference", reference).maybeSingle();
  if (existing) return Response.json({ ok: true, duplicate: true });

  const method = methodFor(t.network, t.country);
  // Montant hors FCFA (crypto, autre devise) : enregistré « à vérifier » pour que la trésorerie confirme la valeur.
  const inXof = !t.currency || t.currency.toUpperCase() === "XOF";
  const note = `Paiement confirmé automatiquement par SasPay (réf. ${t.reference}${t.network ? `, ${t.network}` : ""}${t.charged ? `, payé ${t.charged} ${t.currency ?? ""}` : ""}${t.net_amount ? `, net reçu ${t.net_amount}` : ""}).`;

  // Déclaration faite par le donateur sur le site, en attente : même montant, même numéro, 7 derniers jours.
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data: candidates } = await admin
    .from("donation_declarations")
    .select("id, phone, admin_notes")
    .eq("status", "nouveau")
    .eq("amount_fcfa", amount)
    .neq("kind", "nature")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  const digits = lastDigits(t.msisdn);
  const match = digits ? (candidates ?? []).find((c) => lastDigits(c.phone) === digits) : undefined;

  let id: string;
  if (match) {
    const { error } = await admin
      .from("donation_declarations")
      .update({ status: inXof ? "traite" : "nouveau", reference, method, admin_notes: [match.admin_notes, note].filter(Boolean).join("\n") })
      .eq("id", match.id);
    if (error) return new Response(error.message, { status: 500 });
    id = match.id;
  } else {
    const { data, error } = await admin
      .from("donation_declarations")
      .insert({
        kind: "don",
        name: "Donateur Mobile Money",
        email: NO_EMAIL,
        phone: t.msisdn ? `+${t.msisdn.replace(/\D/g, "")}` : null,
        amount_fcfa: amount,
        method,
        frequency: "Ponctuel",
        reference,
        admin_notes: inXof ? note : `${note} Montant en ${t.currency} : vérifiez sa valeur en FCFA avant de confirmer.`,
        status: inXof ? "traite" : "nouveau",
      })
      .select("id")
      .single();
    if (error) return new Response(error.message, { status: 500 });
    id = data.id;
  }

  await admin.from("audit_log").insert({
    actor_id: null,
    action: "don.saspay",
    entity: "donation_declarations",
    entity_id: id,
    details: { title: `${amount} FCFA`, reference: t.reference, matched: Boolean(match) },
  });
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ktgw.tg";
  await sendEmail({
    to: teamRecipients(),
    subject: `[Site KTGW] Don reçu par SasPay : ${amount.toLocaleString("fr-FR")} FCFA`,
    text: `Un paiement de ${amount.toLocaleString("fr-FR")} FCFA (${method}) vient d'être reçu par le lien SasPay${t.msisdn ? ` depuis le +${t.msisdn}` : ""}.\n${match ? "Il correspond à une déclaration faite sur le site, qui a été complétée." : "Aucune déclaration correspondante : le don est enregistré au nom de « Donateur Mobile Money »."}\n\nLe reçu est généré : vérifiez-le puis envoyez-le ici : ${site}/admin/dons/recu/${id}`,
  });
  revalidatePath("/[locale]/admin", "layout");
  return Response.json({ ok: true, id });
}
