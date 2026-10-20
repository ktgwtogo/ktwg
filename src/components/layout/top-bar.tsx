import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/shared/section";
import { SocialLinks } from "@/components/shared/social-links";
import { siteConfig } from "@/config/site";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

/**
 * Bandeau au-dessus du menu : contacts et réseaux sociaux, visibles sur tous les écrans.
 * - Mobile : téléphone, icône e-mail et réseaux sociaux (langue et thème sont dans le menu burger).
 * - Tablette et plus : adresse e-mail complète, second numéro, langue et thème.
 */
export function TopBar() {
  const t = useTranslations("TopBar");
  const [phone, phone2] = siteConfig.togo.phones;
  const { email, address } = siteConfig.togo;

  return (
    <div className="bg-ktgw-green-dark text-white dark:bg-[#0b3d1c]">
      <Container className="flex min-h-10 items-center justify-between gap-3 py-1 text-xs sm:text-[13px]">
        <ul className="flex min-w-0 items-center gap-x-4">
          <li>
            <a
              href={`tel:${phone.e164}`}
              aria-label={t("call", { number: phone.display })}
              className="flex items-center gap-1.5 font-medium whitespace-nowrap text-white/90 hover:text-ktgw-sun"
            >
              <Phone aria-hidden className="size-3.5 shrink-0 text-ktgw-sun" />
              {phone.display}
            </a>
          </li>
          <li className="hidden lg:block">
            <a
              href={`tel:${phone2.e164}`}
              aria-label={t("call", { number: phone2.display })}
              className="flex items-center gap-1.5 whitespace-nowrap text-white/90 hover:text-ktgw-sun"
            >
              {phone2.display}
            </a>
          </li>
          <li>
            <a
              href={`mailto:${email}`}
              aria-label={t("writeTo", { email })}
              className="flex items-center gap-1.5 text-white/90 hover:text-ktgw-sun"
            >
              <Mail aria-hidden className="size-3.5 shrink-0 text-ktgw-sun" />
              <span className="hidden sm:inline">{email}</span>
            </a>
          </li>
          <li className="hidden items-center gap-1.5 text-white/75 xl:flex">
            <MapPin aria-hidden className="size-3.5 text-ktgw-sun" />
            {address.district}, {address.city}
          </li>
        </ul>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <span className="sr-only">{t("followUs")}</span>
          <SocialLinks size="sm" className="gap-0" itemClassName="size-7 text-white/85 hover:bg-white/15 hover:text-ktgw-sun sm:size-8" />
          <span aria-hidden className="hidden h-4 w-px bg-white/20 md:block" />
          <LanguageSwitcher tone="inverted" className="hidden md:block" />
          <ThemeToggle className="hidden text-white/80 hover:bg-white/10 hover:text-white md:flex" />
        </div>
      </Container>
    </div>
  );
}
