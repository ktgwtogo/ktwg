"use client";

import { CheckCircle2, FileUp, Save, Send, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { audiences } from "@/lib/admin/audiences";
import { countAudience, deleteReport, saveReport, sendMailing } from "@/lib/admin/comms-actions";
import { createClient } from "@/lib/supabase/client";

const input =
  "w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Rédaction et envoi d'un e-mail groupé. */
export function MailingForm({ presidency }: { presidency: boolean }) {
  const [audience, setAudience] = useState<string>(audiences[0].id);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    setCount(null);
    countAudience(audience).then((n) => alive && setCount(n));
    return () => {
      alive = false;
    };
  }, [audience]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    if (!window.confirm(presidency ? `Envoyer cet e-mail à ${count ?? "?"} destinataire(s) ?` : "Soumettre cet envoi à la présidence ?")) return;
    start(async () => {
      setError(null);
      setDone(null);
      const r = await sendMailing({ subject: d.get("subject"), body: d.get("body"), audience });
      if (!r.ok) return setError(r.error);
      setDone(r.pending ? "Envoyé à la présidence : l'e-mail partira après sa validation." : `E-mail envoyé à ${r.sent} destinataire(s).`);
      form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Destinataires
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className={`${input} h-11`}>
          {audiences.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        <span className="text-xs font-normal text-muted-foreground">{count === null ? "Calcul…" : `${count} destinataire(s)`}</span>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Objet
        <input name="subject" required maxLength={200} className={`${input} h-11`} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Message
        <textarea name="body" required rows={12} maxLength={20000} className={`${input} py-3`} placeholder={"Bonjour,\n\n…\n\nL'équipe KTGW Togo"} />
        <span className="text-xs font-normal text-muted-foreground">
          Chaque personne reçoit un e-mail individuel. Un lien de désinscription est ajouté automatiquement pour la newsletter.
        </span>
      </label>
      <ServerError message={error} />
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
          <CheckCircle2 aria-hidden className="size-5" />
          {done}
        </p>
      )}
      <div>
        <Button type="submit" size="xl" disabled={pending || count === 0}>
          <Send aria-hidden />
          {pending ? "Envoi…" : presidency ? "Envoyer" : "Soumettre à la présidence"}
        </Button>
      </div>
    </form>
  );
}

const categories = [
  { value: "activite", label: "Rapport d'activité" },
  { value: "financier", label: "Rapport financier" },
  { value: "projet", label: "Rapport de projet" },
  { value: "reunion", label: "Compte rendu de réunion" },
  { value: "autre", label: "Autre" },
];

export type ReportDraft = {
  id: string | null;
  title: string;
  period: string;
  category: string;
  summary: string;
  body: string;
  audience: string[];
  filePath: string | null;
  fileName: string | null;
};

/** Rédaction d'un rapport : brouillon, pièce jointe, postes destinataires, soumission. */
export function ReportEditor({ draft, positions, presidency }: { draft: ReportDraft; positions: { id: string; name: string }[]; presidency: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(draft);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return setError("Fichier trop lourd : 20 Mo maximum.");
    setUploading(true);
    setError(null);
    const name = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120);
    const path = `rapports/${crypto.randomUUID()}/${name}`;
    const { error } = await createClient().storage.from("documents").upload(path, file, { contentType: file.type });
    setUploading(false);
    if (error) return setError("Le dépôt du fichier a échoué (PDF, Word, Excel ou image).");
    setV({ ...v, filePath: path, fileName: file.name });
  };

  const save = (submit: boolean) => {
    if (submit && !window.confirm(presidency ? "Valider et diffuser ce rapport au bureau ?" : "Soumettre ce rapport à la présidence ? Vous ne pourrez plus le modifier.")) return;
    start(async () => {
      setError(null);
      const r = await saveReport(v.id, v, submit);
      if (!r.ok) return setError(r.error);
      router.push("/admin/rapports");
      router.refresh();
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Titre
          <input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} className={`${input} h-11`} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Période (ex. « Octobre 2026 »)
          <input value={v.period} onChange={(e) => setV({ ...v, period: e.target.value })} className={`${input} h-11`} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Catégorie
          <select value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })} className={`${input} h-11`}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Résumé (envoyé par e-mail au bureau)
        <textarea value={v.summary} onChange={(e) => setV({ ...v, summary: e.target.value })} rows={3} maxLength={1000} className={`${input} py-3`} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Contenu du rapport
        <textarea value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} rows={14} className={`${input} py-3`} />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Destinataires (vide = tout le bureau ; la présidence le reçoit toujours)</legend>
        <div className="flex flex-wrap gap-2">
          {positions.map((p) => (
            <label key={p.id} className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 text-sm has-checked:border-ktgw-green has-checked:bg-ktgw-green/10">
              <input
                type="checkbox"
                checked={v.audience.includes(p.id)}
                onChange={(e) => setV({ ...v, audience: e.target.checked ? [...v.audience, p.id] : v.audience.filter((a) => a !== p.id) })}
                className="size-4 accent-[var(--ktgw-green-strong)]"
              />
              {p.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 text-sm font-semibold">
          <FileUp aria-hidden className="size-4" />
          {uploading ? "Envoi…" : v.fileName ? "Remplacer la pièce jointe" : "Joindre un fichier (PDF, Excel…)"}
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
        {v.fileName && <span className="text-sm text-muted-foreground">{v.fileName}</span>}
      </div>
      <ServerError message={error} />
      <div className="flex flex-wrap gap-3">
        <Button type="button" size="xl" variant="outline" disabled={pending || uploading} onClick={() => save(false)}>
          <Save aria-hidden />
          Enregistrer le brouillon
        </Button>
        <Button type="button" size="xl" disabled={pending || uploading} onClick={() => save(true)}>
          <Send aria-hidden />
          {presidency ? "Valider et diffuser" : "Soumettre à la présidence"}
        </Button>
      </div>
    </form>
  );
}

export function DeleteReportButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      className="text-destructive"
      onClick={() =>
        window.confirm("Supprimer ce rapport ?") &&
        start(async () => {
          await deleteReport(id);
          router.refresh();
        })
      }
    >
      <Trash2 aria-hidden />
      Supprimer
    </Button>
  );
}
