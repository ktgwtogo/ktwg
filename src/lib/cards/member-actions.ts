"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmail, teamRecipients } from "@/lib/email/send";
import type { ActionResult } from "@/lib/member/actions";
import { getMember } from "@/lib/member/session";

const schema = z.object({
  cardId: z.string().uuid(),
  approve: z.boolean(),
  comment: z.string().trim().max(1000).optional(),
});

/** Réponse du membre à sa carte transmise : accord final (téléchargement ouvert) ou demande de correction. */
export async function respondToCard(raw: unknown): Promise<ActionResult> {
  const member = await getMember();
  if (!member) return { ok: false, error: "Votre session a expiré. Reconnectez-vous." };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Formulaire invalide." };
  const { cardId, approve, comment } = parsed.data;
  if (!approve && !comment) return { ok: false, error: "Indiquez la correction souhaitée." };

  const { error } = await member.supabase.rpc("respond_to_my_card", {
    p_card: cardId,
    p_approve: approve,
    p_comment: comment ?? null,
  });
  if (error) {
    console.error("[carte] réponse du membre", error.message);
    return {
      ok: false,
      error: "L'enregistrement a échoué. Réessayez dans un instant.",
    };
  }

  if (!approve) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ktgw.tg";
    const name = member.profile.full_name ?? member.profile.email;
    await sendEmail({
      to: teamRecipients(),
      subject: `[Site KTGW] Correction demandée sur une carte de membre : ${name}`,
      text: `${name} (${member.profile.email}) demande une correction de sa carte de membre :\n\n${comment}\n\nÀ traiter ici : ${site}/admin/cartes/${cardId}`,
    });
  }
  revalidatePath("/[locale]/mon-espace", "layout");
  revalidatePath("/[locale]/admin", "layout");
  return { ok: true };
}
