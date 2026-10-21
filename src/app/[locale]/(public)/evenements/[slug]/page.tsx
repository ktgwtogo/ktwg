import { CalendarPlus, Clock, MapPin, Monitor, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { EventRegistrationForm } from "@/components/forms/other-forms";
import { SampleBadge } from "@/components/shared/badges";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { getEvent, getEvents } from "@/lib/content/repository";
import { routing } from "@/i18n/routing";
import { formatDate, formatTime } from "@/lib/format";
import { icsDataUri } from "@/lib/ics";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const events = await getEvents();
  return routing.locales.flatMap((locale) => events.map((e) => ({ locale, slug: e.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  return { title: event.title, description: event.summary, openGraph: { images: [{ url: event.image.src, alt: event.image.alt }] } };
}

export default async function EventPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const event = await getEvent(slug);
  if (!event) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const isPast = new Date(event.end ?? event.start) < new Date();
  const remaining = event.capacity !== undefined ? Math.max(event.capacity - (event.registered ?? 0), 0) : undefined;
  const full = remaining === 0;

  // Données structurées schema.org/Event (référencement)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: `${event.start}:00+00:00`,
    endDate: event.end ? `${event.end}:00+00:00` : undefined,
    eventAttendanceMode:
      event.format === "en-ligne" ? "https://schema.org/MixedEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: event.venue, address: { "@type": "PostalAddress", addressLocality: event.city, addressCountry: "TG" } },
    image: `${siteUrl}${event.image.src}`,
    organizer: { "@type": "NGO", name: "KTGW Togo", url: siteUrl },
  };

  return (
    <>
      {!event.sample && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <PageHeader
        image={event.image}
        eyebrow={isPast ? "Événement passé" : "Événement à venir"}
        title={event.title}
        description={event.summary}
        breadcrumbs={[{ label: "Événements", href: "/evenements" }, { label: event.title }]}
      >
        {event.sample && <SampleBadge className="w-fit text-ktgw-sun" />}
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="flex flex-col gap-8 lg:col-span-3">
            <ul className="grid gap-4 sm:grid-cols-2">
              <li className="flex gap-3 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
                <Clock aria-hidden className="size-6 shrink-0 text-ktgw-red" />
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Date</p>
                  <p className="font-semibold">{formatDate(event.start, locale)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(event.start, locale)}
                    {event.end && ` – ${formatTime(event.end, locale)}`} (heure de Lomé)
                  </p>
                </div>
              </li>
              <li className="flex gap-3 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
                {event.format === "en-ligne" ? (
                  <Monitor aria-hidden className="size-6 shrink-0 text-ktgw-red" />
                ) : (
                  <MapPin aria-hidden className="size-6 shrink-0 text-ktgw-red" />
                )}
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Lieu</p>
                  <p className="font-semibold">{event.venue}</p>
                  <p className="text-sm text-muted-foreground">{event.city}</p>
                </div>
              </li>
              {remaining !== undefined && !isPast && (
                <li className="flex gap-3 rounded-2xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
                  <Users aria-hidden className="size-6 shrink-0 text-ktgw-red" />
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Places</p>
                    <p className="font-semibold">{full ? "Complet : liste d'attente" : `${remaining} places restantes`}</p>
                    <p className="text-sm text-muted-foreground">sur {event.capacity}</p>
                  </div>
                </li>
              )}
              {!isPast && (
                <li>
                  <a
                    href={icsDataUri(event, siteUrl)}
                    download={`${event.slug}.ics`}
                    className="flex h-full items-center gap-3 rounded-2xl border-2 border-dashed border-ktgw-green/50 p-5 font-semibold text-ktgw-green-strong transition-colors hover:bg-ktgw-green/10 dark:text-ktgw-green"
                  >
                    <CalendarPlus aria-hidden className="size-6 shrink-0" />
                    Ajouter à mon agenda
                  </a>
                </li>
              )}
            </ul>

            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Programme</h2>
              {event.body.map((p, i) => (
                <p key={i} className="text-lg leading-relaxed text-foreground/85">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-2" aria-labelledby="register-title">
            <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-8 lg:sticky lg:top-28">
              <h2 id="register-title" className="mb-2 text-2xl font-bold">
                {isPast ? "Événement terminé" : full ? "Liste d'attente" : "Inscription"}
              </h2>
              {isPast ? (
                <p className="text-muted-foreground">Merci à toutes et à tous pour votre participation ! Retrouvez les photos dans la galerie.</p>
              ) : (
                <>
                  <p className="mb-6 text-sm text-muted-foreground">Gratuit. Vous recevrez une confirmation de notre équipe.</p>
                  <EventRegistrationForm eventSlug={event.slug} eventTitle={event.title} full={full} />
                </>
              )}
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
