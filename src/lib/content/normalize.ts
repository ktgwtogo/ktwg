import { reservedSlugs, type ContentType, type Field, type PageBlock } from "./config";

/**
 * Conversion entre les valeurs du formulaire d'édition (chaînes, cases, images)
 * et les colonnes Supabase, avec validation. Utilisé côté serveur avant toute écriture.
 */

export type ImageValue = { src: string; alt: string; width: number; height: number };
export type FormValues = Record<string, unknown>;

const SUPABASE_MEDIA = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/media/`;
const isAllowedSrc = (src: string) => src.startsWith("/images/") || (SUPABASE_MEDIA.length > 30 && src.startsWith(SUPABASE_MEDIA));

function toImage(v: unknown): ImageValue | null {
  if (!v || typeof v !== "object") return null;
  const i = v as Record<string, unknown>;
  if (typeof i.src !== "string" || !isAllowedSrc(i.src)) return null;
  return {
    src: i.src,
    alt: String(i.alt ?? "").trim().slice(0, 300),
    width: Math.max(1, Math.round(Number(i.width) || 1600)),
    height: Math.max(1, Math.round(Number(i.height) || 1066)),
  };
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Valeurs du formulaire → ligne de la table. Renvoie les erreurs par champ. */
export function toRow(type: ContentType, values: FormValues): { row: Record<string, unknown>; errors: Record<string, string> } {
  const row: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const fail = (f: Field, message: string) => (errors[f.name] = message);

  for (const f of type.fields) {
    const raw = values[f.name];
    const s = str(raw);
    const missing = () => fail(f, "Champ obligatoire.");

    switch (f.type) {
      case "text":
      case "suggest":
      case "textarea": {
        if (!s && f.required) missing();
        else if (f.max && s.length > f.max) fail(f, `${f.max} caractères maximum.`);
        row[f.name] = s || (f.required ? s : f.name === "body" ? "" : null);
        break;
      }
      case "slug": {
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) || s.length > 80) fail(f, "Lettres minuscules, chiffres et tirets uniquement.");
        else if (type.table === "pages" && reservedSlugs.includes(s)) fail(f, "Cette adresse est déjà une page du site : choisissez-en une autre.");
        row[f.name] = s;
        break;
      }
      case "placements": {
        const list = (Array.isArray(raw) ? raw : []).map(String).filter((p) => p === "actualites" || p === "accueil" || /^page:[a-z0-9]+(-[a-z0-9]+)*$/.test(p));
        if (!list.length && f.required) fail(f, "Choisissez au moins un emplacement.");
        row[f.name] = [...new Set(list)];
        break;
      }
      case "links": {
        const links = s
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const [label, url] = l.includes("|") ? l.split("|").map((x) => x.trim()) : [l, l];
            return /^https:\/\/\S+$/.test(url) ? { label: (label || url).slice(0, 120), url: url.slice(0, 500) } : null;
          });
        if (links.some((x) => !x)) fail(f, "Chaque ligne : Texte du lien | https://adresse");
        row[f.name] = links.filter(Boolean).slice(0, 20);
        break;
      }
      case "blocks": {
        const list = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
        const blocks: PageBlock[] = [];
        for (const b of list) {
          if (b.type === "text") blocks.push({ type: "text", heading: str(b.heading).slice(0, 160), body: str(b.body).slice(0, 10000) });
          else if (b.type === "imageText")
            blocks.push({ type: "imageText", heading: str(b.heading).slice(0, 160), body: str(b.body).slice(0, 10000), image: toImage(b.image), imageRight: Boolean(b.imageRight) });
          else if (b.type === "image") blocks.push({ type: "image", image: toImage(b.image), caption: str(b.caption).slice(0, 300) });
          else if (b.type === "button") {
            const href = str(b.href);
            if (!/^(\/[^/]|\/$|https:\/\/|mailto:|tel:)/.test(href)) fail(f, "Chaque bouton doit avoir un lien (« /page », « https://… », « mailto: » ou « tel: »).");
            blocks.push({ type: "button", label: str(b.label).slice(0, 60) || "En savoir plus", href, style: b.style === "outline" ? "outline" : "primary" });
          }
        }
        if (!blocks.length && f.required) fail(f, "Ajoutez au moins un bloc.");
        row[f.name] = blocks;
        break;
      }
      case "paragraphs": {
        const paragraphs = s.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
        if (!paragraphs.length && f.required) missing();
        row[f.name] = paragraphs;
        break;
      }
      case "date": {
        if (!s) {
          if (f.required) missing();
          row[f.name] = null;
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) fail(f, "Date invalide.");
        else row[f.name] = s;
        break;
      }
      case "datetime": {
        if (!s) {
          if (f.required) missing();
          row[f.name] = null;
        } else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) fail(f, "Date et heure invalides.");
        else row[f.name] = `${s}:00+00:00`; // heure de Lomé = UTC
        break;
      }
      case "number": {
        if (s === "") {
          if (f.required) missing();
          row[f.name] = f.name === "sort_order" ? 0 : null;
        } else if (!Number.isFinite(Number(s))) fail(f, "Nombre invalide.");
        else row[f.name] = Number(s);
        break;
      }
      case "select": {
        if (!f.options?.some((o) => o.value === s)) fail(f, "Choisissez une option.");
        row[f.name] = s;
        break;
      }
      case "checkbox":
        row[f.name] = raw === true || raw === "on" || raw === "true";
        break;
      case "url": {
        if (!s) row[f.name] = null;
        else if (!/^(\/[^/]|https:\/\/)/.test(s) || s.length > 500) fail(f, "Adresse commençant par « / » ou « https:// ».");
        else row[f.name] = s;
        break;
      }
      case "image": {
        const img = toImage(raw);
        if (!img) {
          if (f.required) fail(f, "Ajoutez une image.");
          row[f.name] = null;
        } else if (!img.alt) fail(f, "Décrivez l'image (texte alternatif, pour l'accessibilité).");
        else row[f.name] = img;
        break;
      }
      case "imageUrl": {
        const img = toImage(raw);
        row[f.name] = img?.src ?? null;
        break;
      }
      case "images": {
        const list = Array.isArray(raw) ? raw.map(toImage).filter((i): i is ImageValue => i !== null) : [];
        if (list.some((i) => !i.alt)) fail(f, "Décrivez chaque image (texte alternatif).");
        row[f.name] = list;
        break;
      }
      case "facts": {
        const facts = s
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const i = l.indexOf(":");
            return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : null;
          });
        if (facts.some((x) => !x)) fail(f, "Chaque ligne doit suivre le format « Libellé : valeur ».");
        row[f.name] = facts.filter(Boolean);
        break;
      }
      case "milestones": {
        const items = s
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*:\s*(.+)$/);
            return m ? { date: m[1], text: m[2] } : null;
          });
        if (items.some((x) => !x)) fail(f, "Chaque ligne doit suivre le format « AAAA-MM-JJ : texte ».");
        row[f.name] = items.filter(Boolean);
        break;
      }
      case "progress": {
        const p = (raw ?? {}) as Record<string, unknown>;
        const label = str(p.label);
        if (!label) {
          row[f.name] = null;
          break;
        }
        const current = Number(p.current);
        const target = Number(p.target);
        if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) fail(f, "Indiquez la valeur actuelle et l'objectif.");
        row[f.name] = { label, current, target, unit: str(p.unit) };
        break;
      }
    }
  }
  return { row, errors };
}

/** Ligne de la table → valeurs initiales du formulaire. */
export function toFormValues(type: ContentType, row: Record<string, unknown> | null): FormValues {
  const values: FormValues = {};
  for (const f of type.fields) {
    const v = row?.[f.name];
    switch (f.type) {
      case "paragraphs":
        values[f.name] = Array.isArray(v) ? (v as string[]).join("\n\n") : "";
        break;
      case "datetime":
        values[f.name] = typeof v === "string" ? new Date(v).toISOString().slice(0, 16) : "";
        break;
      case "checkbox":
        values[f.name] = row ? Boolean(v) : f.name === "published" ? false : false;
        break;
      case "number":
        values[f.name] = v === null || v === undefined ? "" : String(v);
        break;
      case "placements":
        values[f.name] = Array.isArray(v) ? v : ["actualites", "accueil"];
        break;
      case "links":
        values[f.name] = Array.isArray(v) ? (v as { label: string; url: string }[]).map((x) => `${x.label} | ${x.url}`).join("\n") : "";
        break;
      case "facts":
        values[f.name] = Array.isArray(v) ? (v as { label: string; value: string }[]).map((x) => `${x.label} : ${x.value}`).join("\n") : "";
        break;
      case "milestones":
        values[f.name] = Array.isArray(v) ? (v as { date: string; text: string }[]).map((x) => `${x.date} : ${x.text}`).join("\n") : "";
        break;
      case "imageUrl":
        values[f.name] = typeof v === "string" ? { src: v, alt: "Logo", width: 400, height: 400 } : null;
        break;
      case "image":
      case "images":
      case "blocks":
      case "progress":
        values[f.name] = v ?? (f.type === "images" || f.type === "blocks" ? [] : null);
        break;
      default:
        values[f.name] = v ?? "";
    }
  }
  return values;
}
