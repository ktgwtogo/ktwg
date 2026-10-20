import { ArrowUp, Globe, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaWhatsapp } from "react-icons/fa6";
import { Container } from "@/components/shared/section";
import { Logo } from "@/components/shared/logo";
import { SocialLinks } from "@/components/shared/social-links";
import { footerNav, type NavItem } from "@/config/navigation";
import { siteConfig, whatsappUrl } from "@/config/site";
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
export function SiteFooter() {
  const t = useTranslations();
  const { togo, germany } = siteConfig;
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
          <SocialLinks itemClassName="bg-white/5 text-white/80 hover:bg-ktgw-sun hover:text-ink" className="gap-2" />
        </div>

        {/* 2. Navigation */}
        <div className="lg:col-span-2">
          <FooterColumn title={t("Footer.colNavigation")} items={footerNav.navigation} />
        </div>

        {/* 3. S'engager */}
        <div className="lg:col-span-2">
          <FooterColumn title={t("Footer.colEngage")} items={footerNav.engage} />
        </div>

        {/* 4. Nous trouver */}
        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-4">
          <h2 className="font-heading text-sm font-bold tracking-wider text-white uppercase">
            {t("Footer.colFindUs")}
          </h2>

          <address className="flex flex-col gap-3 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-ktgw-sun" />
              <span>
                {togo.address.street}
                <br />
                {togo.address.district}, {togo.address.city} – {togo.address.country}
              </span>
            </p>
            <div className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-ktgw-sun" />
              <ul aria-label={t("Footer.phones")} className="flex flex-col gap-1.5">
                {togo.phones.map((p) => (
                  <li key={p.e164} className="flex items-center gap-2">
                    <a href={`tel:${p.e164}`} className="hover:text-ktgw-sun">
                      {p.display}
                    </a>
                    {p.whatsapp && (
                      <a
                        href={whatsappUrl(p.e164)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("Footer.whatsappWith", { number: p.display })}
                        className="flex size-6 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      >
                        <FaWhatsapp aria-hidden className="size-3.5" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <p className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-ktgw-sun" />
              <a href={`mailto:${togo.email}`} className="break-all hover:text-ktgw-sun">
                {togo.email}
              </a>
            </p>
          </address>

          <MapEmbed src={togo.mapsEmbedUrl} />
          <a
            href={togo.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-ktgw-sun"
          >
            <Navigation aria-hidden className="size-4" />
            {t("Footer.directions")}
            <span className="sr-only">{t("Common.opensInNewTab")}</span>
          </a>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="mb-2 font-semibold text-white">
              {t("Footer.germanyHQ")} : {germany.city}
            </p>
            <p className="text-white/70">{germany.name}</p>
            <ul className="mt-2 flex flex-col gap-1">
              <li>
                <a href={`tel:${germany.phone.e164}`} className="hover:text-ktgw-sun">
                  {germany.phone.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${germany.email}`} className="hover:text-ktgw-sun">
                  {germany.email}
                </a>
              </li>
              <li>
                <a
                  href={germany.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-ktgw-sun"
                >
                  <Globe aria-hidden className="size-3.5" />
                  kommtogogehweiter.de
                  <span className="sr-only">{t("Common.opensInNewTab")}</span>
                </a>
              </li>
            </ul>
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
