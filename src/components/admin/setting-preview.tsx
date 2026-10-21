import { settingLabels } from "@/lib/site/schemas";

/** Aperçu d'un paramètre du site proposé (page Validations). */
export function SettingPreview({ payload }: { payload: { key?: string; value?: unknown } }) {
  if (!payload.key) return null;
  const value = payload.value;

  if (payload.key.startsWith("texts.") && value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, string>);
    return (
      <div className="rounded-2xl bg-muted/50 p-4 text-sm">
        <p className="mb-2 font-semibold">{entries.length} texte(s) modifié(s) — {settingLabels[payload.key]}</p>
        <dl className="flex flex-col gap-1.5">
          {entries.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <details className="rounded-2xl bg-muted/50 p-4 text-sm">
      <summary className="cursor-pointer font-semibold">Voir les valeurs proposées — {settingLabels[payload.key] ?? payload.key}</summary>
      <pre className="mt-3 max-h-96 overflow-auto text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}
