"use server";

import { z } from "zod";
import { runOrRequest } from "@/lib/admin/approvals";
import { getStaff } from "@/lib/admin/staff";
import type { ActionResult } from "@/lib/member/actions";

type Result = ActionResult & { pending?: boolean };
const FORBIDDEN: Result = {
  ok: false,
  error: "La gestion des cartes ne fait pas partie de votre poste.",
};

async function cardManager() {
  const staff = await getStaff();
  return staff?.can("cards.manage") ? staff : null;
}

/** Crée la carte d'un membre validé (une éventuelle carte active précédente est révoquée). */
export async function issueCard(userId: string): Promise<Result> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const { data: p } = await staff.supabase.from("profiles").select("first_name, last_name, full_name, email, membership_status").eq("id", userId).maybeSingle();
  if (!p) return { ok: false, error: "Membre introuvable." };
  if (p.membership_status !== "validee")
    return {
      ok: false,
      error: "La carte n'est délivrée qu'aux membres dont l'adhésion est validée.",
    };
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email;
  return runOrRequest(staff, "card.issue", `Créer la carte de membre de ${name}`, { userId });
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
  .refine((v) => v.expires_at > v.issued_at, {
    message: "La fin de validité doit suivre la date d'émission.",
    path: ["expires_at"],
  });

/** Correction des données d'une carte (erreur de saisie, photo, dates). */
export async function updateCard(cardId: string, raw: unknown): Promise<Result> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const parsed = cardSchema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
    };
  const v = parsed.data;
  const { data: card } = await staff.supabase.from("member_cards").select("user_id").eq("id", cardId).maybeSingle();
  if (!card) return { ok: false, error: "Carte introuvable." };
  if (v.photo_path && !v.photo_path.startsWith(`${card.user_id}/`)) return { ok: false, error: "Photo invalide." };
  return runOrRequest(staff, "card.update", `Corriger la carte ${v.card_number} (${v.full_name})`, { cardId, values: v });
}

export async function revokeCard(cardId: string): Promise<Result> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const { data: card } = await staff.supabase.from("member_cards").select("card_number, full_name").eq("id", cardId).maybeSingle();
  if (!card) return { ok: false, error: "Carte introuvable." };
  return runOrRequest(staff, "card.revoke", `Révoquer la carte ${card.card_number} (${card.full_name})`, { cardId });
}

/** Transmet la carte au membre pour vérification : espace membre, et e-mail si « email ». */
export async function sendCard(cardId: string, channel: "email" | "espace" = "email"): Promise<Result> {
  const staff = await cardManager();
  if (!staff) return FORBIDDEN;
  const { data: card } = await staff.supabase.from("member_cards").select("card_number, full_name, status").eq("id", cardId).maybeSingle();
  if (!card || card.status !== "active") return { ok: false, error: "Seule une carte active peut être transmise." };
  const where = channel === "email" ? "par e-mail et dans son espace" : "dans son espace membre";
  return runOrRequest(staff, "card.send", `Transmettre la carte ${card.card_number} à ${card.full_name} (${where}) pour vérification`, { cardId, channel });
}
