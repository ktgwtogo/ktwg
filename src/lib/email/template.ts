import "server-only";
import { getSiteConfig } from "@/lib/site/settings";

/**
 * Modèle d'e-mail KTGW Togo : logo, bandeau aux couleurs de l'ONG, contenu, coordonnées.
 * Mise en page en tableaux et styles en ligne, pour un rendu fiable dans Gmail, Outlook, etc.
 */

export type EmailRow = [label: string, value: string];
export type EmailContent = {
  /** Titre affiché dans le bandeau vert. */
  title: string;
  /** Salutation, ex. « Bonjour Ama, ». */
  greeting?: string;
  /** Paragraphes d'introduction. */
  paragraphs: string[];
  /** Récapitulatif en tableau (libellé / valeur). */
  rows?: EmailRow[];
  /** Encadré mis en valeur (montant, numéro…). */
  highlight?: { label: string; value: string };
  /** Bouton d'action. */
  cta?: { label: string; href: string };
  /** Paragraphes de conclusion. */
  closing?: string[];
  /** Mention en petit sous la signature. */
  note?: string;
};

const GREEN = "#187a34";
const GREEN_DARK = "#0f5c2a";
const RED = "#c7361f";
const SUN = "#f9c23c";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ktgw.tg";

/** Prénom affichable sans risque (pas d'adresse, de lien ni de balise). */
export function safeName(name: string | null | undefined) {
  const n = (name ?? "").trim().split(/\s+/)[0] ?? "";
  return n && n.length <= 40 && !/[@/:<>]|www\./i.test(n) ? n : "";
}

/** Construit l'e-mail en HTML et en texte brut (même contenu). */
export async function renderEmail(c: EmailContent): Promise<{ html: string; text: string }> {
  const { togo } = await getSiteConfig();
  const site = siteUrl();
  const phone = togo.phones[0]?.display ?? "";
  const address = `${togo.address.street}, ${togo.address.district}, ${togo.address.city} – ${togo.address.country}`;
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1f2933">${escapeHtml(t)}</p>`;

  const rows = c.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px">
        ${c.rows
          .map(
            ([label, value], i) =>
              `<tr style="background:${i % 2 ? "#ffffff" : "#f7faf7"}"><td style="padding:10px 14px;font-size:13px;color:#52606d;width:42%;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 14px;font-size:14px;color:#1f2933;font-weight:600">${escapeHtml(value)}</td></tr>`
          )
          .join("")}
      </table>`
    : "";

  const highlight = c.highlight
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px"><tr><td style="background:#eef7f0;border-left:4px solid ${GREEN};border-radius:6px;padding:16px 18px">
        <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#52606d">${escapeHtml(c.highlight.label)}</div>
        <div style="font-size:26px;font-weight:800;color:${GREEN_DARK};margin-top:4px">${escapeHtml(c.highlight.value)}</div>
      </td></tr></table>`
    : "";

  const cta = c.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 22px"><tr><td style="background:${RED};border-radius:10px">
        <a href="${escapeHtml(c.cta.href)}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">${escapeHtml(c.cta.label)}</a>
      </td></tr></table>`
    : "";

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(c.title)}</title></head>
<body style="margin:0;padding:0;background:#f2f4f1">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f1;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
        <tr><td style="padding:22px 28px;background:#ffffff" align="left">
          <img src="${site}/images/logo-ktgw.png" width="120" alt="KTGW Togo" style="display:block;height:auto;border:0">
        </td></tr>
        <tr><td style="height:5px;line-height:5px;font-size:0;background:linear-gradient(90deg,${RED},${SUN},${GREEN});background-color:${GREEN}">&nbsp;</td></tr>
        <tr><td style="background:${GREEN_DARK};padding:20px 28px">
          <h1 style="margin:0;font-size:21px;line-height:1.3;color:#ffffff;font-weight:800">${escapeHtml(c.title)}</h1>
        </td></tr>
        <tr><td style="padding:28px">
          ${c.greeting ? p(c.greeting) : ""}
          ${c.paragraphs.map(p).join("")}
          ${highlight}
          ${rows}
          ${cta}
          ${(c.closing ?? []).map(p).join("")}
          <p style="margin:18px 0 0;font-size:15px;line-height:1.6;color:#1f2933">Bien cordialement,<br><strong>L'équipe KTGW Togo</strong></p>
          ${c.note ? `<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#7b8794">${escapeHtml(c.note)}</p>` : ""}
        </td></tr>
        <tr><td style="background:#1a1a1a;padding:20px 28px;color:#cbd2d9;font-size:12px;line-height:1.6">
          <strong style="color:#ffffff">KTGW Togo — KommTogoGehWeiter Togo</strong><br>
          ONG d'éducation et de formation professionnelle, depuis 2008<br>
          ${escapeHtml(address)}<br>
          ${escapeHtml(phone)} · <a href="mailto:${escapeHtml(togo.email)}" style="color:${SUN};text-decoration:none">${escapeHtml(togo.email)}</a> · <a href="${site}" style="color:${SUN};text-decoration:none">${site.replace(/^https?:\/\//, "")}</a>
        </td></tr>
      </table>
      <p style="margin:14px 0 0;font-size:11px;color:#9aa5b1;font-family:Arial,Helvetica,sans-serif">Cet e-mail vous est adressé suite à une démarche effectuée sur le site de KTGW Togo.</p>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    c.title.toUpperCase(),
    "",
    c.greeting ?? "",
    ...c.paragraphs,
    c.highlight ? `${c.highlight.label} : ${c.highlight.value}` : "",
    ...(c.rows ?? []).map(([l, v]) => `• ${l} : ${v}`),
    c.cta ? `${c.cta.label} : ${c.cta.href}` : "",
    ...(c.closing ?? []),
    "",
    "Bien cordialement,",
    "L'équipe KTGW Togo",
    c.note ?? "",
    "",
    "—",
    `KTGW Togo · ${address}`,
    `${phone} · ${togo.email} · ${site}`,
  ]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");

  return { html, text };
}
