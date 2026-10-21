"use client";

import { ArrowDown, ArrowUp, CheckCircle2, Plus, Save, Search, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { ServerError } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { navIcons, type NavChild, type NavEntry, type NavIconName } from "@/config/navigation";
import type { SocialNetwork } from "@/config/site";
import type { ImageValue } from "@/lib/content/normalize";
import { saveSetting } from "@/lib/site/actions";
import type { HeroSlide, SiteConfigData } from "@/lib/site/types";
import { ImageField } from "./image-field";

const input =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-ktgw-orange focus-visible:ring-3 focus-visible:ring-ktgw-sun/40";

/** Enregistrement d'un paramètre, avec message de résultat. */
function useSave(key: string) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"saved" | "pending" | null>(null);
  const save = (value: unknown) =>
    start(async () => {
      setError(null);
      setDone(null);
      const r = await saveSetting(key, value);
      if (!r.ok) setError(r.error);
      else setDone(r.pending ? "pending" : "saved");
    });
  const footer = (
    <div className="flex flex-col gap-3">
      <ServerError message={error} />
      {done && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-ktgw-green/10 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
          <CheckCircle2 aria-hidden className="size-5" />
          {done === "pending" ? "Envoyé à la présidence pour validation." : "Enregistré : le site est mis à jour."}
        </p>
      )}
    </div>
  );
  return { save, pending, footer };
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-semibold ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}

function SaveButton({ pending, presidency }: { pending: boolean; presidency: boolean }) {
  return (
    <Button type="submit" size="lg" disabled={pending}>
      <Save aria-hidden />
      {pending ? "Enregistrement…" : presidency ? "Enregistrer" : "Soumettre à la présidence"}
    </Button>
  );
}

// ── Coordonnées ──

export function ContactSettings({ initial, presidency }: { initial: Pick<SiteConfigData, "togo" | "germany">; presidency: boolean }) {
  const [v, setV] = useState(initial);
  const { save, pending, footer } = useSave("contact");
  const togo = (patch: Partial<SiteConfigData["togo"]>) => setV({ ...v, togo: { ...v.togo, ...patch } });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(v);
      }}
      className="flex flex-col gap-6"
    >
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-bold">Siège au Togo</legend>
        <Field label="Rue">
          <input value={v.togo.address.street} onChange={(e) => togo({ address: { ...v.togo.address, street: e.target.value } })} className={input} />
        </Field>
        <Field label="Quartier">
          <input value={v.togo.address.district} onChange={(e) => togo({ address: { ...v.togo.address, district: e.target.value } })} className={input} />
        </Field>
        <Field label="Ville">
          <input value={v.togo.address.city} onChange={(e) => togo({ address: { ...v.togo.address, city: e.target.value } })} className={input} />
        </Field>
        <Field label="Pays">
          <input value={v.togo.address.country} onChange={(e) => togo({ address: { ...v.togo.address, country: e.target.value } })} className={input} />
        </Field>
        <Field label="E-mail de contact" className="sm:col-span-2">
          <input type="email" value={v.togo.email} onChange={(e) => togo({ email: e.target.value })} className={input} />
        </Field>
        <Field label="Lien Google Maps (bouton « Itinéraire »)" className="sm:col-span-2">
          <input value={v.togo.mapsUrl} onChange={(e) => togo({ mapsUrl: e.target.value })} className={input} />
        </Field>
        <Field label="Lien d'intégration de la carte (https://www.google.com/maps?…&output=embed)" className="sm:col-span-2">
          <input value={v.togo.mapsEmbedUrl} onChange={(e) => togo({ mapsEmbedUrl: e.target.value })} className={input} />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-bold">Téléphones</legend>
        {v.togo.phones.map((p, i) => (
          <div key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <Field label="Affiché (ex. +228 90 00 00 00)">
              <input value={p.display} onChange={(e) => togo({ phones: v.togo.phones.map((x, j) => (j === i ? { ...x, display: e.target.value } : x)) })} className={input} />
            </Field>
            <Field label="Format international (+22890000000)">
              <input value={p.e164} onChange={(e) => togo({ phones: v.togo.phones.map((x, j) => (j === i ? { ...x, e164: e.target.value } : x)) })} className={input} />
            </Field>
            <label className="flex h-10 items-center gap-2 text-sm">
              <input type="checkbox" checked={p.whatsapp} onChange={(e) => togo({ phones: v.togo.phones.map((x, j) => (j === i ? { ...x, whatsapp: e.target.checked } : x)) })} className="size-4 accent-[var(--ktgw-green-strong)]" />
              WhatsApp
            </label>
            <button type="button" aria-label="Retirer ce numéro" onClick={() => togo({ phones: v.togo.phones.filter((_, j) => j !== i) })} className="flex h-10 items-center rounded-lg px-2 text-destructive hover:bg-destructive/10">
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>
        ))}
        {v.togo.phones.length < 4 && (
          <button type="button" onClick={() => togo({ phones: [...v.togo.phones, { display: "", e164: "", whatsapp: false }] })} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ktgw-green-strong">
            <Plus aria-hidden className="size-4" />
            Ajouter un numéro
          </button>
        )}
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 font-bold">Association en Allemagne</legend>
        {(
          [
            ["name", "Nom"],
            ["city", "Ville"],
            ["email", "E-mail"],
            ["website", "Site web"],
          ] as const
        ).map(([k, label]) => (
          <Field key={k} label={label}>
            <input value={v.germany[k]} onChange={(e) => setV({ ...v, germany: { ...v.germany, [k]: e.target.value } })} className={input} />
          </Field>
        ))}
        <Field label="Téléphone affiché">
          <input value={v.germany.phone.display} onChange={(e) => setV({ ...v, germany: { ...v.germany, phone: { ...v.germany.phone, display: e.target.value } } })} className={input} />
        </Field>
        <Field label="Téléphone international">
          <input value={v.germany.phone.e164} onChange={(e) => setV({ ...v, germany: { ...v.germany, phone: { ...v.germany.phone, e164: e.target.value } } })} className={input} />
        </Field>
      </fieldset>
      {footer}
      <div>
        <SaveButton pending={pending} presidency={presidency} />
      </div>
    </form>
  );
}

const networks: [SocialNetwork, string][] = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["youtube", "YouTube"],
  ["linkedin", "LinkedIn"],
  ["whatsapp", "WhatsApp (https://wa.me/228…)"],
];

export function SocialSettings({ initial, presidency }: { initial: SiteConfigData["socials"]; presidency: boolean }) {
  const [v, setV] = useState(initial);
  const { save, pending, footer } = useSave("socials");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(v);
      }}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-muted-foreground">Adresse complète (https://…). Laisser vide masque l&apos;icône sur le site.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {networks.map(([k, label]) => (
          <Field key={k} label={label}>
            <input value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className={input} />
          </Field>
        ))}
      </div>
      {footer}
      <div>
        <SaveButton pending={pending} presidency={presidency} />
      </div>
    </form>
  );
}

// ── Menu principal ──

const move = <T,>(list: T[], i: number, d: -1 | 1) => {
  const next = [...list];
  [next[i], next[i + d]] = [next[i + d], next[i]];
  return next;
};

function OrderButtons({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" aria-label="Monter" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30">
        <ArrowUp aria-hidden className="size-4" />
      </button>
      <button type="button" aria-label="Descendre" disabled={index === length - 1} onClick={() => onMove(1)} className="rounded-lg p-1.5 hover:bg-muted disabled:opacity-30">
        <ArrowDown aria-hidden className="size-4" />
      </button>
      <button type="button" aria-label="Supprimer" onClick={onRemove} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10">
        <Trash2 aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/**
 * Menu principal : libellés, liens, ordre, sous-menus.
 * Un libellé vide garde la traduction d'origine (français, allemand, anglais).
 */
export function MenuSettings({
  initial,
  labels,
  pages,
  presidency,
}: {
  initial: NavEntry[];
  labels: Record<string, string>;
  pages: { href: string; title: string }[];
  presidency: boolean;
}) {
  const [items, setItems] = useState<NavEntry[]>(initial);
  const { save, pending, footer } = useSave("navigation.main");
  const setItem = (i: number, patch: Partial<NavEntry>) => setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setChild = (i: number, c: number, patch: Partial<NavChild>) =>
    setItem(i, { children: items[i].children?.map((x, j) => (j === c ? { ...x, ...patch } : x)) });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(items);
      }}
      className="flex flex-col gap-4"
    >
      <datalist id="liens-site">
        {pages.map((p) => (
          <option key={p.href} value={p.href}>
            {p.title}
          </option>
        ))}
      </datalist>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-input bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <Field label="Libellé">
                <input value={item.label ?? ""} placeholder={item.key ? labels[`Nav.${item.key}`] : "Nouveau lien"} onChange={(e) => setItem(i, { label: e.target.value })} className={input} />
              </Field>
              <Field label="Lien">
                <input value={item.href} list="liens-site" onChange={(e) => setItem(i, { href: e.target.value })} className={input} />
              </Field>
            </div>
            <OrderButtons index={i} length={items.length} onMove={(d) => setItems(move(items, i, d))} onRemove={() => setItems(items.filter((_, j) => j !== i))} />
          </div>

          <div className="ml-4 flex flex-col gap-2 border-l-2 border-ktgw-sun/60 pl-4">
            {(item.children ?? []).map((child, c) => (
              <div key={c} className="flex items-start gap-3">
                <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <input
                    aria-label="Libellé du sous-lien"
                    value={child.label ?? ""}
                    placeholder={child.key ? labels[`Nav.${child.key}`] : "Libellé"}
                    onChange={(e) => setChild(i, c, { label: e.target.value })}
                    className={input}
                  />
                  <input
                    aria-label="Description du sous-lien"
                    value={child.description ?? ""}
                    placeholder={child.key ? labels[`Nav.desc.${child.key}`] : "Description courte"}
                    onChange={(e) => setChild(i, c, { description: e.target.value })}
                    className={input}
                  />
                  <input aria-label="Lien du sous-lien" value={child.href} list="liens-site" onChange={(e) => setChild(i, c, { href: e.target.value })} className={input} />
                  <select aria-label="Icône" value={child.icon} onChange={(e) => setChild(i, c, { icon: e.target.value as NavIconName })} className={input}>
                    {Object.keys(navIcons).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <OrderButtons
                  index={c}
                  length={item.children!.length}
                  onMove={(d) => setItem(i, { children: move(item.children!, c, d) })}
                  onRemove={() => setItem(i, { children: item.children!.filter((_, j) => j !== c) })}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItem(i, { children: [...(item.children ?? []), { label: "", href: "/", icon: "Link2" }] })}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ktgw-green-strong"
            >
              <Plus aria-hidden className="size-4" />
              Ajouter un sous-lien
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, { label: "", href: "/" }])} className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 text-sm font-semibold">
        <Plus aria-hidden className="size-4" />
        Ajouter une entrée de menu
      </button>
      {footer}
      <div>
        <SaveButton pending={pending} presidency={presidency} />
      </div>
    </form>
  );
}

// ── Diaporama de l'accueil ──

export function HeroSettings({ initial, presidency }: { initial: HeroSlide[]; presidency: boolean }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initial);
  const { save, pending, footer } = useSave("home.hero");
  const set = (i: number, patch: Partial<HeroSlide>) => setSlides(slides.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(slides);
      }}
      className="flex flex-col gap-4"
    >
      {slides.map((s, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-input bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <p className="font-bold">Diapositive {i + 1}</p>
            <OrderButtons index={i} length={slides.length} onMove={(d) => setSlides(move(slides, i, d))} onRemove={() => setSlides(slides.filter((_, j) => j !== i))} />
          </div>
          <ImageField value={s.image as ImageValue} onChange={(img) => img && set(i, { image: img })} folder="accueil" />
          <Field label="Sur-titre">
            <input value={s.eyebrow} onChange={(e) => set(i, { eyebrow: e.target.value })} className={input} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["Début du titre", "Mot mis en valeur", "Fin du titre"] as const).map((label, k) => (
              <Field key={label} label={label}>
                <input
                  value={s.title[k]}
                  onChange={(e) => {
                    const title = [...s.title] as HeroSlide["title"];
                    title[k] = e.target.value;
                    set(i, { title });
                  }}
                  className={input}
                />
              </Field>
            ))}
          </div>
          <Field label="Texte">
            <textarea value={s.subtitle} onChange={(e) => set(i, { subtitle: e.target.value })} rows={2} className={`${input} h-auto py-2`} />
          </Field>
        </div>
      ))}
      {slides.length < 8 && (
        <button
          type="button"
          onClick={() => setSlides([...slides, { ...slides[0], eyebrow: "", title: ["", "", ""], subtitle: "" }])}
          className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 text-sm font-semibold"
        >
          <Plus aria-hidden className="size-4" />
          Ajouter une diapositive
        </button>
      )}
      {footer}
      <div>
        <SaveButton pending={pending} presidency={presidency} />
      </div>
    </form>
  );
}

// ── Textes du site ──

/** Tous les textes traduits du site (menus, boutons, pied de page…) pour une langue. */
export function TextSettings({
  locale,
  base,
  overrides,
  presidency,
}: {
  locale: string;
  base: Record<string, string>;
  overrides: Record<string, string>;
  presidency: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(overrides);
  const [query, setQuery] = useState("");
  const { save, pending, footer } = useSave(`texts.${locale}`);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, string[]>();
    for (const key of Object.keys(base)) {
      if (q && !key.toLowerCase().includes(q) && !base[key].toLowerCase().includes(q) && !(values[key] ?? "").toLowerCase().includes(q)) continue;
      const ns = key.split(".")[0];
      map.set(ns, [...(map.get(ns) ?? []), key]);
    }
    return [...map.entries()];
  }, [base, query, values]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(values);
      }}
      className="flex flex-col gap-4"
    >
      <label className="relative">
        <span className="sr-only">Rechercher un texte</span>
        <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un texte (ex. « don », « contact »)…" className={`${input} pl-9`} />
      </label>
      <p className="text-sm text-muted-foreground">Le texte d&apos;origine est affiché en gris. Écrivez par-dessus pour le remplacer ; videz le champ pour revenir à l&apos;original.</p>
      {groups.map(([ns, keys]) => (
        <details key={ns} open={Boolean(query)} className="rounded-2xl border border-input bg-muted/20 p-4">
          <summary className="cursor-pointer font-bold">
            {ns} <span className="text-sm font-normal text-muted-foreground">({keys.length})</span>
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {keys.map((key) => (
              <Field key={key} label={key.slice(ns.length + 1)}>
                <textarea
                  value={values[key] ?? ""}
                  placeholder={base[key]}
                  rows={base[key].length > 90 ? 3 : 1}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                  className={`${input} h-auto py-2 font-normal`}
                />
              </Field>
            ))}
          </div>
        </details>
      ))}
      {footer}
      <div className="sticky bottom-0 -mx-6 border-t bg-card/95 px-6 py-4 backdrop-blur">
        <SaveButton pending={pending} presidency={presidency} />
      </div>
    </form>
  );
}
