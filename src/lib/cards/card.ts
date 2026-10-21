import "server-only";
import QRCode from "qrcode";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type MemberCard = Database["public"]["Tables"]["member_cards"]["Row"];

/** Durée de validité d'une carte de membre. */
export const CARD_VALIDITY_YEARS = 5;

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ktgw.tg";
export const verifyUrl = (token: string) => `${site()}/verifier/${token}`;
export const cardViewUrl = () => `${site()}/mon-espace/carte`;

/** Date d'expiration par défaut : 5 ans après l'émission (AAAA-MM-JJ). */
export function defaultExpiry(issuedAt: string) {
  const d = new Date(`${issuedAt}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + CARD_VALIDITY_YEARS);
  return d.toISOString().slice(0, 10);
}

/** QR code (SVG) menant à la page de vérification de la carte. */
export function cardQrSvg(token: string) {
  return QRCode.toString(verifyUrl(token), {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0f5c2a", light: "#ffffff" },
  });
}

/** URL temporaire de la photo de la carte (bucket privé « avatars »). */
export async function cardPhotoUrl(db: SupabaseClient<Database>, path: string | null) {
  if (!path) return null;
  const { data } = await db.storage.from("avatars").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export const cardStatus = (card: Pick<MemberCard, "status" | "expires_at">) =>
  card.status === "revoquee" ? "revoquee" : card.expires_at < new Date().toISOString().slice(0, 10) ? "expiree" : "valide";

export const cardStatusLabels = {
  valide: ["Valide", "bg-ktgw-green/15 text-ktgw-green-strong"],
  expiree: ["Expirée", "bg-ktgw-sun/20 text-ktgw-orange"],
  revoquee: ["Révoquée", "bg-destructive/10 text-destructive"],
} as const;
