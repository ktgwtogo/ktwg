import { ArrowUp, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaWhatsapp } from "react-icons/fa6";
import { Container } from "@/components/shared/section";
import { Logo } from "@/components/shared/logo";
import { SocialLinks } from "@/components/shared/social-links";
import { footerNav, type NavItem } from "@/config/navigation";
import { whatsappUrl } from "@/config/site";
import type { SiteConfigData } from "@/lib/site/types";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { MapEmbed } from "./map-embed";

function FooterColumn({ title, items }: { title: string; items: NavItem[] }) {
  const t = useTranslations("Nav");
  return (
    <div>
      <h2 className="mb-4 font-heading text-sm font-bold tracking-wider text-white uppercase">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-white/70 transition-colors hover:text-ktgw-sun"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Pied de page (§8 du cahier des charges) : présentation, navigation,
 * engagement, coordonnées + carte, puis barre basse légale.
 */
export function SiteFooter({ config }: { config: SiteConfigData }) {
  const t = useTranslations();
  const { togo, germany } = config;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto bg-ink text-white/80">
      {/* Motif « chemin vert » du logo, en transition avec la page */}
      <svg
        aria-hidden
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -top-px h-6 w-full text-background sm:h-10"
      >
        <path d="M0 0h1440v8c-240 40-480 40-720 16S240-8 0 24z" fill="currentColor" />
        <path
          d="M0 24c240-32 480-24 720 0s480 40 720 0"
          fill="none"
          stroke="var(--ktgw-green)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>

      <Container className="grid gap-10 pt-20 pb-12 sm:pt-24 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* 1. Présentation */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          <Logo className="h-24" />
          <p className="text-sm leading-relaxed">{t("Footer.about")}</p>
          <blockquote className="border-l-2 border-ktgw-sun pl-4 text-sm text-white italic">
            « {t("Common.motto")} »
          </blockquote>
          <SocialLinks socials={config.socials} itemClassName="bg-white/5 text-white/80 hover:bg-ktgw-sun hover:text-ink" className="gap-2" />
        </div>

        {/* 2. Navigation */}
        <div className="lg:col-span-2">
          <FooterColumn title={t("Footer.colNavigation")} items={footerNav.navigation} />
        </div>

        {/* 3. S'engager */}
        <div className="lg:col-span-2">
          <FooterColumn title={t("Footer.colEngage")} items={footerNav.engage} />
        </div>

        {/* 4. Nous trouver — Accentuation prioritaire sur le Togo */}
        <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold tracking-wider text-ktgw-sun uppercase">
              <span className="flex size-2 rounded-full bg-ktgw-red animate-ping" />
              Siège National au Togo
            </h2>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
              Lomé · Tokoin
            </span>
          </div>

          <address className="flex flex-col gap-3.5 text-sm not-italic rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-ktgw-sun" />
              <span className="leading-relaxed">
                <strong className="text-white">Siège Social KTGW Togo :</strong>
                <br />
                {togo.address.street}
                <br />
                <span className="text-ktgw-sun font-semibold">{togo.address.district}</span>, {togo.address.city} – {togo.address.country}
              </span>
            </p>
            <div className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 size-5 shrink-0 text-ktgw-sun" />
              <ul aria-label={t("Footer.phones")} className="flex flex-col gap-2">
                {togo.phones.map((p) => (
                  <li key={p.e164} className="flex items-center gap-2">
                    <a href={`tel:${p.e164}`} className="font-semibold text-white hover:text-ktgw-sun">
                      {p.display}
                    </a>
                    {p.whatsapp && (
                      <a
                        href={whatsappUrl(p.e164)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("Footer.whatsappWith", { number: p.display })}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 py-0.5 text-xs font-bold text-slate-950 transition-transform hover:scale-105"
                      >
                        <FaWhatsapp aria-hidden className="size-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <p className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-ktgw-sun" />
              <a href={`mailto:${togo.email}`} className="break-all font-medium text-white/90 hover:text-ktgw-sun">
                {togo.email}
              </a>
            </p>
          </address>

          {/* Focalisation Google Maps Tokoin Lomé */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Navigation aria-hidden className="size-3.5 text-ktgw-sun" />
                Localisation Google Maps (Tokoin)
              </span>
              <a
                href={togo.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ktgw-sun hover:underline"
              >
                Ouvrir dans Maps &rarr;
              </a>
            </div>
            <MapEmbed src={togo.mapsEmbedUrl} immediate={true} />
            <a
              href={togo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ktgw-sun px-4 text-sm font-bold text-ink shadow-md transition-all hover:bg-ktgw-sun-light hover:shadow-lg"
            >
              <Navigation aria-hidden className="size-4" />
              Itinéraire vers le siège à Tokoin (Lomé)
              <span className="sr-only">{t("Common.opensInNewTab")}</span>
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs">
            <p className="font-semibold text-white/90">
              {t("Footer.germanyHQ")} : {germany.city} ({germany.name})
            </p>
            <p className="mt-1 text-white/60">
              Association partenaire en Allemagne · Tél : <a href={`tel:${germany.phone.e164}`} className="hover:text-ktgw-sun text-white/80">{germany.phone.display}</a>
            </p>
          </div>
        </div>
      </Container>

      {/* Barre basse */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs sm:flex-row">
          <p>{t("Footer.rights", { year })}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {footerNav.legal.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ktgw-sun">
                  {t(`Nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <LanguageSwitcher tone="inverted" />
            <a
              href="#top"
              className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 hover:border-ktgw-sun hover:text-ktgw-sun"
            >
              <ArrowUp aria-hidden className="size-3.5" />
              {t("Footer.backToTop")}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
