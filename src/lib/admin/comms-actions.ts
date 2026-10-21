"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/lib/member/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { audienceLabel, audiences } from "./audiences";
import { executeApproval, requestApproval, resolveAudience } from "./approvals";
import { audit, getStaff } from "./staff";

const refresh = () => revalidatePath("/[locale]/admin", "layout");

const mailingSchema = z.object({
  subject: z.string().trim().min(3, "Indiquez un objet.").max(200),
  body: z.string().trim().min(10, "Le message est trop court.").max(20000),
  audience: z.enum(audiences.map((a) => a.id) as [string, ...string[]]),
});

/** Nombre de destinataires d'un public (aperçu avant envoi). */
export async function countAudience(audience: string): Promise<number> {
  const staff = await getStaff();
  if (!staff?.can("newsletter.manage")) return 0;
  return (await resolveAudience(audience)).length;
}

/**
 * Prépare un e-mail groupé. Présidence : envoi immédiat.
 * Communication : envoi après validation par la présidence.
 */
export async function sendMailing(raw: unknown): Promise<ActionResult & { pending?: boolean; sent?: number }> {
  const staff = await getStaff();
  if (!staff?.can("newsletter.manage")) return { ok: false, error: "La communication ne fait pas partie de votre poste." };
  const parsed = mailingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;

  const admin = createAdminClient();
  const { data: mailing, error } = await admin
    .from("mailings")
    .insert({ subject: v.subject, body: v.body, audience: v.audience, created_by: staff.user.id })
    .select("id")
    .single();
  if (error) return { ok: false, error: "L'enregistrement a échoué." };

  if (!staff.presidency) {
    await requestApproval(staff, "mailing.send", `E-mail groupé : ${v.subject}`, `Pour : ${audienceLabel(v.audience)}`, { mailingId: mailing.id });
    refresh();
    return { ok: true, pending: true };
  }
  const failure = await executeApproval("mailing.send", { mailingId: mailing.id }, staff.user.id);
  if (failure) return { ok: false, error: failure };
  const { data: sent } = await admin.from("mailings").select("recipients_count").eq("id", mailing.id).single();
  await audit(staff, "envoi.groupe", "mailings", mailing.id, { title: v.subject, name: audienceLabel(v.audience) });
  refresh();
  return { ok: true, sent: sent?.recipients_count ?? 0 };
}

const reportSchema = z.object({
  title: z.string().trim().min(3, "Indiquez un titre.").max(200),
  period: z.string().trim().max(80).default(""),
  category: z.enum(["activite", "financier", "projet", "reunion", "autre"]),
  summary: z.string().trim().min(10, "Rédigez un résumé (il est envoyé par e-mail).").max(1000),
  body: z.string().trim().max(50000).default(""),
  audience: z.array(z.string()).default([]),
  filePath: z.string().regex(/^rapports\/[0-9a-f-]{36}\/[^/]+$/).nullable().optional(),
  fileName: z.string().max(200).nullable().optional(),
});

/**
 * Enregistre un rapport (brouillon) ou le soumet à la présidence.
 * Une fois validé, il est diffusé aux postes destinataires.
 */
export async function saveReport(id: string | null, raw: unknown, submit: boolean): Promise<ActionResult & { id?: string }> {
  const staff = await getStaff();
  if (!staff?.can("reports.write")) return { ok: false, error: "La rédaction de rapports ne fait pas partie de votre poste." };
  const parsed = reportSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const v = parsed.data;
  const row = {
    title: v.title,
    period: v.period,
    category: v.category,
    summary: v.summary,
    body: v.body,
    audience: v.audience.filter((a) => /^[a-z0-9-]{2,40}$/.test(a)),
    file_path: v.filePath ?? null,
    file_name: v.fileName ?? null,
    status: submit ? "soumis" : "brouillon",
  };

  // RLS : chacun n'écrit que ses brouillons (ou rapports refusés à corriger).
  const result = id
    ? await staff.supabase.from("reports").update(row).eq("id", id).select("id").single()
    : await staff.supabase.from("reports").insert({ ...row, author_id: staff.user.id }).select("id").single();
  if (result.error || !result.data) {
    console.error("[rapports]", result.error?.message);
    return { ok: false, error: "L'enregistrement a échoué." };
  }
  const reportId = result.data.id;

  if (submit) {
    if (staff.presidency) {
      const failure = await executeApproval("report.publish", { reportId }, staff.user.id);
      if (failure) return { ok: false, error: failure };
      await audit(staff, "rapport.diffuse", "reports", reportId, { title: v.title });
    } else {
      await requestApproval(staff, "report.publish", `Rapport : ${v.title}`, v.summary.slice(0, 300), { reportId });
      await audit(staff, "rapport.soumis", "reports", reportId, { title: v.title });
    }
  }
  refresh();
  return { ok: true, id: reportId };
}

export async function deleteReport(id: string): Promise<ActionResult> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "Accès refusé." };
  const { data } = await staff.supabase.from("reports").select("file_path").eq("id", id).maybeSingle();
  const { error } = await staff.supabase.from("reports").delete().eq("id", id);
  if (error) return { ok: false, error: "La suppression a échoué." };
  if (data?.file_path) await createAdminClient().storage.from("documents").remove([data.file_path]);
  refresh();
  return { ok: true };
}
