"use client";

import { Download, Eye, FileUp, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { addMemberFile, deleteMemberFile } from "@/lib/admin/member-files";
import { createClient } from "@/lib/supabase/client";
import { PendingNote } from "./pending-note";

export const fileCategories = [
  { value: "identite", label: "Pièce d'identité" },
  { value: "adhesion", label: "Bulletin / dossier d'adhésion" },
  { value: "paiement", label: "Justificatif de paiement" },
  { value: "attestation", label: "Attestation / certificat" },
  { value: "courrier", label: "Courrier" },
  { value: "photo", label: "Photo" },
  { value: "autre", label: "Autre" },
] as const;

const MAX = 20 * 1024 * 1024;
const input =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";
const safeName = (name: string) => name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120);

type MemberFile = { id: string; title: string; category: string; notes: string | null; file_name: string; size_bytes: number | null; created_at: string };

/** Pièces du dossier d'un membre : liste (voir, télécharger, supprimer) et ajout. */
export function MemberFiles({ userId, files, canEdit, dates }: { userId: string; files: MemberFile[]; canEdit: boolean; dates: Record<string, string> }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) return setError("Choisissez un fichier.");
    if (file.size > MAX) return setError("Fichier trop lourd : 20 Mo maximum.");
    setError(null);
    start(async () => {
      const path = `dossiers/${userId}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const { error: up } = await createClient().storage.from("documents").upload(path, file, { contentType: file.type });
      if (up) return setError("Le dépôt a échoué (PDF, image, Word ou Excel, 20 Mo max.).");
      const r = await addMemberFile({
        userId,
        title: data.get("title"),
        category: data.get("category"),
        notes: data.get("notes") || undefined,
        filePath: path,
        fileName: file.name,
        size: file.size,
      });
      if (!r.ok) return setError(r.error);
      setSubmitted(Boolean(r.pending));
      formRef.current?.reset();
      router.refresh();
    });
  };

  const label = (c: string) => fileCategories.find((x) => x.value === c)?.label ?? c;

  return (
    <div className="flex flex-col gap-4">
      {!files.length ? (
        <p className="text-sm text-muted-foreground">Aucune pièce classée dans ce dossier.</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {files.map((f) => (
            <li key={f.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">
                  <span className="mr-2 rounded-full bg-ktgw-green/10 px-2 py-0.5 text-xs text-ktgw-green-strong">{label(f.category)}</span>
                  {f.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {f.file_name}
                  {f.size_bytes ? ` · ${Math.max(1, Math.round(f.size_bytes / 1024))} Ko` : ""} · {dates[f.id]}
                </p>
                {f.notes && <p className="text-xs text-muted-foreground">{f.notes}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <a href={`/api/member-files/${f.id}?voir=1`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold hover:bg-muted">
                  <Eye aria-hidden className="size-4" />
                  Voir
                </a>
                <a href={`/api/member-files/${f.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold hover:bg-muted">
                  <Download aria-hidden className="size-4" />
                  Télécharger
                </a>
                {canEdit && (
                  <button
                    type="button"
                    aria-label={`Supprimer ${f.title}`}
                    disabled={pending}
                    onClick={() =>
                      window.confirm(`Supprimer « ${f.title} » du dossier ?`) &&
                      start(async () => {
                        const r = await deleteMemberFile(f.id);
                        if (!r.ok) setError(r.error);
                        else setSubmitted(Boolean(r.pending));
                        router.refresh();
                      })
                    }
                    className="inline-flex h-9 items-center rounded-lg px-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl bg-muted/50 p-4">
          <p className="text-sm font-bold">Ajouter une pièce au dossier</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Titre
              <input name="title" required minLength={2} maxLength={160} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold">
              Type de pièce
              <select name="category" defaultValue="adhesion" className={input}>
                {fileCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Note (facultatif)
            <input name="notes" maxLength={1000} className={input} />
          </label>
          <input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx" className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-card file:px-4 file:py-2 file:font-semibold" />
          <ServerError message={error} />
          <PendingNote show={submitted} />
          <div>
            <Button type="submit" size="lg" disabled={pending}>
              <FileUp aria-hidden />
              {pending ? "Envoi…" : "Classer dans le dossier"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
