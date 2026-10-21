"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/member/actions";
import { donationMethods, getInbox, submissionStatuses } from "./records";
import { audit, getStaff } from "./staff";

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
  refresh();
  return { ok: true };
}

const manualSchema = z.object({
  kind: z.enum(["don", "cotisation"]),
  name: z.string().trim().min(2, "Indiquez le nom.").max(120),
  email: z.union([z.literal(""), z.email("E-mail invalide.")]),
  phone: z.string().trim().max(30).optional(),
  amount: z.coerce.number().int().positive("Montant invalide.").max(1_000_000_000),
  method: z.enum(donationMethods),
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  project: z.string().trim().max(120).optional(),
  reference: z.string().trim().max(80).optional(),
});

/** Saisie par la trésorerie d'un don ou d'une cotisation reçus directement (déjà encaissés). */
export async function recordPayment(raw: unknown): Promise<ActionResult & { id?: string }> {
  const staff = await getStaff();
  if (!staff?.can("donations.manage")) return FORBIDDEN;
  const parsed = manualSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;

  const { data, error } = await staff.supabase
    .from("donation_declarations")
    .insert({
      kind: v.kind,
      name: v.name,
      email: v.email || "non-communique@ktgw.tg",
      phone: v.phone || null,
      amount_fcfa: v.amount,
      method: v.method,
      frequency: "Ponctuel",
      project: v.project || null,
      reference: v.reference || null,
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
  await audit(staff, "don.saisi", "donation_declarations", data.id, { title: `${v.kind} ${v.amount} FCFA`, name: v.name });
  refresh();
  return { ok: true, id: data.id };
}
