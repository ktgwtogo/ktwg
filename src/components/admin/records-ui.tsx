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

/** Statut et notes internes d'une demande reçue. */
export function SubmissionControls({ inbox, id, status, notes }: { inbox: string; id: string; status: string; notes: string | null }) {
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"saved" | "pending" | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-2 border-t pt-3">
      <div className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
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
          <Save aria-hidden />
          {result === "saved" ? "Enregistré" : "Enregistrer"}
        </Button>
      </div>
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
