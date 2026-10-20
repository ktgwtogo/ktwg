import "server-only";

type Email = { to: string[]; subject: string; text: string; replyTo?: string };

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Équipe destinataire des notifications (EMAIL_TEAM, séparées par des virgules). */
export const teamRecipients = () =>
  (process.env.EMAIL_TEAM ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Envoie un e-mail via l'API Resend. Sans RESEND_API_KEY, n'envoie rien et renvoie false.
 * Une erreur d'envoi n'interrompt jamais l'enregistrement d'une demande.
 */
export async function sendEmail({ to, subject, text, replyTo }: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || to.length === 0) return false;

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;white-space:pre-wrap">${escapeHtml(text)}</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `KTGW Togo <${from}>`, to, subject, text, html, reply_to: replyTo }),
    });
    if (!res.ok) console.error("[email] refus de Resend", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("[email] envoi impossible", error);
    return false;
  }
}
