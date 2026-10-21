import "server-only";
import QRCode from "qrcode";

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ktgw.tg";

/** Page publique confirmant l'authenticité d'un reçu (l'identifiant du don, aléatoire, sert de clé). */
export const receiptVerifyUrl = (id: string) => `${site()}/verifier/recu/${id}`;

/** QR code (SVG) imprimé sur le reçu, menant à sa page de vérification. */
export function receiptQrSvg(id: string) {
  return QRCode.toString(receiptVerifyUrl(id), {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0f5c2a", light: "#ffffff" },
  });
}
