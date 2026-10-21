import { getContentType } from "@/lib/content/config";

/** Aperçu lisible d'un contenu proposé (page Validations). */
export function ContentPreview({ payload }: { payload: { type?: string; id?: string | null; row?: Record<string, unknown> } }) {
  const type = payload.type ? getContentType(payload.type) : undefined;
  if (!type || !payload.row) return null;
  const row = payload.row;

  return (
    <dl className="grid gap-3 rounded-2xl bg-muted/50 p-4 text-sm sm:grid-cols-2">
      {type.fields.map((f) => {
        const v = row[f.name];
        if (v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length)) return null;
        let shown: React.ReactNode;
        if (f.type === "image" || f.type === "imageUrl") {
          const src = typeof v === "string" ? v : (v as { src: string }).src;
          // eslint-disable-next-line @next/next/no-img-element
          shown = <img src={src} alt="" className="mt-1 h-24 w-36 rounded-lg object-cover" />;
        } else if (f.type === "images") {
          shown = (
            <span className="mt-1 flex flex-wrap gap-2">
              {(v as { src: string }[]).map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.src} src={img.src} alt="" className="h-16 w-24 rounded-lg object-cover" />
              ))}
            </span>
          );
        } else if (f.type === "paragraphs") {
          shown = <span className="mt-1 block whitespace-pre-line">{(v as string[]).join("\n\n")}</span>;
        } else if (f.type === "checkbox") {
          shown = v ? "Oui" : "Non";
        } else if (f.type === "select") {
          shown = f.options?.find((o) => o.value === v)?.label ?? String(v);
        } else if (f.type === "facts") {
          shown = (v as { label: string; value: string }[]).map((x) => `${x.label} : ${x.value}`).join(" · ");
        } else if (f.type === "milestones") {
          shown = (v as { date: string; text: string }[]).map((x) => `${x.date} — ${x.text}`).join(" · ");
        } else if (f.type === "progress") {
          const p = v as { label: string; current: number; target: number; unit: string };
          shown = `${p.label} : ${p.current} / ${p.target} ${p.unit}`;
        } else if (f.type === "datetime") {
          shown = String(v).slice(0, 16).replace("T", " à ");
        } else {
          shown = String(v);
        }
        const wide = ["paragraphs", "images", "textarea"].includes(f.type);
        return (
          <div key={f.name} className={wide ? "sm:col-span-2" : undefined}>
            <dt className="font-semibold">{f.label}</dt>
            <dd className="text-muted-foreground">{shown}</dd>
          </div>
        );
      })}
    </dl>
  );
}
