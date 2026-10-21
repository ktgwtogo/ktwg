import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { getTextOverrides } from "@/lib/site/settings";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

/** Applique les textes modifiés dans /admin (« Nav.about » → messages.Nav.about). */
function applyOverrides(messages: Messages, overrides: Record<string, string>) {
  const copy: Messages = structuredClone(messages);
  for (const [path, value] of Object.entries(overrides)) {
    const keys = path.split(".");
    let node: Messages | null = copy;
    for (const k of keys.slice(0, -1)) {
      const next: unknown = node?.[k];
      node = typeof next === "object" && next !== null ? (next as Messages) : null;
    }
    const last = keys.at(-1)!;
    // Seules les clés existantes sont remplacées (pas d'ajout de texte arbitraire).
    if (node && typeof node[last] === "string" && value.trim()) node[last] = value;
  }
  return copy;
}

/** Charge les messages de la langue demandée (côté serveur, à chaque requête). */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [messages, overrides] = await Promise.all([
    import(`../messages/${locale}.json`).then((m) => m.default as Messages),
    getTextOverrides(locale),
  ]);

  return {
    locale,
    messages: Object.keys(overrides).length ? applyOverrides(messages, overrides) : messages,
    timeZone: "Africa/Lome",
  };
});
