"use client";

import { ChevronDown, Handshake, Heart, LogIn, Mail, Phone, UserPlus, UserRound, X } from "lucide-react";
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
import { isActivePath, type NavEntry } from "@/config/navigation";
import type { SiteConfigData } from "@/lib/site/types";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useSignedIn } from "./use-signed-in";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

/**
 * Menu mobile (< 1024 px) : panneau latéral accessible
 * (focus piégé, fermeture par Échap, retour du focus au bouton).
 * Le bouton burger s'anime au survol, les liens apparaissent en cascade
 * (animations CSS tw-animate-css, neutralisées par prefers-reduced-motion).
 */
export function MobileNav({ items: mainNav, config }: { items: NavEntry[]; config: SiteConfigData }) {
  const t = useTranslations();
  const label = (item: { key?: string; label?: string }) => item.label || (item.key && t.has(`Nav.${item.key}`) ? t(`Nav.${item.key}`) : item.key ?? "");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const phone = config.togo.phones[0];

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        // Identifiant fixe : l'id généré automatiquement par Base UI peut différer
        // entre le rendu serveur et le navigateur (avertissement d'hydratation)
        id="mobile-menu-trigger"
        aria-label={t("Header.openMenu")}
        className="group flex size-10 flex-col items-center justify-center gap-1.5 rounded-xl transition-colors hover:bg-muted lg:hidden"
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
              const active =
                isActivePath(pathname, item.href) || !!item.children?.some((c) => isActivePath(pathname, c.href));
              const itemClass = cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3 font-heading text-lg font-semibold transition-colors hover:bg-muted",
                active && "text-ktgw-red"
              );
              return (
                <li
                  key={item.href}
                  className="animate-in fade-in slide-in-from-right-6 fill-mode-both duration-300"
                  style={{ animationDelay: `${50 + i * 40}ms` }}
                >
                  {item.children ? (
                    // Sous-menu en accordéon (élément natif <details> : accessible sans script)
                    <details open={active} className="group">
                      <summary className={cn(itemClass, "cursor-pointer list-none [&::-webkit-details-marker]:hidden")}>
                        {label(item)}
                        <ChevronDown aria-hidden className="size-5 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <ul className="mt-1 mb-2 ml-4 flex flex-col border-l-2 border-ktgw-sun/60 pl-2">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={close}
                              aria-current={pathname === child.href ? "page" : undefined}
                              className="block rounded-lg px-4 py-2.5 text-base text-foreground/80 transition-colors hover:bg-muted hover:text-ktgw-red aria-[current=page]:font-semibold aria-[current=page]:text-ktgw-red"
                            >
                              {label(child)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link href={item.href} onClick={close} aria-current={active ? "page" : undefined} className={cn(itemClass, active && "bg-accent")}>
                      {label(item)}
                      {active && <span aria-hidden className="size-2 rounded-full bg-ktgw-red" />}
                    </Link>
                  )}
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
          {signedIn ? (
            <ButtonLink href="/mon-espace" size="xl" variant="outline" onClick={close}>
              <UserRound aria-hidden />
              Espace membre
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/connexion?mode=inscription" size="xl" variant="outline" onClick={close} className="border-ktgw-green text-ktgw-green-strong">
                <UserPlus aria-hidden />
                Devenir membre
              </ButtonLink>
              <ButtonLink href="/connexion" size="xl" variant="ghost" onClick={close}>
                <LogIn aria-hidden />
                Connexion
              </ButtonLink>
            </>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <a href={`tel:${phone.e164}`} className="flex items-center gap-2 hover:text-foreground">
              <Phone aria-hidden className="size-4 text-ktgw-green" />
              {phone.display}
            </a>
            <a href={`mailto:${config.togo.email}`} className="flex items-center gap-2 hover:text-foreground">
              <Mail aria-hidden className="size-4 text-ktgw-green" />
              {config.togo.email}
            </a>
          </div>

          <SocialLinks
            socials={config.socials}
            size="md"
            className="justify-center gap-2"
            itemClassName="bg-muted text-foreground/80 hover:bg-ktgw-red-strong hover:text-white"
          />

          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <LanguageSwitcher />
            <ThemeToggle className="text-muted-foreground hover:bg-muted hover:text-foreground" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
