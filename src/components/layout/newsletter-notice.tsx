"use client";

import { CheckCircle2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const messages: Record<string, string> = {
  confirmee: "Merci ! Votre inscription à la newsletter est confirmée.",
  desinscrit: "Vous êtes désinscrit·e de la newsletter.",
  invalide: "Ce lien n'est plus valide. Inscrivez-vous à nouveau depuis la page d'accueil.",
};

/** Bandeau affiché au retour d'un lien de confirmation / désinscription (?newsletter=…). */
export function NewsletterNotice() {
  const status = useSearchParams().get("newsletter");
  const [closed, setClosed] = useState(false);
  if (!status || !messages[status] || closed) return null;

  return (
    <div role="status" className="flex items-center justify-center gap-3 bg-ktgw-green-strong px-4 py-3 text-sm font-semibold text-white">
      <CheckCircle2 aria-hidden className="size-5 shrink-0" />
      <span>{messages[status]}</span>
      <button type="button" onClick={() => setClosed(true)} className="rounded-md p-1 hover:bg-white/15" aria-label="Fermer">
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
