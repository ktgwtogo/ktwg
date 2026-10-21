"use client";

import { Mail, Send, Share2 } from "lucide-react";
import { useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { ShareBar } from "@/components/shared/share-bar";
import { Button } from "@/components/ui/button";
import { audiences } from "@/lib/admin/audiences";
import { sendMailing } from "@/lib/admin/comms-actions";

/**
 * Diffusion d'une publication : réseaux sociaux (partage) et e-mail aux membres,
 * aux abonné·es de la newsletter ou à tous les inscrits (validé par la présidence).
 */
export function PublicationTools({
  url,
  title,
  excerpt,
  instagram,
  tiktok,
  canMail,
  presidency,
}: {
  url: string;
  title: string;
  excerpt: string;
  instagram?: string;
  tiktok?: string;
  canMail: boolean;
  presidency: boolean;
}) {
  const [open, setOpen] = useState<"share" | "mail" | null>(null);
  const [audience, setAudience] = useState<string>("membres");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const mail = () =>
    window.confirm(presidency ? "Envoyer cette publication par e-mail ?" : "Soumettre cet envoi à la présidence ?") &&
    start(async () => {
      setError(null);
      setDone(null);
      const r = await sendMailing({ subject: title, body: `${excerpt}\n\n${url}`, audience });
      if (!r.ok) return setError(r.error);
      setDone(r.pending ? "Envoi soumis à la présidence." : `Envoyé à ${r.sent} destinataire(s).`);
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(open === "share" ? null : "share")}
          aria-expanded={open === "share"}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-border px-3 text-sm font-semibold hover:bg-muted"
        >
          <Share2 aria-hidden className="size-4" />
          Réseaux sociaux
        </button>
        {canMail && (
          <button
            type="button"
            onClick={() => setOpen(open === "mail" ? null : "mail")}
            aria-expanded={open === "mail"}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-border px-3 text-sm font-semibold hover:bg-muted"
          >
            <Mail aria-hidden className="size-4" />
            Envoyer par e-mail
          </button>
        )}
      </div>
      {open === "share" && (
        <div className="rounded-2xl bg-muted/50 p-3">
          <ShareBar url={url} title={title} text={excerpt} instagram={instagram} tiktok={tiktok} size="sm" />
        </div>
      )}
      {open === "mail" && (
        <div className="flex flex-col gap-2 rounded-2xl bg-muted/50 p-3 sm:flex-row sm:items-center">
          <select value={audience} onChange={(e) => setAudience(e.target.value)} aria-label="Destinataires" className="h-10 rounded-xl border border-input bg-card px-3 text-sm">
            {audiences.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          <Button type="button" size="sm" disabled={pending} onClick={mail}>
            <Send aria-hidden />
            {pending ? "Envoi…" : presidency ? "Envoyer" : "Soumettre"}
          </Button>
        </div>
      )}
      <ServerError message={error} />
      {done && <p className="text-sm font-semibold text-ktgw-green-strong">{done}</p>}
    </div>
  );
}
