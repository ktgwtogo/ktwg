"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { sendEmail, teamRecipients } from "@/lib/email/send";
import { formDefinitions, type FormContext, type FormDefinition, type FormKind } from "@/lib/forms/definitions";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SubmitResult =
  | { ok: true }
  /** `fallback` : le serveur n'a pas pu enregistrer, le visiteur peut envoyer par WhatsApp / e-mail. */
  | { ok: false; error: string; fallback?: boolean };

type Meta = { context?: FormContext; turnstileToken?: string; locale?: string };

const FAILED: SubmitResult = {
  ok: false,
  fallback: true,
  error: "L'envoi n'a pas abouti. Vous pouvez nous transmettre votre demande par WhatsApp ou par e-mail ci-dessous.",
};

const isConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

/** Point d'entrée unique des formulaires publics. */
export async function submitForm(kind: FormKind, raw: unknown, meta: Meta = {}): Promise<SubmitResult> {
  const def = formDefinitions[kind] as unknown as FormDefinition<Record<string, unknown>> | undefined;
  if (!def) return { ok: false, error: "Formulaire inconnu." };

  const parsed = def.schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Certains champs sont invalides. Vérifiez le formulaire." };
  const values = parsed.data;

  // Robot (champ piège rempli) : faux succès, rien n'est enregistré.
  if (values[def.honeypot]) return { ok: true };
  if (!isConfigured()) return FAILED;

  const ip = await clientIp();
  if (!(await verifyTurnstile(meta.turnstileToken, ip)))
    return { ok: false, error: "La vérification anti-robot a échoué. Patientez quelques secondes puis réessayez." };

  const admin = createAdminClient();
  const key = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${kind}:${ip ?? "inconnue"}`).digest("hex");
  const { data: allowed, error: limitError } = await admin.rpc("rate_limit_hit", { p_key: key, p_max: 5, p_window: "10 minutes" });
  // Si la fonction n'est pas encore installée, on n'empêche pas l'envoi.
  if (limitError) console.error("[forms] limitation indisponible", limitError.message);
  else if (!allowed) return { ok: false, error: "Trop d'envois en peu de temps. Merci de réessayer dans quelques minutes." };

  const context: FormContext = { ...meta.context };
  const locale = ["fr", "de", "en"].includes(meta.locale ?? "") ? meta.locale! : "fr";

  try {
    if (kind === "newsletter") return await subscribeNewsletter(admin, String(values.email).toLowerCase(), locale);

    const row: Record<string, unknown> = { ...def.row(values), locale };
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (user) row.user_id = user.id;

    if (kind === "event") {
      const { data: event } = await admin
        .from("events")
        .select("id, title")
        .eq("slug", context.eventSlug ?? "")
        .eq("published", true)
        .maybeSingle();
      if (!event) return FAILED;
      row.event_id = event.id;
      context.eventTitle = event.title;
    }

    const { error } = await admin.from(def.table as "contact_messages").insert(row as never);
    if (error?.code === "23505") return { ok: false, error: "Vous êtes déjà inscrit·e à cet événement avec cette adresse e-mail." };
    if (error) {
      console.error(`[forms] insertion ${def.table}`, error.message);
      return FAILED;
    }

    const submitter = typeof values.email === "string" && values.email ? values.email : undefined;
    await Promise.all([
      notifyTeam(def.subject(values, context), def.fields(values, context), submitter),
      submitter &&
        sendEmail({
          to: [submitter],
          subject: "Nous avons bien reçu votre demande — KTGW Togo",
          // Aucun contenu saisi par le visiteur : l'accusé ne peut pas servir à relayer du spam.
          text: `Bonjour,\n\nNous avons bien reçu ${def.label} et vous remercions de votre confiance.\nNotre équipe vous répondra dans les meilleurs délais.\n\nL'équipe KTGW Togo\n${siteUrl()}`,
        }),
    ]);
    return { ok: true };
  } catch (error) {
    console.error(`[forms] ${kind}`, error);
    return FAILED;
  }
}

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function notifyTeam(subject: string, fields: Record<string, unknown>, replyTo?: string) {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0))
    .map(([label, v]) => `• ${label} : ${Array.isArray(v) ? v.join(", ") : v === true ? "Oui" : String(v)}`);
  return sendEmail({
    to: teamRecipients(),
    subject: `[Site KTGW] ${subject}`,
    text: `${subject}\n\n${lines.join("\n")}\n\nÀ traiter dans le tableau de bord : ${siteUrl()}/admin`,
    replyTo,
  });
}

/** Double opt-in : l'adresse n'est active qu'après un clic sur le lien de confirmation. */
async function subscribeNewsletter(admin: ReturnType<typeof createAdminClient>, email: string, locale: string): Promise<SubmitResult> {
  const { data: existing } = await admin
    .from("newsletter_subscribers")
    .select("token, confirmed_at, unsubscribed_at")
    .eq("email", email)
    .maybeSingle();

  // Déjà abonné·e : même réponse, sans révéler que l'adresse est connue.
  if (existing?.confirmed_at && !existing.unsubscribed_at) return { ok: true };

  let token = existing?.token;
  if (existing) {
    await admin.from("newsletter_subscribers").update({ unsubscribed_at: null, confirmed_at: null, locale }).eq("email", email);
  } else {
    const { data, error } = await admin.from("newsletter_subscribers").insert({ email, locale }).select("token").single();
    if (error) {
      console.error("[forms] newsletter", error.message);
      return FAILED;
    }
    token = data.token;
  }

  await sendEmail({
    to: [email],
    subject: "Confirmez votre inscription à la newsletter KTGW Togo",
    text: `Bonjour,\n\nPour recevoir les nouvelles de KTGW Togo, confirmez votre inscription en ouvrant ce lien :\n${siteUrl()}/api/newsletter?action=confirm&token=${token}\n\nVous n'êtes pas à l'origine de cette demande ? Ignorez simplement cet e-mail.\n\nL'équipe KTGW Togo`,
  });
  return { ok: true };
}
