"use client";

import { Check, Plus, Printer, Save, Send, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { donationMethods, submissionStatuses } from "@/lib/admin/records";
import { confirmDonation, recordPayment, sendReceipt, updateSubmission } from "@/lib/admin/records-actions";
import { PendingNote } from "./pending-note";

const input =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Statut et notes internes d'une demande reçue + Outils de réponse directe au postulant. */
export function SubmissionControls({
  inbox,
  id,
  status,
  notes,
  applicantName,
  applicantEmail,
  applicantPhone,
  trackName,
}: {
  inbox: string;
  id: string;
  status: string;
  notes: string | null;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  trackName?: string;
}) {
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"saved" | "pending" | null>(null);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyType, setReplyType] = useState<"convocation" | "bourse" | "internat" | "pieces">("convocation");
  const [pending, start] = useTransition();

  const cleanPhone = applicantPhone?.replace(/[^0-9]/g, "") ?? "";
  const nameDisplay = applicantName || "Candidat(e)";
  const trackDisplay = trackName || "Mécatronique Industrielle";

  const getTemplateText = () => {
    switch (replyType) {
      case "convocation":
        return `Bonjour ${nameDisplay},\n\nSuite à votre candidature pour la Formation ${trackDisplay} à KTGW Togo, nous avons le plaisir de vous convoquer pour votre entretien de sélection au Centre CEFOPEXD (Lomé, Tokoin).\n\nMerci de vous munir de votre attestation ou diplôme original du BAC, de votre pièce d'identité et de 2 photos d'identité.\n\nDate de rentrée officielle : 16 Novembre 2026.\n\nDirection Générale KTGW Togo\nPrésident-Fondateur : M. Blaise-Pascal D'ALMEIDA.`;
      case "bourse":
        return `Félicitations ${nameDisplay} !\n\nL'administration de KTGW Togo et Monsieur le Président-Fondateur Blaise-Pascal D'ALMEIDA vous confirment l'attribution de la BOURSE D'ÉTUDES DE 65% pour la formation ${trackDisplay} (session Novembre 2026).\n\nVotre place est réservée. Veuillez vous présenter au secrétariat du CEFOPEXD pour finaliser votre dossier d'admission.`;
      case "internat":
        return `Bonjour ${nameDisplay},\n\nNous vous confirmons que votre demande d'INTERNAT SÉCURISÉ POUR JEUNES FILLES sur le campus du CEFOPEXD a été ACCORDÉE pour la session de formation ${trackDisplay}.\n\nUn cadre sécurisé, propice à l'apprentissage et à l'excellence technique vous est réservé.\n\nAdministration KTGW Togo.`;
      case "pieces":
        return `Bonjour ${nameDisplay},\n\nVotre dossier de candidature pour la formation ${trackDisplay} est actuellement en cours d'étude par la commission d'admission de KTGW Togo.\n\nCependant, il nous manque la copie lisible de votre diplôme du BAC ou de votre pièce d'identité. Merci de nous la faire parvenir au plus vite afin de valider votre éligibilité.\n\nSecrétariat KTGW Togo.`;
    }
  };

  const emailSubject = `[KTGW Togo] Réponse à votre candidature — ${trackDisplay}`;
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(getTemplateText())}` : null;
  const mailtoUrl = applicantEmail ? `mailto:${applicantEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(getTemplateText())}` : null;

  return (
    <div className="flex flex-col gap-2 border-t pt-3">
      <div className="grid gap-2 sm:grid-cols-[12rem_1fr_auto_auto]">
        <select aria-label="Statut" value={s} onChange={(e) => setS(e.target.value)} className={input}>
          {submissionStatuses.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input aria-label="Note interne" value={n} onChange={(e) => setN(e.target.value)} placeholder="Note interne (visible par l'équipe)" className={input} />
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              setResult(null);
              const r = await updateSubmission(inbox, id, s, n);
              if (!r.ok) setError(r.error);
              else setResult(r.pending ? "pending" : "saved");
            })
          }
        >
          <Save aria-hidden className="size-4" />
          {result === "saved" ? "Enregistré" : "Enregistrer"}
        </Button>
        {(applicantPhone || applicantEmail) && (
          <Button
            type="button"
            variant="outline"
            className="border-ktgw-green-strong text-ktgw-green-strong hover:bg-ktgw-green-strong/10"
            onClick={() => setShowReplyBox((v) => !v)}
          >
            <Send aria-hidden className="size-4" />
            {showReplyBox ? "Fermer réponse" : "Répondre au postulant"}
          </Button>
        )}
      </div>

      {showReplyBox && (
        <div className="mt-2 rounded-2xl border-2 border-ktgw-green-strong/30 bg-ktgw-green-strong/5 p-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ktgw-green-strong/20 pb-2">
            <span className="font-bold text-ktgw-green-strong uppercase tracking-wider">
              Répondre à {nameDisplay} {applicantPhone ? `(${applicantPhone})` : ""} {applicantEmail ? `· ${applicantEmail}` : ""}
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setReplyType("convocation")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${replyType === "convocation" ? "bg-ktgw-green-strong text-white" : "bg-card text-foreground"}`}
              >
                Convocation entretien
              </button>
              <button
                type="button"
                onClick={() => setReplyType("bourse")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${replyType === "bourse" ? "bg-ktgw-green-strong text-white" : "bg-card text-foreground"}`}
              >
                Bourse 65% accordée
              </button>
              <button
                type="button"
                onClick={() => setReplyType("internat")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${replyType === "internat" ? "bg-ktgw-green-strong text-white" : "bg-card text-foreground"}`}
              >
                Internat Filles validé
              </button>
              <button
                type="button"
                onClick={() => setReplyType("pieces")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${replyType === "pieces" ? "bg-ktgw-green-strong text-white" : "bg-card text-foreground"}`}
              >
                Pièces manquantes (BAC)
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <label className="font-semibold text-muted-foreground">Message officiel préparé au nom du Président-Fondateur et de l'administration :</label>
            <textarea
              readOnly
              rows={5}
              value={getTemplateText()}
              className="w-full rounded-xl border bg-card p-3 font-mono text-xs text-foreground outline-none"
            />
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#25D366] px-4 font-semibold text-white shadow hover:opacity-90"
                >
                  <Send className="size-3.5" />
                  Envoyer par WhatsApp direct
                </a>
              )}
              {mailtoUrl && (
                <a
                  href={mailtoUrl}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-ktgw-blue-deep px-4 font-semibold text-white shadow hover:opacity-90"
                >
                  <Send className="size-3.5" />
                  Envoyer par E-mail officiel
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(getTemplateText());
                  alert("Message officiel copié dans le presse-papier !");
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border bg-card px-3 font-medium text-foreground hover:bg-muted"
              >
                Copier le texte
              </button>
            </div>
          </div>
        </div>
      )}

      <ServerError message={error} />
      <PendingNote show={result === "pending"} />
    </div>
  );
}

/** Confirmation du paiement (génère le reçu, sans l'envoyer) ou rejet d'une déclaration. */
export function DonationActions({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, start] = useTransition();
  const run = (ok: boolean) =>
    start(async () => {
      setError(null);
      const r = await confirmDonation(id, ok);
      if (!r.ok) return setError(r.error);
      if (r.pending) setSubmitted(true);
      else router.refresh();
    });
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending || submitted}
          onClick={() =>
            window.confirm("Confirmer la réception de ce paiement ? Le reçu officiel sera généré (vous pourrez le consulter avant de l'envoyer).") && run(true)
          }
          className="bg-ktgw-green-strong text-white hover:bg-ktgw-green-strong/90"
        >
          <Check aria-hidden />
          Paiement reçu : générer le reçu
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || submitted}
          onClick={() => window.confirm("Écarter cette déclaration (paiement introuvable) ?") && run(false)}
        >
          <X aria-hidden />
          Écarter
        </Button>
      </div>
      <ServerError message={error} />
      <PendingNote show={submitted} />
    </div>
  );
}

/** Saisie d'un don (argent ou nature) ou d'une cotisation reçus directement. */
export function PaymentForm() {
  const router = useRouter();
  const [kind, setKind] = useState("cotisation");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"saved" | "pending" | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form));
    start(async () => {
      setError(null);
      setDone(null);
      const r = await recordPayment(d);
      if (!r.ok) return setError(r.error);
      setDone(r.pending ? "pending" : "saved");
      form.reset();
      setKind("cotisation");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Nature
          <select name="kind" className={input} value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="cotisation">Cotisation (adhésion)</option>
            <option value="don">Don en argent</option>
            <option value="nature">Don en nature (objets, matériel…)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          {kind === "nature" ? "Valeur estimée en FCFA (facultatif)" : "Montant (FCFA)"}
          <input name="amount" type="number" min={kind === "nature" ? 0 : 1} required={kind !== "nature"} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Nom
          <input name="name" required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          E-mail (pour envoyer le reçu)
          <input name="email" type="email" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Moyen de paiement
          <select name="method" className={input}>
            {donationMethods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Date de réception
          <input name="receivedAt" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Téléphone
          <input name="phone" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Projet soutenu / référence
          <input name="project" className={input} />
        </label>
      </div>
      {kind === "nature" && (
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Objets / matériel reçus (quantités, état…)
          <textarea name="items" required rows={3} className={`${input} h-auto py-2`} />
        </label>
      )}
      <ServerError message={error} />
      {done === "saved" && (
        <p className="text-sm font-semibold text-ktgw-green-strong">
          Enregistré : le reçu est généré. Consultez-le dans « Reçus générés », puis envoyez-le au donateur.
        </p>
      )}
      <PendingNote show={done === "pending"} />
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          <Plus aria-hidden />
          Enregistrer et générer le reçu
        </Button>
      </div>
    </form>
  );
}

/** Envoi du reçu au donateur (e-mail + espace membre), après consultation. */
export function SendReceiptButton({ id, sent }: { id: string; sent: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "ok" | "pending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending || state !== "idle"}
        onClick={() =>
          window.confirm(sent ? "Renvoyer ce reçu au donateur ?" : "Envoyer ce reçu au donateur (e-mail et espace membre) ?") &&
          start(async () => {
            setError(null);
            const r = await sendReceipt(id);
            if (!r.ok) return setError(r.error);
            setState(r.pending ? "pending" : "ok");
            if (!r.pending) router.refresh();
          })
        }
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-ktgw-green-strong px-4 text-sm font-semibold whitespace-nowrap text-white hover:opacity-90 disabled:opacity-60"
      >
        <Send aria-hidden className="size-4" />
        {pending ? "Envoi…" : state === "ok" ? "Envoyé ✓" : sent ? "Renvoyer au donateur" : "Envoyer au donateur"}
      </button>
      <ServerError message={error} />
      <PendingNote show={state === "pending"} />
    </div>
  );
}

/** Ouvre directement la fenêtre d'impression (« Enregistrer au format PDF ») : liens « Télécharger ». */
export function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, []);
  return null;
}

export function PrintButton({ label = "Imprimer / enregistrer en PDF" }: { label?: string }) {
  return (
    <Button type="button" size="lg" onClick={() => window.print()} className="print:hidden">
      <Printer aria-hidden />
      {label}
    </Button>
  );
}
