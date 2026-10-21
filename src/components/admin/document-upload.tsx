"use client";

import { CheckCircle2, Send, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { deleteDocument, publishDocument } from "@/lib/admin/actions";
import { documentAudiences, documentCategories } from "@/lib/admin/mailbox";
import { createClient } from "@/lib/supabase/client";

const MAX = 20 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
const field =
  "w-full rounded-xl border border-input bg-card px-4 text-base outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Nom de fichier sûr pour le stockage (sans accents ni caractères spéciaux). */
const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-120);

/**
 * Envoi aux membres : document, statuts, règlement, annonce, événement, publicité…
 * Déposé dans l'espace membre des destinataires (notification) et envoyé par e-mail.
 * `recipient` : envoi à une seule personne, déjà choisie (dossier du membre, carte).
 */
export function DocumentUpload({
  people = [],
  recipient,
  presidency,
}: {
  people?: { id: string; label: string }[];
  recipient?: { id: string; label: string };
  presidency: boolean;
}) {
  const [audience, setAudience] = useState<string>(recipient ? "user" : "members");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"published" | "pending" | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    const data = new FormData(e.currentTarget);
    const file = data.get("file");
    const hasFile = file instanceof File && file.size > 0;
    const body = String(data.get("body") ?? "").trim();
    if (!hasFile && !body) return setError("Joignez un fichier ou rédigez un message.");
    if (hasFile && file.size > MAX) return setError("Fichier trop lourd : 20 Mo maximum.");

    startTransition(async () => {
      let filePath: string | undefined;
      if (hasFile) {
        filePath = `${crypto.randomUUID()}/${safeName(file.name)}`;
        const { error: uploadError } = await createClient().storage.from("documents").upload(filePath, file, { contentType: file.type });
        if (uploadError) return setError("Le dépôt du fichier a échoué (PDF, image, Word, Excel, PowerPoint).");
      }
      const result = await publishDocument({
        title: data.get("title"),
        category: data.get("category"),
        description: data.get("description") || undefined,
        body: body || undefined,
        audience,
        recipientId: audience === "user" ? recipient?.id ?? (data.get("recipient") || undefined) : undefined,
        filePath,
        fileName: hasFile ? file.name : undefined,
        sendEmail: data.get("sendEmail") === "on",
      });
      if (!result.ok) return setError(result.error);
      formRef.current?.reset();
      if (!recipient) setAudience("members");
      setDone(result.pending ? "pending" : "published");
    });
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Nature
          <select name="category" defaultValue="document" className={`${field} h-12`}>
            {documentCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Titre
          <input name="title" required minLength={3} maxLength={160} className={`${field} h-12`} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Résumé (facultatif)
        <input name="description" maxLength={1000} className={`${field} h-12`} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Message (facultatif si un fichier est joint)
        <textarea name="body" rows={6} maxLength={10000} className={`${field} py-3`} placeholder="Texte de l'annonce, de l'invitation, informations pratiques…" />
      </label>

      {recipient ? (
        <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm">
          Destinataire : <strong>{recipient.label}</strong>
        </p>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">Destinataires</legend>
          <div className="flex flex-wrap gap-2">
            {documentAudiences.map((a) => (
              <label key={a.value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm has-checked:border-ktgw-green has-checked:bg-ktgw-green/10 has-checked:font-semibold">
                <input type="radio" name="audience" value={a.value} checked={audience === a.value} onChange={() => setAudience(a.value)} className="size-4 accent-[var(--ktgw-green-strong)]" />
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!recipient && audience === "user" && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Personne
          <select name="recipient" required defaultValue="" className={`${field} h-12`}>
            <option value="" disabled>
              Choisir…
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Pièce jointe (facultatif — PDF, image, Word, Excel, PowerPoint, 20 Mo max.)
        <input name="file" type="file" accept={ACCEPT} className="text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:font-semibold" />
      </label>
      <label className="flex items-center gap-3 rounded-xl border border-input bg-card p-3 text-sm font-semibold has-checked:border-ktgw-green has-checked:bg-ktgw-green/10">
        <input type="checkbox" name="sendEmail" defaultChecked className="size-4 accent-[var(--ktgw-green-strong)]" />
        Envoyer aussi par e-mail (en plus du dépôt dans l&apos;espace membre)
      </label>

      <ServerError message={error} />
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
          <CheckCircle2 aria-hidden className="size-5" />
          {done === "pending"
            ? "Envoyé à la présidence : la diffusion aura lieu après sa validation."
            : "Envoyé : déposé dans l'espace des destinataires (avec notification) et transmis par e-mail si demandé."}
        </p>
      )}
      <div>
        <Button type="submit" size="xl" disabled={pending}>
          <Send aria-hidden />
          {pending ? "Envoi…" : presidency ? "Envoyer" : "Soumettre à la présidence"}
        </Button>
      </div>
    </form>
  );
}

export function DeleteDocumentButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => window.confirm(`Supprimer « ${title} » ?`) && startTransition(async () => void (await deleteDocument(id)))}
      className="text-destructive"
    >
      <Trash2 aria-hidden />
      Supprimer
    </Button>
  );
}
