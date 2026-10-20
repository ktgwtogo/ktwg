import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/shared/section";
import { SocialLinks } from "@/components/shared/social-links";
import { siteConfig } from "@/config/site";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

/**
 * Bandeau fin au-dessus du header : téléphone, e-mail, réseaux sociaux, langue, thème.
 * Sur mobile, seuls le téléphone, la langue et le thème restent visibles.
 */
export function TopBar() {
  const t = useTranslations("TopBar");
  const phone = siteConfig.togo.phones[0];
  const { email } = siteConfig.togo;

  return (
    <div className="bg-ktgw-green-dark text-white dark:bg-[#0b3d1c]">
      <Container className="flex h-10 items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <a
            href={`tel:${phone.e164}`}
            aria-label={t("call", { number: phone.display })}
            className="flex items-center gap-1.5 text-white/90 hover:text-white"
          >
            <Phone aria-hidden className="size-3.5 text-ktgw-sun" />
            <span>{phone.display}</span>
          </a>
          <a
            href={`mailto:${email}`}
            aria-label={t("writeTo", { email })}
            className="hidden items-center gap-1.5 text-white/90 hover:text-white md:flex"
          >
            <Mail aria-hidden className="size-3.5 text-ktgw-sun" />
            <span>{email}</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <SocialLinks
            size="sm"
            className="hidden md:flex"
            itemClassName="text-white/80 hover:bg-white/10 hover:text-white"
          />
          <span aria-hidden className="hidden h-4 w-px bg-white/20 md:block" />
          <LanguageSwitcher tone="inverted" />
          <ThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
        </div>
      </Container>
    </div>
  );
}
