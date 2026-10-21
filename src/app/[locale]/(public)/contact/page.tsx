import { Clock, Globe, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa6";
import { ContactForm } from "@/components/forms/contact-form";
import { MapEmbed } from "@/components/layout/map-embed";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { SectionTitle } from "@/components/shared/section-title";
import { SocialLinks } from "@/components/shared/social-links";
import { whatsappUrl } from "@/config/site";
import { getSiteConfig } from "@/lib/site/settings";
import { images } from "@/content/images";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez KTGW Togo à Lomé : téléphone, WhatsApp, e-mail, formulaire et plan d'accès. Siège allemand à Cologne.",
};

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = await getSiteConfig();
  const { togo, germany } = config;

  const cards = [
    {
      icon: MapPin,
      title: "Notre adresse",
      content: (
        <>
          {togo.address.street}
          <br />
          {togo.address.district}, {togo.address.city} – {togo.address.country}
        </>
      ),
      action: { href: togo.mapsUrl, label: "Itinéraire", external: true },
    },
    {
      icon: Phone,
      title: "Téléphone & WhatsApp",
      content: (
        <ul className="flex flex-col gap-2">
          {togo.phones.map((p) => (
            <li key={p.e164} className="flex flex-wrap items-center gap-3">
              <a href={`tel:${p.e164}`} className="font-semibold text-foreground hover:text-ktgw-red">
                {p.display}
              </a>
              <a
                href={whatsappUrl(p.e164)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-1 text-xs font-semibold text-[#128C4B] hover:bg-[#25D366] hover:text-ink dark:text-[#4ade80]"
              >
                <FaWhatsapp aria-hidden className="size-3.5" />
                WhatsApp
              </a>
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: Mail,
      title: "E-mail",
      content: (
        <a href={`mailto:${togo.email}`} className="font-semibold break-all text-foreground hover:text-ktgw-red">
          {togo.email}
        </a>
      ),
    },
    {
      icon: Clock,
      title: "Délai de réponse",
      content: "Nous répondons généralement sous 2 à 3 jours ouvrés. Pour une urgence, appelez-nous ou écrivez-nous sur WhatsApp.",
    },
  ];

  return (
    <>
      <PageHeader
        image={images.guests}
        eyebrow="Contact"
        title="Parlons de l'avenir des jeunes du Togo"
        description="Une question, un projet de partenariat, une envie de vous engager ? Notre équipe à Lomé et nos bénévoles à Cologne vous répondent."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <Section>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <li key={c.title} className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-ktgw-red">
                <c.icon aria-hidden className="size-6" />
              </span>
              <h2 className="text-lg font-bold">{c.title}</h2>
              <div className="text-sm leading-relaxed text-muted-foreground">{c.content}</div>
              {c.action && (
                <a
                  href={c.action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-ktgw-red hover:underline"
                >
                  <Navigation aria-hidden className="size-4" />
                  {c.action.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionTitle eyebrow="Écrivez-nous" title="Envoyer un message" description="Les champs marqués d'un astérisque (*) sont obligatoires." />
            <div className="mt-8 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:p-10">
              <ContactForm />
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-2" aria-label="Plan d'accès et autres contacts">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Plan d&apos;accès</h2>
              <p className="text-sm text-muted-foreground">
                Nous sommes à Tokoin Cébévito, près du CHU Sylvanus Olympio, à Lomé.
              </p>
              <MapEmbed src={togo.mapsEmbedUrl} tone="light" className="aspect-square shadow-soft" />
              <a
                href={togo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 font-semibold text-white hover:opacity-90 dark:bg-white dark:text-ink"
              >
                <Navigation aria-hidden className="size-4" />
                Ouvrir l&apos;itinéraire dans Google Maps
              </a>
            </div>

            <div className="rounded-2xl bg-accent p-6">
              <h2 className="mb-1 text-lg font-bold">Siège en Allemagne</h2>
              <p className="mb-3 text-sm text-muted-foreground">
                {germany.name} · {germany.city}
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone aria-hidden className="size-4 text-ktgw-green" />
                  <a href={`tel:${germany.phone.e164}`} className="hover:text-ktgw-red">
                    {germany.phone.display}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail aria-hidden className="size-4 text-ktgw-green" />
                  <a href={`mailto:${germany.email}`} className="break-all hover:text-ktgw-red">
                    {germany.email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Globe aria-hidden className="size-4 text-ktgw-green" />
                  <a href={germany.website} target="_blank" rel="noopener noreferrer" className="hover:text-ktgw-red">
                    kommtogogehweiter.de
                  </a>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
              <h2 className="mb-3 text-lg font-bold">Suivez-nous</h2>
              <SocialLinks socials={config.socials} itemClassName="bg-muted text-foreground/80 hover:bg-ktgw-red-strong hover:text-white" className="flex-wrap gap-2" />
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
