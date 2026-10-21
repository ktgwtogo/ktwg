"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit, getStaff } from "@/lib/admin/staff";
import { cardMail } from "@/lib/email/messages";
import { sendTemplate } from "@/lib/email/send";
import type { ActionResult } from "@/lib/member/actions";
import { membershipTypeLabels } from "@/lib/validations/member";
import { cardViewUrl, defaultExpiry, verifyUrl } from "./card";

const FORBIDDEN: ActionResult = { ok: false, error: "La gestion des cartes ne fait pas partie de votre poste." };
const refresh = () => revalidatePath("/[locale]/admin", "layout");

async function cardManager() {
  const staff = await getStaff();
  return staff?.can("cards.manage") ? staff : null;
}

/**
 * Crée la carte d'un membre validé à partir de son dossier (nom, type, photo, naissance).
 * Une éventuelle carte active précédente est révoquée : une seule carte valide par membre.
 */
export async function issueCard(userId: string): Promise<ActionResult & { id?: string }> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const db = staff.supabase;

  const { data: p } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!p) return { ok: false, error: "Membre introuvable." };
  if (p.membership_status !== "validee" || !p.membership_type) return { ok: false, error: "La carte n'est délivrée qu'aux membres dont l'adhésion est validée." };

  await db.from("member_cards").update({ status: "revoquee" }).eq("user_id", userId).eq("status", "active");
  const issued = new Date().toISOString().slice(0, 10);
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email;
  // Numéro de membre ; suffixe si une carte portant ce numéro existe déjà (renouvellement).
  const { count } = await db.from("member_cards").select("id", { count: "exact", head: true }).eq("user_id", userId);
  const base = p.member_number ?? `KTGW-${issued.slice(0, 4)}-${userId.slice(0, 4).toUpperCase()}`;
  const cardNumber = count ? `${base}-${String(count + 1).padStart(2, "0")}` : base;

  const { data, error } = await db
    .from("member_cards")
    .insert({
      user_id: userId,
      card_number: cardNumber,
      full_name: name.slice(0, 120),
      membership_type: p.membership_type,
      birth_date: p.birth_date,
      nationality: p.nationality,
      photo_path: p.photo_path,
      issued_at: issued,
      expires_at: defaultExpiry(issued),
      created_by: staff.user.id,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[cartes] création", error.message);
    return { ok: false, error: "La création de la carte a échoué." };
  }
  await audit(staff, "carte.creee", "member_cards", data.id, { title: cardNumber, name });
  refresh();
  return { ok: true, id: data.id };
}

const cardSchema = z
  .object({
    card_number: z.string().trim().min(3, "Numéro de carte trop court.").max(40),
    full_name: z.string().trim().min(2, "Indiquez le nom.").max(120),
    membership_type: z.enum(["adherent", "membre", "donateur"]),
    birth_date: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
    nationality: z.string().trim().max(80),
    issued_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date d'émission invalide."),
    expires_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de validité invalide."),
    notes: z.string().trim().max(1000),
    photo_path: z.string().nullable(),
  })
  .refine((v) => v.expires_at > v.issued_at, { message: "La fin de validité doit suivre la date d'émission.", path: ["expires_at"] });

/** Correction des données d'une carte (erreur de saisie, photo, dates). */
export async function updateCard(cardId: string, raw: unknown): Promise<ActionResult> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const parsed = cardSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;

  const { data: card } = await staff.supabase.from("member_cards").select("user_id").eq("id", cardId).maybeSingle();
  if (!card) return { ok: false, error: "Carte introuvable." };
  if (v.photo_path && !v.photo_path.startsWith(`${card.user_id}/`)) return { ok: false, error: "Photo invalide." };

  const { error } = await staff.supabase
    .from("member_cards")
    .update({
      card_number: v.card_number,
      full_name: v.full_name,
      membership_type: v.membership_type,
      birth_date: v.birth_date || null,
      nationality: v.nationality || null,
      issued_at: v.issued_at,
      expires_at: v.expires_at,
      notes: v.notes || null,
      photo_path: v.photo_path,
    })
    .eq("id", cardId);
  if (error) return { ok: false, error: error.code === "23505" ? "Ce numéro de carte est déjà utilisé." : "L'enregistrement a échoué." };
  await audit(staff, "carte.modifiee", "member_cards", cardId, { title: v.card_number, name: v.full_name });
  refresh();
  return { ok: true };
}

export async function revokeCard(cardId: string): Promise<ActionResult> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const { error } = await staff.supabase.from("member_cards").update({ status: "revoquee" }).eq("id", cardId);
  if (error) return { ok: false, error: "L'opération a échoué." };
  await audit(staff, "carte.revoquee", "member_cards", cardId);
  refresh();
  return { ok: true };
}

/** Envoie la carte au membre, à l'adresse e-mail de son compte. */
export async function sendCard(cardId: string): Promise<ActionResult> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const db = staff.supabase;
  const { data: card } = await db.from("member_cards").select("*").eq("id", cardId).maybeSingle();
  if (!card || card.status !== "active") return { ok: false, error: "Seule une carte active peut être envoyée." };
  const { data: person } = await db.from("profiles").select("email, first_name").eq("id", card.user_id).maybeSingle();
  if (!person) return { ok: false, error: "Membre introuvable." };

  const mail = cardMail({
    firstName: person.first_name,
    cardNumber: card.card_number,
    typeLabel: membershipTypeLabels[card.membership_type],
    expiresAt: card.expires_at,
    viewUrl: cardViewUrl(),
    verifyUrl: verifyUrl(card.verification_token),
  });
  const sent = await sendTemplate(person.email, mail.subject, mail.content);
  if (!sent) return { ok: false, error: "L'e-mail n'a pas pu partir (vérifiez la configuration Resend)." };

  await db.from("member_cards").update({ sent_at: new Date().toISOString() }).eq("id", cardId);
  await db.from("notifications").insert({ user_id: card.user_id, title: "Votre carte de membre est disponible", body: `Carte n° ${card.card_number}`, link: "/mon-espace/carte" });
  await audit(staff, "carte.envoyee", "member_cards", cardId, { title: card.card_number, email: person.email });
  refresh();
  return { ok: true };
}
