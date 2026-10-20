"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { localeLabels, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  /** `inverted` : pour fond sombre (top bar, footer). */
  tone?: "default" | "inverted";
  className?: string;
};

/** Sélecteur FR / DE / EN qui conserve la page courante. */
export function LanguageSwitcher({ tone = "default", className }: LanguageSwitcherProps) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("language")} className={className}>
      <ul className="flex items-center gap-0.5">
        {routing.locales.map((l) => {
          const active = l === locale;
          return (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                hrefLang={l}
                lang={l}
                aria-current={active ? "true" : undefined}
                title={localeLabels[l].long}
                className={cn(
                  "flex h-7 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors",
                  tone === "inverted"
                    ? active
                      ? "bg-white text-ink"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                    : active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span aria-hidden>{localeLabels[l].short}</span>
                <span className="sr-only">{localeLabels[l].long}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
