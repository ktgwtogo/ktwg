import { T } from "@/components/edit/editable";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { EventCard } from "@/components/shared/cards";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { pastEvents, upcomingEvents } from "@/lib/content/repository";
import { getSiteImages } from "@/lib/site/settings";

export const metadata: Metadata = {
  title: "Événements",
  description: "Agenda de KTGW Togo : journées portes ouvertes, plantations, rencontres des clubs d'allemand. Inscrivez-vous en ligne.",
};

// Régénère la page régulièrement pour faire passer les événements terminés dans « Événements passés »
export const revalidate = 3600;

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteImages = await getSiteImages();
  setRequestLocale(locale);
  const [upcoming, past] = await Promise.all([upcomingEvents(), pastEvents()]);

  return (
    <>
      <PageHeader
        image={siteImages["banner.evenements"]} imageId="banner.evenements"
        eyebrow={<T s="evenements">{"Agenda"}</T>}
        title={<T s="evenements">{"Nos événements"}</T>}
        description={<T s="evenements">{"Portes ouvertes, plantations, rencontres : venez nous rencontrer au Togo ou en ligne. L'inscription ne prend qu'une minute."}</T>}
        breadcrumbs={[{ label: "Événements" }]}
      />

      <Section aria-labelledby="upcoming-title">
        <SectionTitle id="upcoming-title" eyebrow={<T s="evenements">{"À venir"}</T>} title={<T s="evenements">{"Prochains rendez-vous"}</T>} />
        {upcoming.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <li key={e.slug}>
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-2xl bg-muted p-8 text-center text-muted-foreground"><T s="evenements">{"Aucun événement programmé pour le moment. Abonnez-vous à la newsletter pour être informé·e."}</T></p>
        )}
      </Section>

      {past.length > 0 && (
        <Section tone="muted" aria-labelledby="past-title">
          <SectionTitle id="past-title" eyebrow={<T s="evenements">{"Archives"}</T>} title={<T s="evenements">{"Événements passés"}</T>} />
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
