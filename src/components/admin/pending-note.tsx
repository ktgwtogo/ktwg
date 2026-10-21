import { Hourglass } from "lucide-react";

export const PENDING_TEXT = "Envoyé à la présidence : l'action sera exécutée après sa validation.";

/** Message affiché quand une action d'un membre du bureau attend la validation de la présidence. */
export function PendingNote({ show, text = PENDING_TEXT }: { show: boolean; text?: string }) {
  if (!show) return null;
  return (
    <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-sun/15 px-3 py-2 text-sm font-semibold text-ktgw-orange">
      <Hourglass aria-hidden className="size-4 shrink-0" />
      {text}
    </p>
  );
}
