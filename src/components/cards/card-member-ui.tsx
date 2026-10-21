"use client";

import { CheckCircle2, PenLine } from "lucide-react";
import { useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { respondToCard } from "@/lib/cards/member-actions";

/** Le membre confirme sa carte (accord final) ou demande une correction au secrétariat. */
export function CardApproval({ cardId }: { cardId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"choice" | "correction">("choice");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (approve: boolean) =>
    start(async () => {
      setError(null);
      const r = await respondToCard({
        cardId,
        approve,
        comment: approve ? undefined : comment,
      });
      if (!r.ok) return setError(r.error);
      router.refresh();
    });

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-ktgw-sun/15 p-5 ring-1 ring-ktgw-sun/40">
      <p className="font-semibold">Vérifiez votre carte avant sa finalisation</p>
      <p className="text-sm text-muted-foreground">
        Contrôlez votre nom, votre photo, votre date de naissance et votre nationalité. Si tout est exact, donnez votre accord : vous pourrez ensuite la
        télécharger et l&apos;imprimer.
      </p>
      {mode === "choice" ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="lg" disabled={pending} onClick={() => submit(true)}>
            <CheckCircle2 aria-hidden />
            {pending ? "Enregistrement…" : "Tout est exact, je donne mon accord"}
          </Button>
          <Button type="button" size="lg" variant="outline" disabled={pending} onClick={() => setMode("correction")}>
            <PenLine aria-hidden />
            Demander une correction
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(false);
          }}
          className="flex flex-col gap-2"
        >
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Quelle correction faut-il apporter ?
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
              required
              className="rounded-xl border border-input bg-card px-3 py-2 text-sm font-normal outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending || !comment.trim()}>
              {pending ? "Envoi…" : "Envoyer la demande"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setMode("choice")}>
              Annuler
            </Button>
          </div>
        </form>
      )}
      <ServerError message={error} />
    </div>
  );
}
