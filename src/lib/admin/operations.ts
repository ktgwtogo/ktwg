import "server-only";
import { revalidatePath } from "next/cache";
import { cardViewUrl, defaultExpiry, verifyUrl } from "@/lib/cards/card";
import { cardMail, membershipDecision, receiptMail, receiptNature } from "@/lib/email/messages";
import { NO_EMAIL, sendTemplate } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { membershipTypeLabels } from "@/lib/validations/member";
import { getInbox } from "./records";

/**
 * Opérations internes du bureau (adhésions, cartes, dossiers, trésorerie, demandes reçues).
 * Exécutées avec la clé serveur : soit directement par la présidence, soit après sa validation
 * quand un autre poste les a demandées. Chaque fonction renvoie un message d'erreur ou null.
 */
type Args = Record<string, unknown>;
type Operation = (args: Args, actorId: string | null) => Promise<string | null>;

const db = () => createAdminClient();

async function log(actorId: string | null, action: string, entity: string, entityId: string | null, details: Record<string, unknown> = {}) {
  await db().from("audit_log").insert({ actor_id: actorId, action, entity, entity_id: entityId, details: details as never });
}

const refresh = () => revalidatePath("/[locale]/admin", "layout");

// ── Adhésions ──

const decideMembership: Operation = async (a, actorId) => {
  const admin = db();
  const approve = a.approve === true;
  const note = String(a.note ?? "").trim().slice(0, 1000) || null;
  const { data: app } = await admin
    .from("membership_applications")
    .update({ status: approve ? "validee" : "refusee", decision_note: note, decided_by: actorId, decided_at: new Date().toISOString() })
    .eq("id", String(a.applicationId))
    .eq("status", "en_attente")
    .select("*")
    .maybeSingle();
  if (!app) return "Demande introuvable ou déjà traitée.";

  if (approve) await admin.from("profiles").update({ membership_status: "validee", membership_type: app.type }).eq("id", app.user_id);
  else await admin.from("profiles").update({ membership_status: "refusee" }).eq("id", app.user_id).neq("membership_status", "validee");

  await admin.from("notifications").insert({
    user_id: app.user_id,
    title: approve ? "Votre adhésion est validée !" : "Réponse à votre demande d'adhésion",
    body:
      (approve
        ? `Bienvenue dans l'association en tant que ${membershipTypeLabels[app.type].toLowerCase()}. Vous avez maintenant accès aux documents réservés aux membres.`
        : "Votre demande n'a pas pu être acceptée pour le moment.") + (note ? `\n\nMessage de l'association : ${note}` : ""),
    link: "/mon-espace",
  });
  const { data: person } = await admin.from("profiles").select("email, first_name").eq("id", app.user_id).maybeSingle();
  if (person) {
    const mail = membershipDecision(person.first_name, approve);
    await sendTemplate(person.email, mail.subject, mail.content);
  }
  await log(actorId, approve ? "adhesion.validee" : "adhesion.refusee", "membership_applications", app.id, { note });
  return null;
};

// ── Demandes reçues ──

const updateSubmission: Operation = async (a, actorId) => {
  const inbox = getInbox(String(a.inbox));
  if (!inbox) return "Boîte inconnue.";
  const { error } = await db()
    .from(inbox.table as "contact_messages")
    .update({ status: String(a.status) as never, admin_notes: String(a.notes ?? "").slice(0, 2000) || null })
    .eq("id", String(a.id));
  if (error) return error.message;
  await log(actorId, "demande.traitee", inbox.table, String(a.id), { title: inbox.label, note: String(a.status) });
  return null;
};

// ── Trésorerie ──

/** Confirme (reçu généré, sans envoi) ou écarte une déclaration de don. */
const confirmDonation: Operation = async (a, actorId) => {
  const { error } = await db()
    .from("donation_declarations")
    .update({ status: a.confirmed ? "traite" : "archive" })
    .eq("id", String(a.id));
  if (error) return error.message;
  await log(actorId, a.confirmed ? "don.confirme" : "don.rejete", "donation_declarations", String(a.id));
  return null;
};

/** Enregistre un paiement ou un don reçu directement : le reçu est généré (envoi séparé). */
const recordPayment: Operation = async (a, actorId) => {
  const admin = db();
  const email = String(a.email ?? "").toLowerCase();
  const { data: account } = email ? await admin.from("profiles").select("id").eq("email", email).maybeSingle() : { data: null };
  const inKind = a.kind === "nature";
  const { data, error } = await admin
    .from("donation_declarations")
    .insert({
      kind: String(a.kind),
      name: String(a.name),
      email: email || NO_EMAIL,
      phone: (a.phone as string) || null,
      amount_fcfa: Number(a.amount) || 0,
      method: inKind ? "En nature" : String(a.method),
      frequency: "Ponctuel",
      project: (a.project as string) || null,
      reference: (a.reference as string) || null,
      item_description: inKind ? (a.items as string) || null : null,
      user_id: account?.id ?? null,
      status: "traite",
      received_at: String(a.receivedAt),
      recorded_by: actorId,
    })
    .select("id")
    .single();
  if (error) return error.message;
  await log(actorId, "don.saisi", "donation_declarations", data.id, { title: `${a.kind} ${Number(a.amount) || 0} FCFA`, name: a.name });
  return null;
};

/** Envoie le reçu au donateur : e-mail au modèle KTGW et dépôt dans son espace membre. */
const sendReceipt: Operation = async (a, actorId) => {
  const admin = db();
  const { data: d } = await admin.from("donation_declarations").select("*").eq("id", String(a.id)).maybeSingle();
  if (!d?.receipt_number) return "Le reçu n'est pas encore généré (paiement non confirmé).";
  const mail = receiptMail({ ...d, receipt_number: d.receipt_number });
  const sent = d.email !== NO_EMAIL && (await sendTemplate(d.email, mail.subject, mail.content));
  const { data: account } = d.user_id
    ? { data: { id: d.user_id } }
    : await admin.from("profiles").select("id").eq("email", d.email.toLowerCase()).maybeSingle();
  if (!sent && !account) return "Aucune adresse e-mail ni compte pour ce donateur : téléchargez le reçu et remettez-le en main propre.";
  if (account) {
    if (!d.user_id) await admin.from("donation_declarations").update({ user_id: account.id }).eq("id", d.id);
    await admin.from("notifications").insert({
      user_id: account.id,
      title: `Votre reçu ${d.receipt_number} est disponible`,
      body: receiptNature(d),
      link: "/mon-espace/recus",
    });
  }
  await admin.from("donation_declarations").update({ receipt_sent_at: new Date().toISOString() }).eq("id", d.id);
  await log(actorId, "recu.envoye", "donation_declarations", d.id, { title: d.receipt_number, email: d.email });
  return null;
};

// ── Cartes de membre ──

const issueCard: Operation = async (a, actorId) => {
  const admin = db();
  const userId = String(a.userId);
  const { data: p } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!p) return "Membre introuvable.";
  if (p.membership_status !== "validee" || !p.membership_type) return "La carte n'est délivrée qu'aux membres dont l'adhésion est validée.";

  await admin.from("member_cards").update({ status: "revoquee" }).eq("user_id", userId).eq("status", "active");
  const issued = new Date().toISOString().slice(0, 10);
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email;
  const { count } = await admin.from("member_cards").select("id", { count: "exact", head: true }).eq("user_id", userId);
  const base = p.member_number ?? `KTGW-${issued.slice(0, 4)}-${userId.slice(0, 4).toUpperCase()}`;
  const cardNumber = count ? `${base}-${String(count + 1).padStart(2, "0")}` : base;
  const { data, error } = await admin
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
      created_by: actorId,
    })
    .select("id")
    .single();
  if (error) return error.message;
  await log(actorId, "carte.creee", "member_cards", data.id, { title: cardNumber, name });
  return null;
};

const updateCard: Operation = async (a, actorId) => {
  const v = a.values as Record<string, string | null>;
  const { error } = await db()
    .from("member_cards")
    .update({
      card_number: String(v.card_number),
      full_name: String(v.full_name),
      membership_type: v.membership_type as "adherent",
      birth_date: v.birth_date || null,
      nationality: v.nationality || null,
      issued_at: String(v.issued_at),
      expires_at: String(v.expires_at),
      notes: v.notes || null,
      photo_path: v.photo_path,
    })
    .eq("id", String(a.cardId));
  if (error) return error.code === "23505" ? "Ce numéro de carte est déjà utilisé." : error.message;
  await log(actorId, "carte.modifiee", "member_cards", String(a.cardId), { title: v.card_number, name: v.full_name });
  return null;
};

const revokeCard: Operation = async (a, actorId) => {
  const { error } = await db().from("member_cards").update({ status: "revoquee" }).eq("id", String(a.cardId));
  if (error) return error.message;
  await log(actorId, "carte.revoquee", "member_cards", String(a.cardId));
  return null;
};

const sendCard: Operation = async (a, actorId) => {
  const admin = db();
  const { data: card } = await admin.from("member_cards").select("*").eq("id", String(a.cardId)).maybeSingle();
  if (!card || card.status !== "active") return "Seule une carte active peut être envoyée.";
  const { data: person } = await admin.from("profiles").select("email, first_name").eq("id", card.user_id).maybeSingle();
  if (!person) return "Membre introuvable.";
  const mail = cardMail({
    firstName: person.first_name,
    cardNumber: card.card_number,
    typeLabel: membershipTypeLabels[card.membership_type],
    expiresAt: card.expires_at,
    viewUrl: cardViewUrl(),
    verifyUrl: verifyUrl(card.verification_token),
  });
  if (!(await sendTemplate(person.email, mail.subject, mail.content))) return "L'e-mail n'a pas pu partir (vérifiez la configuration Resend).";
  await admin.from("member_cards").update({ sent_at: new Date().toISOString() }).eq("id", card.id);
  await admin.from("notifications").insert({ user_id: card.user_id, title: "Votre carte de membre est disponible", body: `Carte n° ${card.card_number}`, link: "/mon-espace/carte" });
  await log(actorId, "carte.envoyee", "member_cards", card.id, { title: card.card_number, email: person.email });
  return null;
};

// ── Dossiers des membres ──

const addMemberFile: Operation = async (a, actorId) => {
  const { data, error } = await db()
    .from("member_files")
    .insert({
      user_id: String(a.userId),
      title: String(a.title),
      category: String(a.category),
      notes: (a.notes as string) || null,
      file_path: String(a.filePath),
      file_name: String(a.fileName),
      size_bytes: (a.size as number) ?? null,
      uploaded_by: actorId,
    })
    .select("id")
    .single();
  if (error) return error.message;
  await log(actorId, "dossier.piece_ajoutee", "member_files", data.id, { title: a.title });
  return null;
};

const deleteMemberFile: Operation = async (a, actorId) => {
  const admin = db();
  const { data: file } = await admin.from("member_files").select("file_path, title").eq("id", String(a.id)).maybeSingle();
  if (!file) return "Pièce introuvable.";
  const { error } = await admin.from("member_files").delete().eq("id", String(a.id));
  if (error) return error.message;
  await admin.storage.from("documents").remove([file.file_path]);
  await log(actorId, "dossier.piece_supprimee", "member_files", String(a.id), { title: file.title });
  return null;
};

export const operations = {
  "membership.decide": decideMembership,
  "submission.update": updateSubmission,
  "donation.confirm": confirmDonation,
  "donation.record": recordPayment,
  "receipt.send": sendReceipt,
  "card.issue": issueCard,
  "card.update": updateCard,
  "card.revoke": revokeCard,
  "card.send": sendCard,
  "file.add": addMemberFile,
  "file.delete": deleteMemberFile,
} satisfies Record<string, Operation>;

export type OperationName = keyof typeof operations;

export const operationLabels: Record<OperationName, string> = {
  "membership.decide": "Décision d'adhésion",
  "submission.update": "Traitement d'une demande reçue",
  "donation.confirm": "Confirmation d'un paiement (génère le reçu)",
  "donation.record": "Enregistrement d'un paiement ou d'un don",
  "receipt.send": "Envoi d'un reçu au donateur",
  "card.issue": "Création d'une carte de membre",
  "card.update": "Correction d'une carte de membre",
  "card.revoke": "Révocation d'une carte de membre",
  "card.send": "Envoi d'une carte de membre",
  "file.add": "Ajout d'une pièce au dossier d'un membre",
  "file.delete": "Suppression d'une pièce d'un dossier",
};

/** Exécute une opération ; met à jour l'administration. */
export async function runOperation(name: string, args: Args, actorId: string | null) {
  const op = operations[name as OperationName];
  if (!op) return "Opération inconnue.";
  const error = await op(args, actorId);
  if (!error) refresh();
  return error;
}

/** Nettoyage quand la présidence refuse une opération (fichier déposé non conservé). */
export async function rejectOperation(name: string, args: Args) {
  if (name === "file.add" && args.filePath) await db().storage.from("documents").remove([String(args.filePath)]);
}
