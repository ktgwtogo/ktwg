"use client";

import { Ban, Camera, CheckCircle2, IdCard, Mail, Save, UserRound } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { issueCard, revokeCard, sendCard, updateCard } from "@/lib/cards/actions";
import { createClient } from "@/lib/supabase/client";
import { PENDING_TEXT, PendingNote } from "@/components/admin/pending-note";
import { membershipTypes } from "@/lib/validations/member";

const input =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Crée la carte d'un membre validé puis ouvre sa fiche. */
export function IssueCardButton({ userId, label = "Créer la carte" }: { userId: string; label?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await issueCard(userId);
            if (!r.ok) return setError(r.error);
            if (r.pending) setSubmitted(true);
            else router.refresh();
          })
        }
      >
        <IdCard aria-hidden />
        {pending ? "Création…" : label}
      </Button>
      <ServerError message={error} />
      <PendingNote show={submitted} />
    </div>
  );
}

export type CardFormValues = {
  card_number: string;
  full_name: string;
  membership_type: string;
  birth_date: string;
  nationality: string;
  issued_at: string;
  expires_at: string;
  notes: string;
  photo_path: string | null;
};

/** Correction des données d'une carte (et remplacement de la photo). */
export function CardEditor({ cardId, userId, initial, active }: { cardId: string; userId: string; initial: CardFormValues; active: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof CardFormValues, value: string) => {
    setV({ ...v, [k]: value });
    setSaved(false);
  };

  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 3 * 1024 * 1024) return setError("Photo JPG, PNG ou WebP, 3 Mo maximum.");
    setUploading(true);
    setError(null);
    const path = `${userId}/carte-${Date.now()}.${file.type.split("/")[1].replace("jpeg", "jpg")}`;
    const { error } = await createClient().storage.from("avatars").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return setError("Le dépôt de la photo a échoué.");
    setV({ ...v, photo_path: path });
    setSaved(false);
  };

  const field = (k: keyof CardFormValues, label: string, type = "text") => (
    <label className="flex flex-col gap-1 text-xs font-semibold">
      {label}
      <input type={type} value={v[k] ?? ""} disabled={!active} onChange={(e) => set(k, e.target.value)} className={input} />
    </label>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setError(null);
          const r = await updateCard(cardId, v);
          if (!r.ok) return setError(r.error);
          if (r.pending) return setSubmitted(true);
          setSaved(true);
          router.refresh();
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {field("full_name", "Nom complet")}
        {field("card_number", "N° de carte")}
        <label className="flex flex-col gap-1 text-xs font-semibold">
          Qualité
          <select value={v.membership_type} disabled={!active} onChange={(e) => set("membership_type", e.target.value)} className={input}>
            {membershipTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        {field("nationality", "Nationalité")}
        {field("birth_date", "Date de naissance", "date")}
        <div />
        {field("issued_at", "Émise le", "date")}
        {field("expires_at", "Valable jusqu'au (5 ans par défaut)", "date")}
      </div>
      <label className="flex flex-col gap-1 text-xs font-semibold">
        Note interne (correction effectuée, remarque…)
        <textarea value={v.notes} disabled={!active} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${input} h-auto py-2`} />
      </label>
      {active && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-border px-4 text-sm font-semibold"
          >
            <Camera aria-hidden className="size-4" />
            {uploading ? "Envoi…" : "Remplacer la photo"}
          </button>
          {v.photo_path !== initial.photo_path && <span className="text-sm text-ktgw-orange">Nouvelle photo : enregistrez pour l&apos;appliquer.</span>}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => uploadPhoto(e.target.files?.[0])}
          />
        </div>
      )}
      <ServerError message={error} />
      <PendingNote show={submitted} />
      {saved && (
        <p role="status" className="flex items-center gap-2 text-sm font-semibold text-ktgw-green-strong">
          <CheckCircle2 aria-hidden className="size-5" />
          Carte mise à jour.
        </p>
      )}
      {active && (
        <div>
          <Button type="submit" size="lg" disabled={pending || uploading}>
            <Save aria-hidden />
            Enregistrer les corrections
          </Button>
        </div>
      )}
    </form>
  );
}

/**
 * Transmission de la carte au membre pour vérification (e-mail + espace, ou espace seul) et révocation.
 * La carte n'est jamais transmise automatiquement : le bureau la contrôle d'abord.
 */
export function CardActions({ cardId, email, active, sent }: { cardId: string; email: string; active: boolean; sent: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string; pending?: boolean }>, message: string) =>
    start(async () => {
      setError(null);
      setDone(null);
      const r = await fn();
      if (!r.ok) return setError(r.error ?? "Erreur.");
      setDone(r.pending ? PENDING_TEXT : message);
      router.refresh();
    });

  if (!active) return null;
  const again = sent ? " à nouveau" : "";
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Après contrôle (données, photo, test du QR code), transmettez la carte au membre : il la vérifie et donne son accord avant de pouvoir la télécharger.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          disabled={pending}
          onClick={() =>
            window.confirm(`Transmettre${again} la carte par e-mail (${email}) et dans l'espace membre ?`) &&
            run(() => sendCard(cardId, "email"), `Carte transmise à ${email} et dans l'espace membre.`)
          }
        >
          <Mail aria-hidden />
          Transmettre par e-mail + espace membre
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={pending}
          onClick={() =>
            window.confirm(`Transmettre${again} la carte uniquement dans l'espace membre ?`) &&
            run(() => sendCard(cardId, "espace"), "Carte déposée dans l'espace membre.")
          }
        >
          <UserRound aria-hidden />
          Transmettre dans l&apos;espace membre seulement
        </Button>
      </div>
      <ServerError message={error} />
      {done && <p className="text-sm font-semibold text-ktgw-green-strong">{done}</p>}
      <div className="border-t pt-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="text-destructive"
          onClick={() => window.confirm("Révoquer cette carte ? Le QR code indiquera « carte révoquée ».") && run(() => revokeCard(cardId), "Carte révoquée.")}
        >
          <Ban aria-hidden />
          Révoquer la carte
        </Button>
      </div>
    </div>
  );
}
