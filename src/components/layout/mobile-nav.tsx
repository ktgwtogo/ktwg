"use client";

import { Handshake, Heart, LogIn, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ButtonLink } from "@/components/ui/button-link";
import { Logo } from "@/components/shared/logo";
import { SocialLinks } from "@/components/shared/social-links";
import { isActivePath, mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

/**
 * Menu mobile (< 1280 px) : panneau latéral accessible
 * (focus piégé, fermeture par Échap, retour du focus au bouton).
 * Le bouton burger s'anime au survol, les liens apparaissent en cascade
 * (animations CSS tw-animate-css, neutralisées par prefers-reduced-motion).
 */
export function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const phone = siteConfig.togo.phones[0];

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={t("Header.openMenu")}
        className="group flex size-10 flex-col items-center justify-center gap-1.5 rounded-xl transition-colors hover:bg-muted xl:hidden"
      >
        <span aria-hidden className="h-0.5 w-5 rounded-full bg-foreground transition-transform group-hover:-translate-y-0.5" />
        <span aria-hidden className="h-0.5 w-5 rounded-full bg-foreground transition-[width] group-hover:w-3.5" />
        <span aria-hidden className="h-0.5 w-5 rounded-full bg-foreground transition-transform group-hover:translate-y-0.5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 overflow-y-auto sm:max-w-sm data-[side=right]:w-full data-[side=right]:sm:max-w-sm"
      >
        <div className="flex h-18 items-center justify-between border-b px-4">
          <SheetTitle className="sr-only">{t("Header.menu")}</SheetTitle>
          <SheetDescription className="sr-only">{t("Header.mainNav")}</SheetDescription>
          <Logo className="h-14" />
          <SheetClose
            aria-label={t("Header.closeMenu")}
            className="flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
          >
            <X aria-hidden className="size-5 transition-transform duration-300 hover:rotate-90" />
          </SheetClose>
        </div>

        <nav aria-label={t("Header.mainNav")} className="px-2 py-4">
          <ul className="flex flex-col">
            {mainNav.map((item, i) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li
                  key={item.href}
                  className="animate-in fade-in slide-in-from-right-6 fill-mode-both duration-300"
                  style={{ animationDelay: `${50 + i * 40}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3 font-heading text-lg font-semibold transition-colors hover:bg-muted",
                      active && "bg-accent text-ktgw-red"
                    )}
                  >
                    {t(`Nav.${item.key}`)}
                    {active && <span aria-hidden className="size-2 rounded-full bg-ktgw-red" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t px-4 py-5">
          <ButtonLink href="/faire-un-don" size="xl" onClick={close}>
            <Heart aria-hidden className="fill-current" />
            {t("Common.donate")}
          </ButtonLink>
          <ButtonLink href="/partenariat" size="xl" variant="secondary" onClick={close}>
            <Handshake aria-hidden />
            {t("Common.becomePartner")}
          </ButtonLink>
          <ButtonLink href="/connexion" size="xl" variant="outline" onClick={close}>
            <LogIn aria-hidden />
            {t("Common.signIn")}
          </ButtonLink>

          <a
            href={`tel:${phone.e164}`}
            className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Phone aria-hidden className="size-4 text-ktgw-green" />
            {phone.display}
          </a>

          <div className="flex items-center justify-between gap-2 pt-2">
            <LanguageSwitcher />
            <div className="flex items-center gap-1">
              <SocialLinks size="sm" itemClassName="text-muted-foreground hover:bg-muted hover:text-foreground" />
              <ThemeToggle className="text-muted-foreground hover:bg-muted hover:text-foreground" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
