import "server-only";
import { renderEmail, type EmailContent } from "./template";

type Email = { to: string[]; subject: string; text: string; html?: string; replyTo?: string };
type BatchMessage = { to: string; subject: string; text: string; html?: string };

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Version HTML minimale d'un texte brut (e-mails internes à l'équipe). */
const plainHtml = (text: string) =>
  `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;white-space:pre-wrap">${escapeHtml(text)}</div>`;

/** Équipe destinataire des notifications (EMAIL_TEAM, séparées par des virgules). */
export const teamRecipients = () =>
  (process.env.EMAIL_TEAM ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Adresse enregistrée quand la trésorerie saisit un paiement sans e-mail : on n'y envoie rien. */
export const NO_EMAIL = "non-communique@ktgw.tg";
const isDeliverable = (email: string) => email !== NO_EMAIL && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

/**
 * Envoi groupé : un e-mail individuel par destinataire (personne ne voit les autres adresses),
 * par lots de 100 via l'API batch de Resend. Renvoie le nombre d'e-mails acceptés.
 */
export async function sendBatch(messages: BatchMessage[]): Promise<number> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !messages.length) return 0;
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100).map((m) => ({
      from: `KTGW Togo <${from}>`,
      to: [m.to],
      subject: m.subject,
      text: m.text,
      html: m.html ?? plainHtml(m.text),
    }));
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      });
      if (res.ok) sent += chunk.length;
      else console.error("[email] lot refusé par Resend", res.status, await res.text());
    } catch (error) {
      console.error("[email] lot impossible", error);
    }
  }
  return sent;
}

/**
 * Envoie un e-mail via l'API Resend. Sans RESEND_API_KEY, n'envoie rien et renvoie false.
 * Une erreur d'envoi n'interrompt jamais l'enregistrement d'une demande.
 */
export async function sendEmail({ to, subject, text, html, replyTo }: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const recipients = to.filter(Boolean);
  if (!apiKey || !from || recipients.length === 0) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `KTGW Togo <${from}>`, to: recipients, subject, text, html: html ?? plainHtml(text), reply_to: replyTo }),
    });
    if (!res.ok) console.error("[email] refus de Resend", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("[email] envoi impossible", error);
    return false;
  }
}

/** Envoie un e-mail au modèle KTGW (logo, bandeau, coordonnées). */
export async function sendTemplate(to: string, subject: string, content: EmailContent, replyTo?: string) {
  if (!isDeliverable(to)) return false;
  const { html, text } = await renderEmail(content);
  return sendEmail({ to: [to], subject, text, html, replyTo });
}
