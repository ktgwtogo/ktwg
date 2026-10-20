import type { KtgwEvent } from "@/content/events";

/**
 * Fichier iCalendar (.ics) d'un événement, en data URI, pour « Ajouter à mon agenda ».
 * Les heures sont exprimées en heure de Lomé (UTC+0, sans heure d'été).
 */
export function icsDataUri(event: KtgwEvent, siteUrl: string) {
  const toIcs = (iso: string) => iso.replace(/[-:]/g, "").slice(0, 13) + "00Z";
  const end = event.end ?? new Date(new Date(`${event.start}Z`).getTime() + 2 * 3600_000).toISOString().slice(0, 16);
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KTGW Togo//Site//FR",
    "BEGIN:VEVENT",
    `UID:${event.slug}@ktgw-togo`,
    `DTSTAMP:${toIcs(new Date().toISOString())}`,
    `DTSTART:${toIcs(event.start)}`,
    `DTEND:${toIcs(end)}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(event.summary)}`,
    `LOCATION:${esc(`${event.venue}, ${event.city}`)}`,
    `URL:${siteUrl}/evenements/${event.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
