"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmail } from "@/lib/email/send";
import type { ActionResult } from "@/lib/member/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { allPermissions } from "./permissions";
import { audit, getStaff } from "./staff";

const PRESIDENCY_ONLY: ActionResult = { ok: false, error: "Action réservée à la présidence." };
const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const refresh = () => revalidatePath("/[locale]/admin", "layout");

/** Mot de passe provisoire lisible (sans caractères ambigus). */
function temporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("").replace(/(.{4})(?=.)/g, "$1-");
}

async function presidency() {
  const staff = await getStaff();
  return staff?.presidency ? staff : null;
}

/** Rôle d'accès déduit du poste (le poste « president » donne la présidence). */
const roleFor = (positionId: string | null, current: string) =>
  current === "super_admin" ? "super_admin" : positionId === "president" ? "admin" : positionId ? "editor" : "member";

const createSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez le nom.").max(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse e-mail invalide.")),
  positionId: z.string().min(2, "Choisissez un poste."),
});

/**
 * Crée le compte d'un membre du bureau avec un mot de passe provisoire, à changer
 * à la première connexion. Le mot de passe est envoyé par e-mail et affiché une fois.
 */
export async function createStaffAccount(raw: unknown): Promise<ActionResult & { password?: string }> {
  const staff = await presidency();
  if (!staff) return PRESIDENCY_ONLY;
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  const admin = createAdminClient();

  const { data: position } = await admin.from("positions").select("id, name").eq("id", v.positionId).maybeSingle();
  if (!position) return { ok: false, error: "Poste introuvable." };

  const password = temporaryPassword();
  const { data, error } = await admin.auth.admin.createUser({
    email: v.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: v.fullName },
  });
  if (error || !data.user) {
    return { ok: false, error: /already|exists|registered/i.test(error?.message ?? "") ? "Un compte existe déjà avec cette adresse : attribuez-lui un poste dans la liste." : "La création du compte a échoué." };
  }

  await admin
    .from("profiles")
    .update({ position_id: position.id, role: roleFor(position.id, "member"), must_change_password: true, full_name: v.fullName })
    .eq("id", data.user.id);
  await audit(staff, "compte.cree", "profiles", data.user.id, { email: v.email, poste: position.name });

  await sendEmail({
    to: [v.email],
    subject: "Votre accès à l'administration de KTGW Togo",
    text: `Bonjour ${v.fullName},\n\nLa présidence de KTGW Togo vous a créé un accès en tant que ${position.name}.\n\nAdresse : ${site()}/connexion\nE-mail : ${v.email}\nMot de passe provisoire : ${password}\n\nÀ votre première connexion, vous devrez choisir votre propre mot de passe.\n\nL'équipe KTGW Togo`,
  });
  refresh();
  return { ok: true, password };
}

/** Attribue (ou retire, avec null) un poste à un compte existant. */
export async function assignPosition(userId: string, positionId: string | null): Promise<ActionResult> {
  const staff = await presidency();
  if (!staff) return PRESIDENCY_ONLY;
  if (userId === staff.user.id) return { ok: false, error: "Vous ne pouvez pas modifier votre propre poste." };
  const admin = createAdminClient();

  const { data: target } = await admin.from("profiles").select("role, email").eq("id", userId).maybeSingle();
  if (!target) return { ok: false, error: "Compte introuvable." };
  if (target.role === "super_admin" && staff.profile.role !== "super_admin") return PRESIDENCY_ONLY;

  const { error } = await admin
    .from("profiles")
    .update({ position_id: positionId, role: roleFor(positionId, target.role) })
    .eq("id", userId);
  if (error) return { ok: false, error: "Le changement de poste a échoué." };
  await audit(staff, "poste.attribue", "profiles", userId, { email: target.email, poste: positionId });

  await admin.from("notifications").insert({
    user_id: userId,
    title: positionId ? "Un poste vous a été attribué" : "Votre poste a été retiré",
    body: positionId ? "Retrouvez vos outils dans l'espace Administration." : "",
    link: positionId ? "/admin" : "/mon-espace",
  });
  refresh();
  return { ok: true };
}

/** Suspend ou réactive un compte (connexion bloquée côté Supabase Auth). */
export async function setAccountActive(userId: string, active: boolean): Promise<ActionResult> {
  const staff = await presidency();
  if (!staff) return PRESIDENCY_ONLY;
  if (userId === staff.user.id) return { ok: false, error: "Vous ne pouvez pas suspendre votre propre compte." };
  const admin = createAdminClient();

  const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: active ? "none" : "876000h" });
  if (banError) return { ok: false, error: "L'opération a échoué." };
  await admin.from("profiles").update({ is_active: active }).eq("id", userId);
  await audit(staff, active ? "compte.reactive" : "compte.suspendu", "profiles", userId);
  refresh();
  return { ok: true };
}

/** Nouveau mot de passe provisoire, envoyé par e-mail et affiché une fois. */
export async function resetStaffPassword(userId: string): Promise<ActionResult & { password?: string }> {
  const staff = await presidency();
  if (!staff) return PRESIDENCY_ONLY;
  const admin = createAdminClient();
  const { data: target } = await admin.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  if (!target) return { ok: false, error: "Compte introuvable." };

  const password = temporaryPassword();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { ok: false, error: "La réinitialisation a échoué." };
  await admin.from("profiles").update({ must_change_password: true }).eq("id", userId);
  await audit(staff, "compte.mot_de_passe_reinitialise", "profiles", userId, { email: target.email });

  await sendEmail({
    to: [target.email],
    subject: "Nouveau mot de passe provisoire — KTGW Togo",
    text: `Bonjour${target.full_name ? ` ${target.full_name}` : ""},\n\nLa présidence a réinitialisé votre mot de passe.\nMot de passe provisoire : ${password}\n\nConnectez-vous sur ${site()}/connexion : vous devrez en choisir un nouveau.\n\nL'équipe KTGW Togo`,
  });
  return { ok: true, password };
}

const positionSchema = z.object({
  id: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, "Identifiant : lettres minuscules, chiffres et tirets."),
  name: z.string().trim().min(2, "Indiquez le nom du poste.").max(80),
  description: z.string().trim().max(300).default(""),
  permissions: z.array(z.string()).default([]),
});

/** Crée ou modifie un poste et ses permissions. */
export async function savePosition(raw: unknown): Promise<ActionResult> {
  const staff = await presidency();
  if (!staff) return PRESIDENCY_ONLY;
  const parsed = positionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  if (v.id === "president") return { ok: false, error: "Le poste de président·e a tous les droits et ne se modifie pas." };

  const permissions = v.permissions.filter((p) => (allPermissions as string[]).includes(p));
  const { error } = await staff.supabase
    .from("positions")
    .upsert({ id: v.id, name: v.name, description: v.description, permissions }, { onConflict: "id" });
  if (error) return { ok: false, error: "L'enregistrement du poste a échoué." };
  await audit(staff, "poste.enregistre", "positions", v.id, { name: v.name, permissions });
  refresh();
  return { ok: true };
}

/** Supprime un poste créé par la présidence (les postes d'origine sont conservés). */
export async function deletePosition(id: string): Promise<ActionResult> {
  const staff = await presidency();
  if (!staff) return PRESIDENCY_ONLY;
  const { data: position } = await staff.supabase.from("positions").select("is_system, name").eq("id", id).maybeSingle();
  if (!position) return { ok: false, error: "Poste introuvable." };
  if (position.is_system) return { ok: false, error: "Les postes d'origine ne peuvent pas être supprimés." };
  const { error } = await staff.supabase.from("positions").delete().eq("id", id);
  if (error) return { ok: false, error: "La suppression a échoué." };
  await audit(staff, "poste.supprime", "positions", id, { name: position.name });
  refresh();
  return { ok: true };
}
