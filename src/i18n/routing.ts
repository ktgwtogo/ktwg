import { defineRouting } from "next-intl/routing";

/**
 * Configuration du routage multilingue.
 * - Français par défaut, servi sans préfixe (/a-propos)
 * - Allemand et anglais préfixés (/de/a-propos, /en/a-propos)
 */
export const routing = defineRouting({
  locales: ["fr", "de", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

/** Libellés affichés dans le sélecteur de langue. */
export const localeLabels: Record<Locale, { short: string; long: string }> = {
  fr: { short: "FR", long: "Français" },
  de: { short: "DE", long: "Deutsch" },
  en: { short: "EN", long: "English" },
};
