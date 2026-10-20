"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { isActivePath, mainNav } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Menu principal (≥ 1280 px) avec sous-menus déroulants.
 * - Souris : ouverture au survol (avec léger délai de fermeture).
 * - Clavier : le chevron ouvre/ferme le sous-menu, Échap ferme et rend le focus.
 */
export function DesktopNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const navRef = useRef<HTMLElement>(null);

  // Fermeture au changement de page et au clic extérieur
  useEffect(() => setOpen(null), [pathname]);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const enter = (key: string) => {
    window.clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(null), 150);
  };

  return (
    <nav ref={navRef} aria-label={t("Header.mainNav")} className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {mainNav.map((item) => {
          const active = isActivePath(pathname, item.href) || item.children?.some((c) => isActivePath(pathname, c.href));
          const isOpen = open === item.key;
          const panelId = `submenu-${item.key}`;

          return (
            <li
              key={item.key}
              className="relative"
              onMouseEnter={item.children ? () => enter(item.key) : undefined}
              onMouseLeave={item.children ? leave : undefined}
              onKeyDown={(e) => {
                if (e.key === "Escape" && isOpen) {
                  setOpen(null);
                  (e.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
                }
              }}
            >
              <div className="flex items-center">
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "relative rounded-lg py-2 text-[0.9rem] font-semibold transition-colors hover:text-ktgw-red",
                    item.children ? "pr-1 pl-3" : "px-3",
                    "after:absolute after:right-3 after:-bottom-0.5 after:left-3 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-ktgw-red after:transition-transform hover:after:scale-x-100",
                    active ? "text-ktgw-red after:scale-x-100" : "text-foreground/85"
                  )}
                >
                  {t(`Nav.${item.key}`)}
                </Link>
                {item.children && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={t("Header.submenu", { label: t(`Nav.${item.key}`) })}
                    onClick={() => setOpen(isOpen ? null : item.key)}
                    className="flex size-6 items-center justify-center rounded-md text-foreground/60 hover:bg-muted hover:text-foreground"
                  >
                    <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                )}
              </div>

              {item.children && (
                <div
                  id={panelId}
                  hidden={!isOpen}
                  className="absolute top-full left-0 z-50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                  <ul className="min-w-64 overflow-hidden rounded-2xl border bg-popover p-2 text-popover-foreground shadow-xl">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href.split("#")[0] && !child.href.includes("#");
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setOpen(null)}
                            aria-current={childActive ? "page" : undefined}
                            className={cn(
                              "group flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-ktgw-red",
                              childActive && "bg-accent text-ktgw-red"
                            )}
                          >
                            {t(`Nav.${child.key}`)}
                            <span aria-hidden className="text-ktgw-red opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                              →
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
