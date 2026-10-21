"use client";

import { Check, X } from "lucide-react";
import { useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { decideApproval } from "@/lib/admin/actions";

/** Approbation ou refus d'une demande par la présidence, avec message facultatif. */
export function ApprovalDecision({ id, title }: { id: string; title: string }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const decide = (approve: boolean) => {
    if (!window.confirm(approve ? `Approuver « ${title} » ?` : `Refuser « ${title} » ?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await decideApproval(id, approve, note);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <div className="flex flex-col gap-3 border-t pt-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Message à l&apos;auteur·e (facultatif)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          className="rounded-xl border border-input bg-card px-4 py-3 text-base font-normal outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40"
        />
      </label>
      <ServerError message={error} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" size="lg" disabled={pending} onClick={() => decide(true)} className="bg-ktgw-green-strong text-white hover:bg-ktgw-green-strong/90">
          <Check aria-hidden />
          Approuver
        </Button>
        <Button type="button" size="lg" variant="outline" disabled={pending} onClick={() => decide(false)}>
          <X aria-hidden />
          Refuser
        </Button>
      </div>
    </div>
  );
}
