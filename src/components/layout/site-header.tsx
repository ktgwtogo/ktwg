"use client";

import { Heart, LogIn, UserPlus, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/shared/section";
import { Logo } from "@/components/shared/logo";
import type { NavEntry } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { SiteConfigData } from "@/lib/site/types";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { useSignedIn } from "./use-signed-in";

/**
 * Header collant.
 * Légèrement translucide en haut de page, il devient opaque avec une ombre
 * dès que l'on fait défiler. Menu horizontal à partir de 1024 px, menu burger en dessous.
 */
export function SiteHeader({ nav, config }: { nav: NavEntry[]; config: SiteConfigData }) {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const signedIn = useSignedIn();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-b border-border bg-background shadow-soft"
          : "border-b border-transparent bg-background/85 backdrop-blur-md"
      )}
    >
      <Container className="flex h-18 items-center justify-between gap-3 lg:h-20 lg:gap-2 lg:px-5 xl:h-22 xl:gap-3 xl:px-8">
        <Logo priority className="h-14 shrink-0 lg:h-16 xl:h-[4.5rem]" />

        <DesktopNav items={nav} />

        <div className="flex shrink-0 items-center gap-1.5 xl:gap-2">
          {signedIn ? (
            <ButtonLink
              href="/mon-espace"
              variant="outline"
              size="lg"
              title="Espace membre"
              className="hidden h-10 rounded-full border-ktgw-green px-3 text-ktgw-green-strong md:inline-flex lg:px-2.5 2xl:px-4"
            >
              <UserRound aria-hidden />
              <span className="lg:sr-only xl:not-sr-only">Espace membre</span>
            </ButtonLink>
          ) : (
            <>
              <ButtonLink
                href="/connexion"
                variant="ghost"
                size="lg"
                title="Connexion"
                className="hidden h-10 rounded-full px-3 md:inline-flex lg:px-2 2xl:px-3"
              >
                <LogIn aria-hidden />
                <span className="lg:sr-only 2xl:not-sr-only">Connexion</span>
              </ButtonLink>
              <ButtonLink
                href="/connexion?mode=inscription"
                variant="outline"
                size="lg"
                title="Devenir membre"
                className="hidden h-10 rounded-full border-ktgw-green px-3 text-ktgw-green-strong md:inline-flex lg:px-2.5 2xl:px-4"
              >
                <UserPlus aria-hidden />
                <span className="lg:sr-only xl:not-sr-only">Devenir membre</span>
              </ButtonLink>
            </>
          )}
          <ButtonLink href="/faire-un-don" size="lg" className="h-10 shrink-0 rounded-full px-4 font-semibold shadow-md shadow-ktgw-red/25 lg:px-3.5 xl:h-11 xl:px-5">
            <Heart aria-hidden className="fill-current" />
            <span className="hidden sm:inline">{t("Common.donate")}</span>
            <span className="sr-only sm:hidden">{t("Common.donate")}</span>
          </ButtonLink>
          <MobileNav items={nav} config={config} />
        </div>
      </Container>
    </header>
  );
}
