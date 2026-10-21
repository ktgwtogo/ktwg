import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import type { SocialNetwork } from "@/config/site";
import { cn } from "@/lib/utils";

const icons: Record<SocialNetwork, IconType> = {
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
};

type SocialLinksProps = {
  socials: Record<SocialNetwork, string>;
  size?: "sm" | "md";
  className?: string;
  itemClassName?: string;
};

/** Icônes des réseaux sociaux ; celles sans URL configurée sont masquées. */
export function SocialLinks({ socials, size = "md", className, itemClassName }: SocialLinksProps) {
  const t = useTranslations();
  const entries = (Object.entries(socials) as [SocialNetwork, string][]).filter(
    ([, url]) => url
  );

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {entries.map(([network, url]) => {
        const Icon = icons[network];
        return (
          <li key={network}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center rounded-full transition-colors",
                size === "sm" ? "size-8" : "size-10",
                itemClassName
              )}
            >
              <Icon aria-hidden className={size === "sm" ? "size-3.5" : "size-4"} />
              <span className="sr-only">
                {t(`Social.${network}`)} {t("Common.opensInNewTab")}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
