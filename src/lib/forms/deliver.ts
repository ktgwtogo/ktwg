import { siteConfig } from "@/config/site";

/**
 * Envoi PROVISOIRE des formulaires, en attendant la Phase 6 (Supabase + Resend).
 * Le message validé est mis en forme puis proposé à l'envoi par WhatsApp ou par e-mail,
 * via les applications du visiteur : aucune donnée n'est stockée par le site.
 */
export type Delivery = { subject: string; text: string; whatsapp: string; mailto: string };

/** `fields` : libellés lisibles → valeurs. Les valeurs vides sont omises. */
export function prepareDelivery(subject: string, fields: Record<string, unknown>): Delivery {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0))
    .map(([label, v]) => `• ${label} : ${Array.isArray(v) ? v.join(", ") : v === true ? "Oui" : String(v)}`);
  const text = `${subject}\n\n${lines.join("\n")}\n\n— Envoyé depuis le site KTGW Togo`;

  const phone = siteConfig.togo.phones[0].e164.replace(/\D/g, "");
  return {
    subject,
    text,
    whatsapp: `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
    mailto: `mailto:${siteConfig.togo.email}?subject=${encodeURIComponent(`[Site KTGW] ${subject}`)}&body=${encodeURIComponent(text)}`,
  };
}
