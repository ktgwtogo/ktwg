"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/member/actions";
import { donationMethods, getInbox, submissionStatuses } from "./records";
import { audit, getStaff } from "./staff";
import { receiptMail, receiptNature } from "@/lib/email/messages";
import { createAdminClient } from "@/lib/supabase/admin";
import { NO_EMAIL, sendTemplate } from "@/lib/email/send";

const FORBIDDEN: ActionResult = { ok: false, error: "Cette action ne fait pas partie de votre poste." };
const refresh = () => revalidatePath("/[locale]/admin", "layout");
const statusValues = submissionStatuses.map((s) => s.value) as [string, ...string[]];

/** Change le statut et les notes internes d'une demande reçue par un formulaire. */
export async function updateSubmission(inboxId: string, id: string, status: string, notes: string): Promise<ActionResult> {
  const inbox = getInbox(inboxId);
  const staff = await getStaff();
  if (!inbox || !staff?.can(inbox.permission)) return FORBIDDEN;
  if (!statusValues.includes(status)) return { ok: false, error: "Statut invalide." };

  const { error } = await staff.supabase
    .from(inbox.table as "contact_messages")
    .update({ status: status as never, admin_notes: notes.slice(0, 2000) || null })
    .eq("id", id);
  if (error) return { ok: false, error: "L'enregistrement a échoué." };
  await audit(staff, "demande.traitee", inbox.table, id, { title: inbox.label, note: status });
  refresh();
  return { ok: true };
}

/** Confirme la réception d'un paiement : attribue un numéro de reçu (trésorerie). */
export async function confirmDonation(id: string, confirmed: boolean): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff?.can("donations.manage")) return FORBIDDEN;
  const { error } = await staff.supabase
    .from("donation_declarations")
    .update({ status: confirmed ? "traite" : "archive" })
    .eq("id", id);
  if (error) return { ok: false, error: "L'enregistrement a échoué." };
  await audit(staff, confirmed ? "don.confirme" : "don.rejete", "donation_declarations", id);
  if (confirmed) await sendReceipt(staff, id);
  refresh();
  return { ok: true };
}

const manualSchema = z
  .object({
    kind: z.enum(["don", "cotisation", "nature"]),
    name: z.string().trim().min(2, "Indiquez le nom.").max(120),
    email: z.union([z.literal(""), z.email("E-mail invalide.")]),
    phone: z.string().trim().max(30).optional(),
    amount: z.union([z.literal(""), z.coerce.number().int().min(0, "Montant invalide.").max(1_000_000_000)]),
    method: z.enum(donationMethods),
    receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
    project: z.string().trim().max(120).optional(),
    reference: z.string().trim().max(80).optional(),
    items: z.string().trim().max(2000).optional(),
  })
  .refine((v) => v.kind === "nature" || Number(v.amount) > 0, { message: "Indiquez le montant reçu.", path: ["amount"] })
  .refine((v) => v.kind !== "nature" || (v.items ?? "").length >= 3, { message: "Décrivez les objets ou le matériel reçus.", path: ["items"] });

/** Saisie par la trésorerie d'un don (argent ou nature) ou d'une cotisation déjà reçus : reçu généré et envoyé. */
export async function recordPayment(raw: unknown): Promise<ActionResult & { id?: string }> {
  const staff = await getStaff();
  if (!staff?.can("donations.manage")) return FORBIDDEN;
  const parsed = manualSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  const amount = Number(v.amount) || 0;

  // Rattachement au compte de la personne si l'adresse e-mail est connue.
  const { data: account } = v.email ? await staff.supabase.from("profiles").select("id").eq("email", v.email.toLowerCase()).maybeSingle() : { data: null };

  const { data, error } = await staff.supabase
    .from("donation_declarations")
    .insert({
      kind: v.kind,
      name: v.name,
      email: v.email ? v.email.toLowerCase() : NO_EMAIL,
      phone: v.phone || null,
      amount_fcfa: amount,
      method: v.kind === "nature" ? "En nature" : v.method,
      frequency: "Ponctuel",
      project: v.project || null,
      reference: v.reference || null,
      item_description: v.kind === "nature" ? v.items || null : null,
      user_id: account?.id ?? null,
      status: "traite",
      received_at: v.receivedAt,
      recorded_by: staff.user.id,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[trésorerie] saisie", error.message);
    return { ok: false, error: "L'enregistrement a échoué." };
  }
  await audit(staff, "don.saisi", "donation_declarations", data.id, { title: `${v.kind} ${amount} FCFA`, name: v.name });
  await sendReceipt(staff, data.id);
  refresh();
  return { ok: true, id: data.id };
}

/** Renvoie le reçu par e-mail et le dépose dans l'espace de la personne (notification). */
export async function resendReceipt(id: string): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff?.can("donations.manage")) return FORBIDDEN;
  const ok = await sendReceipt(staff, id);
  refresh();
  return ok ? { ok: true } : { ok: false, error: "Le reçu n'a pas pu être envoyé (adresse e-mail absente ou configuration Resend)." };
}

/**
 * Reçu officiel : e-mail au modèle KTGW et notification dans l'espace membre
 * (compte rattaché ou adresse e-mail identique). Renvoie true si l'e-mail est parti.
 */
async function sendReceipt(staff: NonNullable<Awaited<ReturnType<typeof getStaff>>>, id: string) {
  const { data: d } = await staff.supabase.from("donation_declarations").select("*").eq("id", id).maybeSingle();
  if (!d?.receipt_number) return false;
  const mail = receiptMail({ ...d, receipt_number: d.receipt_number });
  const sent = await sendTemplate(d.email, mail.subject, mail.content);

  const admin = createAdminClient();
  const { data: account } = d.user_id
    ? { data: { id: d.user_id } }
    : await admin.from("profiles").select("id").eq("email", d.email.toLowerCase()).maybeSingle();
  if (account) {
    await admin.from("notifications").insert({
      user_id: account.id,
      title: `Votre reçu ${d.receipt_number} est disponible`,
      body: receiptNature(d),
      link: "/mon-espace/recus",
    });
  }
  await admin.from("donation_declarations").update({ receipt_sent_at: new Date().toISOString() }).eq("id", id);
  if (sent) await audit(staff, "recu.envoye", "donation_declarations", id, { title: d.receipt_number, email: d.email });
  return sent || Boolean(account);
}
