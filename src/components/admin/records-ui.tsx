"use client";

import { Check, Plus, Printer, Save, X } from "lucide-react";
import { useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { donationMethods, submissionStatuses } from "@/lib/admin/records";
import { confirmDonation, recordPayment, updateSubmission } from "@/lib/admin/records-actions";

const input =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Statut et notes internes d'une demande reçue. */
export function SubmissionControls({ inbox, id, status, notes }: { inbox: string; id: string; status: string; notes: string | null }) {
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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
              setSaved(false);
              const r = await updateSubmission(inbox, id, s, n);
              if (!r.ok) setError(r.error);
              else setSaved(true);
            })
          }
        >
          <Save aria-hidden />
          {saved ? "Enregistré" : "Enregistrer"}
        </Button>
      </div>
      <ServerError message={error} />
    </div>
  );
}

/** Confirmation (reçu) ou rejet d'une déclaration de don. */
export function DonationActions({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (ok: boolean) =>
    start(async () => {
      setError(null);
      const r = await confirmDonation(id, ok);
      if (!r.ok) setError(r.error);
    });
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => window.confirm("Confirmer la réception de ce paiement ? Un numéro de reçu sera attribué.") && run(true)} className="bg-ktgw-green-strong text-white hover:bg-ktgw-green-strong/90">
          <Check aria-hidden />
          Paiement reçu
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => window.confirm("Écarter cette déclaration (paiement introuvable) ?") && run(false)}>
          <X aria-hidden />
          Écarter
        </Button>
      </div>
      <ServerError message={error} />
    </div>
  );
}

/** Saisie d'un don ou d'une cotisation reçus directement. */
export function PaymentForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = Object.fromEntries(new FormData(form));
    start(async () => {
      setError(null);
      setDone(false);
      const r = await recordPayment(d);
      if (!r.ok) return setError(r.error);
      setDone(true);
      form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Nature
          <select name="kind" className={input} defaultValue="cotisation">
            <option value="cotisation">Cotisation</option>
            <option value="don">Don</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Montant (FCFA)
          <input name="amount" type="number" min={1} required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Nom
          <input name="name" required className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          E-mail (pour le reçu)
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
      <ServerError message={error} />
      {done && <p className="text-sm font-semibold text-ktgw-green-strong">Paiement enregistré : le reçu est disponible dans la liste.</p>}
      <div>
        <Button type="submit" size="lg" disabled={pending}>
          <Plus aria-hidden />
          Enregistrer le paiement
        </Button>
      </div>
    </form>
  );
}

export function PrintButton({ label = "Imprimer / enregistrer en PDF" }: { label?: string }) {
  return (
    <Button type="button" size="lg" onClick={() => window.print()} className="print:hidden">
      <Printer aria-hidden />
      {label}
    </Button>
  );
}
