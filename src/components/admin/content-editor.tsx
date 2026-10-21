"use client";

import { CheckCircle2, ImagePlus, Save, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { deleteContent, saveContent } from "@/lib/content/actions";
import { getContentType, slugify, type Field, type PageBlock } from "@/lib/content/config";
import { BlocksField } from "./blocks-field";
import type { FormValues, ImageValue } from "@/lib/content/normalize";
import { cn } from "@/lib/utils";
import { ImageField, uploadImage } from "./image-field";

const control =
  "w-full rounded-xl border border-input bg-card px-4 text-base outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40 aria-invalid:border-destructive";

/** Formulaire d'édition d'un contenu du site, construit depuis lib/content/config. */
export function ContentEditor({
  typeId,
  id,
  initial,
  presidency,
}: {
  typeId: string;
  id: string | null;
  initial: FormValues;
  presidency: boolean;
}) {
  const type = getContentType(typeId)!;
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"saved" | "pending" | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (name: string, v: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      if (name === type.titleField && !slugTouched && type.fields.some((f) => f.type === "slug")) next.slug = slugify(String(v));
      return next;
    });
    setDone(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    startTransition(async () => {
      const r = await saveContent(type.id, id, values);
      if (!r.ok) {
        setError(r.error);
        setErrors(r.fieldErrors ?? {});
        return;
      }
      if (r.pending) return setDone("pending");
      if (!id) return router.push(`/admin/contenus/${type.id}`);
      setDone("saved");
      router.refresh();
    });
  };

  const onDelete = () => {
    const title = String(values[type.titleField] || type.singular);
    if (!id || !window.confirm(presidency ? `Supprimer définitivement « ${title} » ?` : `Demander la suppression de « ${title} » ?`)) return;
    startTransition(async () => {
      const r = await deleteContent(type.id, id, title);
      if (!r.ok) return setError(r.error);
      if (r.pending) return setDone("pending");
      router.push(`/admin/contenus/${type.id}`);
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {type.fields.map((f) => (
        <FieldInput key={f.name} field={f} value={values[f.name]} error={errors[f.name]} folder={type.id} onChange={(v) => {
          if (f.type === "slug") setSlugTouched(true);
          set(f.name, v);
        }} />
      ))}

      <ServerError message={error} />
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
          <CheckCircle2 aria-hidden className="size-5" />
          {done === "pending"
            ? "Envoyé à la présidence : la modification sera effective après sa validation."
            : "Enregistré. Le site est mis à jour."}
        </p>
      )}
      <div className="sticky bottom-0 -mx-6 flex flex-wrap gap-3 border-t bg-card/95 px-6 py-4 backdrop-blur">
        <Button type="submit" size="xl" disabled={pending}>
          <Save aria-hidden />
          {pending ? "Enregistrement…" : presidency ? "Enregistrer" : "Soumettre à la présidence"}
        </Button>
        {id && (
          <Button type="button" size="xl" variant="outline" disabled={pending} onClick={onDelete} className="text-destructive">
            <Trash2 aria-hidden />
            {presidency ? "Supprimer" : "Demander la suppression"}
          </Button>
        )}
      </div>
    </form>
  );
}

function FieldInput({
  field: f,
  value,
  error,
  folder,
  onChange,
}: {
  field: Field;
  value: unknown;
  error?: string;
  folder: string;
  onChange: (v: unknown) => void;
}) {
  const id = `champ-${f.name}`;
  const s = typeof value === "string" ? value : "";
  const describedBy = error ? `${id}-erreur` : f.hint ? `${id}-aide` : undefined;
  const common = { id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy };

  let input: React.ReactNode;
  switch (f.type) {
    case "textarea":
    case "paragraphs":
    case "facts":
    case "milestones":
      input = (
        <textarea
          {...common}
          value={s}
          onChange={(e) => onChange(e.target.value)}
          rows={f.type === "paragraphs" ? 12 : f.type === "textarea" ? 3 : 5}
          maxLength={f.max}
          className={cn(control, "py-3")}
        />
      );
      break;
    case "select":
      input = (
        <select {...common} value={s} onChange={(e) => onChange(e.target.value)} className={cn(control, "h-12")}>
          <option value="" disabled>
            Choisir…
          </option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-card p-4 text-sm font-semibold has-checked:border-ktgw-green has-checked:bg-ktgw-green/10">
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--ktgw-green-strong)]" />
          {f.label}
        </label>
      );
    case "image":
    case "imageUrl":
      input = <ImageField value={(value as ImageValue | null) ?? null} onChange={onChange} folder={folder} withAlt={f.type === "image"} />;
      break;
    case "images":
      input = <ImagesField value={(value as ImageValue[]) ?? []} onChange={onChange} folder={folder} />;
      break;
    case "blocks":
      input = <BlocksField value={(value as PageBlock[]) ?? []} onChange={onChange} />;
      break;
    case "progress": {
      const p = (value ?? {}) as Record<string, unknown>;
      const part = (k: string, label: string, type = "text") => (
        <label className="flex flex-col gap-1 text-xs font-semibold">
          {label}
          <input type={type} value={String(p[k] ?? "")} onChange={(e) => onChange({ ...p, [k]: e.target.value })} className={cn(control, "h-11")} />
        </label>
      );
      input = (
        <div className="grid gap-3 rounded-2xl border border-input bg-muted/30 p-3 sm:grid-cols-4">
          {part("label", "Libellé (vide = pas de barre)")}
          {part("current", "Valeur actuelle", "number")}
          {part("target", "Objectif", "number")}
          {part("unit", "Unité (ex. lits)")}
        </div>
      );
      break;
    }
    default:
      input = (
        <input
          {...common}
          type={f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
          value={s}
          onChange={(e) => onChange(f.type === "slug" ? slugify(e.target.value) : e.target.value)}
          maxLength={f.max}
          className={cn(control, "h-12")}
        />
      );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {f.label}
        {f.required && (
          <span aria-hidden className="ml-0.5 text-ktgw-red">
            *
          </span>
        )}
      </label>
      {input}
      {f.hint && !error && (
        <p id={`${id}-aide`} className="text-xs text-muted-foreground">
          {f.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erreur`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Liste d'images (galeries) : ajout multiple, description, retrait. */
function ImagesField({ value, onChange, folder }: { value: ImageValue[]; onChange: (v: ImageValue[]) => void; folder: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const added: ImageValue[] = [];
    for (const file of Array.from(files)) {
      const r = await uploadImage(file, folder);
      if (typeof r === "string") setError(r);
      else added.push(r);
    }
    setBusy(false);
    onChange([...value, ...added]);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.map((img, i) => (
        <ImageField
          key={`${img.src}-${i}`}
          value={img}
          folder={folder}
          onChange={(v) => onChange(v ? value.map((x, j) => (j === i ? v : x)) : value.filter((_, j) => j !== i))}
        />
      ))}
      <label className="inline-flex h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 text-sm font-semibold">
        <ImagePlus aria-hidden className="size-4" />
        {busy ? "Envoi…" : "Ajouter des photos"}
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => add(e.target.files)} />
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
