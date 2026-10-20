"use client";

import { CheckCircle2, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { deleteDocument, publishDocument } from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/client";

const MAX = 20 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx";
const field =
  "w-full rounded-xl border border-input bg-card px-4 text-base outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Nom de fichier sûr pour le stockage (sans accents ni caractères spéciaux). */
const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-120);

/** Dépôt d'un document officiel : fichier envoyé au stockage privé, puis publication. */
export function DocumentUpload({ people }: { people: { id: string; label: string }[] }) {
  const [audience, setAudience] = useState<"members" | "user">("members");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    const data = new FormData(e.currentTarget);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) return setError("Choisissez un fichier.");
    if (file.size > MAX) return setError("Fichier trop lourd : 20 Mo maximum.");

    startTransition(async () => {
      const path = `${crypto.randomUUID()}/${safeName(file.name)}`;
      const { error: uploadError } = await createClient().storage.from("documents").upload(path, file, { contentType: file.type });
      if (uploadError) return setError("Le dépôt du fichier a échoué (format accepté : PDF, image, Word, Excel).");
      const result = await publishDocument({
        title: data.get("title"),
        description: data.get("description") || undefined,
        audience,
        recipientId: audience === "user" ? data.get("recipient") || undefined : undefined,
        filePath: path,
        fileName: file.name,
      });
      if (!result.ok) return setError(result.error);
      formRef.current?.reset();
      setAudience("members");
      setDone(true);
    });
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Titre<span className="sr-only"> (obligatoire)</span>
        <input name="title" required minLength={3} maxLength={160} className={`${field} h-12`} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Description (facultatif)
        <textarea name="description" rows={2} maxLength={1000} className={`${field} py-3`} />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold">Destinataires</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["members", "Tous les membres validés"],
              ["user", "Une seule personne"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm has-checked:border-ktgw-green has-checked:bg-ktgw-green/10 has-checked:font-semibold">
              <input type="radio" name="audience" value={value} checked={audience === value} onChange={() => setAudience(value)} className="size-4 accent-[var(--ktgw-green-strong)]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {audience === "user" && (
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
        Fichier (PDF, image, Word, Excel — 20 Mo max.)
        <input name="file" type="file" required accept={ACCEPT} className="text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-4 file:py-2 file:font-semibold" />
      </label>
      <ServerError message={error} />
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
          <CheckCircle2 aria-hidden className="size-5" />
          Document publié. Les destinataires ont reçu une notification.
        </p>
      )}
      <div>
        <Button type="submit" size="xl" disabled={pending}>
          <Upload aria-hidden />
          {pending ? "Publication…" : "Publier le document"}
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
