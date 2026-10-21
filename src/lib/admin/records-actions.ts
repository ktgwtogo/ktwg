"use server";

import { z } from "zod";
import type { ActionResult } from "@/lib/member/actions";
import { runOrRequest } from "./approvals";
import { donationMethods, getInbox, submissionStatuses } from "./records";
import { getStaff } from "./staff";

type Result = ActionResult & { pending?: boolean };
const FORBIDDEN: Result = { ok: false, error: "Cette action ne fait pas partie de votre poste." };
const statusValues = submissionStatuses.map((s) => s.value) as [string, ...string[]];

/** Change le statut et les notes internes d'une demande reçue par un formulaire. */
export async function updateSubmission(inboxId: string, id: string, status: string, notes: string): Promise<Result> {
  const inbox = getInbox(inboxId);
  const staff = await getStaff();
  if (!inbox || !staff?.can(inbox.permission)) return FORBIDDEN;
  if (!statusValues.includes(status)) return { ok: false, error: "Statut invalide." };
  const label = submissionStatuses.find((s) => s.value === status)?.label ?? status;
  return runOrRequest(staff, "submission.update", `${inbox.label} : passer en « ${label} »`, { inbox: inboxId, id, status, notes });
}

/** Confirme la réception d'un paiement (le reçu est généré, sans envoi) ou écarte la déclaration. */
export async function confirmDonation(id: string, confirmed: boolean): Promise<Result> {
  const staff = await getStaff();
  if (!staff?.can("donations.manage")) return FORBIDDEN;
  const { data: d } = await staff.supabase.from("donation_declarations").select("name, amount_fcfa, kind").eq("id", id).maybeSingle();
  const what = d ? `${d.name} — ${d.kind === "nature" ? "don en nature" : `${d.amount_fcfa.toLocaleString("fr-FR")} FCFA`}` : "déclaration";
  return runOrRequest(staff, "donation.confirm", confirmed ? `Confirmer le paiement : ${what}` : `Écarter : ${what}`, { id, confirmed });
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

/** Enregistre un don (argent ou nature) ou une cotisation reçus : le reçu est généré, à envoyer ensuite. */
export async function recordPayment(raw: unknown): Promise<Result> {
  const staff = await getStaff();
  if (!staff?.can("donations.manage")) return FORBIDDEN;
  const parsed = manualSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  const what = v.kind === "nature" ? "don en nature" : `${v.kind} de ${Number(v.amount).toLocaleString("fr-FR")} FCFA`;
  return runOrRequest(staff, "donation.record", `Enregistrer : ${what} — ${v.name}`, { ...v, amount: Number(v.amount) || 0 });
}

/** Envoie le reçu au donateur (e-mail + espace membre), après l'avoir consulté. */
export async function sendReceipt(id: string): Promise<Result> {
  const staff = await getStaff();
  if (!staff?.can("donations.manage")) return FORBIDDEN;
  const { data: d } = await staff.supabase.from("donation_declarations").select("receipt_number, name").eq("id", id).maybeSingle();
  if (!d?.receipt_number) return { ok: false, error: "Le reçu n'est pas encore généré." };
  return runOrRequest(staff, "receipt.send", `Envoyer le reçu ${d.receipt_number} à ${d.name}`, { id });
}
