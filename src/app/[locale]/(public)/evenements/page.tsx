import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { EventCard } from "@/components/shared/cards";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { pastEvents, upcomingEvents } from "@/content/events";
import { images } from "@/content/images";

export const metadata: Metadata = {
  title: "Événements",
  description: "Agenda de KTGW Togo : journées portes ouvertes, plantations, rencontres des clubs d'allemand. Inscrivez-vous en ligne.",
};

// Régénère la page régulièrement pour faire passer les événements terminés dans « Événements passés »
export const revalidate = 3600;

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const upcoming = upcomingEvents();
  const past = pastEvents();

  return (
    <>
      <PageHeader
        image={images.guests}
        eyebrow="Agenda"
        title="Nos événements"
        description="Portes ouvertes, plantations, rencontres : venez nous rencontrer au Togo ou en ligne. L'inscription ne prend qu'une minute."
        breadcrumbs={[{ label: "Événements" }]}
      />

      <Section aria-labelledby="upcoming-title">
        <SectionTitle id="upcoming-title" eyebrow="À venir" title="Prochains rendez-vous" />
        {upcoming.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <li key={e.slug}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-2xl bg-muted p-8 text-center text-muted-foreground">
            Aucun événement programmé pour le moment. Abonnez-vous à la newsletter pour être informé·e.
          </p>
        )}
      </Section>

      {past.length > 0 && (
        <Section tone="muted" aria-labelledby="past-title">
          <SectionTitle id="past-title" eyebrow="Archives" title="Événements passés" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((e) => (
              <li key={e.slug}>
                <EventCard event={e} past />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
