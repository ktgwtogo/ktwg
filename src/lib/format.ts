/** Formatage des dates et nombres selon la langue (fuseau de Lomé). */

const TZ = "Africa/Lome";

export function formatDate(iso: string, locale: string, style: "long" | "month" | "short" = "long") {
  const options: Intl.DateTimeFormatOptions =
    style === "month"
      ? { month: "long", year: "numeric" }
      : style === "short"
        ? { day: "numeric", month: "short", year: "numeric" }
        : { day: "numeric", month: "long", year: "numeric" };
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: TZ }).format(new Date(iso));
}

export function formatTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(
    new Date(iso)
  );
}

/** Jour (« 14 ») et mois abrégé (« nov. ») pour les pastilles de date. */
export function dateParts(iso: string, locale: string) {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat(locale, { day: "2-digit", timeZone: TZ }).format(d),
    month: new Intl.DateTimeFormat(locale, { month: "short", timeZone: TZ }).format(d).replace(".", ""),
    year: new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: TZ }).format(d),
  };
}
