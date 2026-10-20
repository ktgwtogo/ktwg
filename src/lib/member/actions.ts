"use server";

import { revalidatePath } from "next/cache";
import { sendEmail, teamRecipients } from "@/lib/email/send";
import { getMember } from "@/lib/member/session";
import { membershipSchema, membershipTypeLabels, missingProfileFields, profileSchema } from "@/lib/validations/member";

export type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_SIGNED_IN: ActionResult = { ok: false, error: "Votre session a expiré. Reconnectez-vous." };

/** Enregistre le profil de la personne connectée (RLS : uniquement le sien). */
export async function updateProfile(raw: unknown, photoPath: string | null): Promise<ActionResult> {
  const member = await getMember();
  if (!member) return NOT_SIGNED_IN;

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Certains champs sont invalides. Vérifiez le formulaire." };
  // La photo doit être dans le dossier de la personne (déposée par le navigateur).
  if (photoPath && !photoPath.startsWith(`${member.user.id}/`)) return { ok: false, error: "Photo invalide." };

  const v = parsed.data;
  const { error } = await member.supabase
    .from("profiles")
    .update({
      civility: v.civility,
      first_name: v.firstName,
      last_name: v.lastName,
      full_name: `${v.firstName} ${v.lastName}`,
      birth_date: v.birthDate,
      nationality: v.nationality,
      profession: v.profession,
      organization: v.organization || null,
      phone: v.phone,
      whatsapp: v.whatsapp || null,
      address: v.address,
      city: v.city,
      country: v.country,
      bio: v.bio,
      photo_path: photoPath ?? member.profile.photo_path,
    })
    .eq("id", member.user.id);

  if (error) {
    console.error("[member] profil", error.message);
    return { ok: false, error: "L'enregistrement a échoué. Réessayez dans un instant." };
  }
  // Ancienne photo remplacée : on ne la conserve pas.
  const previous = member.profile.photo_path;
  if (photoPath && previous && previous !== photoPath) await member.supabase.storage.from("avatars").remove([previous]);
  revalidatePath("/[locale]/mon-espace", "layout");
  return { ok: true };
}

/** Dépose une demande d'adhésion (profil complet requis, une seule demande en attente). */
export async function submitMembership(raw: unknown): Promise<ActionResult> {
  const member = await getMember();
  if (!member) return NOT_SIGNED_IN;
  const { profile } = member;

  const missing = missingProfileFields(profile);
  if (missing.length) return { ok: false, error: `Complétez d'abord votre profil : ${missing.join(", ")}.` };
  if (profile.membership_status === "en_attente") return { ok: false, error: "Vous avez déjà une demande en cours de traitement." };
  if (profile.membership_status === "validee") return { ok: false, error: "Votre adhésion est déjà validée." };

  const parsed = membershipSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Certains champs sont invalides. Vérifiez le formulaire." };
  const v = parsed.data;

  const { error } = await member.supabase.from("membership_applications").insert({
    user_id: member.user.id,
    type: v.type,
    motivation: v.motivation,
    interests: v.interests,
    skills: v.skills || null,
    availability: v.availability || null,
    contribution: v.contribution || null,
    referral: v.referral || null,
  });
  if (error) {
    console.error("[member] adhésion", error.message);
    return {
      ok: false,
      error: error.code === "23505" ? "Vous avez déjà une demande en cours de traitement." : "L'envoi a échoué. Réessayez dans un instant.",
    };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await sendEmail({
    to: teamRecipients(),
    subject: `[Site KTGW] Nouvelle demande d'adhésion : ${profile.first_name} ${profile.last_name}`,
    text: `Nouvelle demande d'adhésion (${membershipTypeLabels[v.type]}) de ${profile.first_name} ${profile.last_name} (${profile.email}).\n\nÀ traiter ici : ${site}/admin/adhesions`,
    replyTo: profile.email,
  });

  revalidatePath("/[locale]/mon-espace", "layout");
  return { ok: true };
}

/** Marque toutes les notifications de la personne connectée comme lues. */
export async function markNotificationsRead(): Promise<void> {
  const member = await getMember();
  if (!member) return;
  await member.supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", member.user.id).is("read_at", null);
  revalidatePath("/[locale]/mon-espace", "layout");
}
