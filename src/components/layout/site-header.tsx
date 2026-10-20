"use client";

import { Heart, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/shared/section";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";

/**
 * Header collant.
 * Légèrement translucide en haut de page, il devient opaque avec une ombre
 * dès que l'on fait défiler. Menu complet à partir de 1280 px, menu burger en dessous.
 */
export function SiteHeader() {
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);

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
      <Container className="flex h-18 items-center justify-between gap-4 lg:h-22">
        <Logo priority className="h-14 lg:h-[4.5rem]" />

        <DesktopNav />

        <div className="flex items-center gap-2">
          <ButtonLink
            href="/connexion"
            variant="ghost"
            size="lg"
            className="hidden h-10 rounded-xl px-3 md:inline-flex"
          >
            <LogIn aria-hidden />
            {t("Common.signIn")}
          </ButtonLink>
          <ButtonLink href="/faire-un-don" size="lg" className="h-10 rounded-xl px-4 font-semibold">
            <Heart aria-hidden className="fill-current" />
            <span className="hidden sm:inline">{t("Common.donate")}</span>
            <span className="sr-only sm:hidden">{t("Common.donate")}</span>
          </ButtonLink>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
