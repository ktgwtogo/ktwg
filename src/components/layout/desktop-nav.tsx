"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { featuredImage, isActivePath, navIcons, type NavEntry } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Menu horizontal (≥ 1024 px) avec sous-menus enrichis :
 * liens avec icône et description + encadré photo mis en avant.
 * - Souris : ouverture au survol (léger délai de fermeture pour traverser l'espace).
 * - Clavier : le chevron ouvre/ferme, Échap ferme et rend le focus au chevron.
 */
export function DesktopNav({ items: mainNav }: { items: NavEntry[] }) {
  const t = useTranslations("Nav");
  const tHeader = useTranslations("Header");
  const label = (item: { key?: string; label?: string }) => item.label || (item.key && t.has(item.key) ? t(item.key) : item.key ?? "");
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const navRef = useRef<HTMLElement>(null);

  // Fermeture au changement de page et au clic à l'extérieur
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
    closeTimer.current = window.setTimeout(() => setOpen(null), 180);
  };

  return (
    <nav ref={navRef} aria-label={tHeader("mainNav")} className="hidden lg:block">
      <ul className="flex items-center xl:gap-1">
        {mainNav.map((item, index) => {
          const active =
            isActivePath(pathname, item.href) || !!item.children?.some((c) => isActivePath(pathname, c.href));
          const id = item.key ?? `menu-${index}`;
          const isOpen = open === id;
          const panelId = `submenu-${id}`;
          // Les derniers sous-menus s'alignent à droite pour ne pas sortir de l'écran
          const alignRight = index >= mainNav.length - 3;

          return (
            <li
              key={id}
              className="relative"
              onMouseEnter={item.children ? () => enter(id) : undefined}
              onMouseLeave={item.children ? leave : undefined}
              onKeyDown={(e) => {
                if (e.key === "Escape" && isOpen) {
                  setOpen(null);
                  (e.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus();
                }
              }}
            >
              <div
                className={cn(
                  "group/item relative flex items-center rounded-full transition-colors",
                  isOpen ? "bg-accent" : "hover:bg-accent/70"
                )}
              >
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "py-2 text-[0.8rem] font-semibold whitespace-nowrap transition-colors xl:text-[0.92rem]",
                    item.children ? "pr-0.5 pl-2 xl:pl-3.5" : "px-2 xl:px-3.5",
                    active || isOpen ? "text-ktgw-red" : "text-foreground/85 hover:text-ktgw-red"
                  )}
                >
                  {label(item)}
                </Link>
                {item.children && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={tHeader("submenu", { label: label(item) })}
                    onClick={() => setOpen(isOpen ? null : id)}
                    className={cn(
                      "mr-0.5 flex size-6 items-center justify-center rounded-full transition-colors xl:mr-1.5",
                      active || isOpen ? "text-ktgw-red" : "text-foreground/50 group-hover/item:text-ktgw-red"
                    )}
                  >
                    <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-300", isOpen && "rotate-180")} />
                  </button>
                )}
                {/* Repère de la rubrique active */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-1.5 h-[3px] origin-center rounded-full bg-[image:linear-gradient(90deg,var(--ktgw-red),var(--ktgw-orange))] transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </div>

              {item.children && (
                <div
                  id={panelId}
                  hidden={!isOpen}
                  className={cn(
                    "absolute top-full z-50 pt-4 animate-in fade-in slide-in-from-top-2 duration-200",
                    alignRight ? "right-0" : "left-0"
                  )}
                >
                  {/* Petite flèche reliant le panneau à la rubrique */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-2.5 size-3 rotate-45 border-t border-l bg-popover",
                      alignRight ? "right-8" : "left-8"
                    )}
                  />
                  <div className="flex w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border bg-popover text-popover-foreground shadow-2xl ring-1 ring-black/5">
                    <div className="flex-1 p-3">
                      <p className="px-3 pt-2 pb-3 text-[11px] font-bold tracking-[0.2em] text-(--eyebrow) uppercase">{label(item)}</p>
                      <ul className="flex flex-col gap-0.5">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href && !child.href.includes("#");
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setOpen(null)}
                                aria-current={childActive ? "page" : undefined}
                                className={cn(
                                  "group/link flex items-start gap-3.5 rounded-2xl p-3 transition-colors hover:bg-accent",
                                  childActive && "bg-accent"
                                )}
                              >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-ktgw-red transition-all duration-300 group-hover/link:scale-105 group-hover/link:bg-ktgw-red-strong group-hover/link:text-white">
                                  {(() => {
                                    const Icon = navIcons[child.icon] ?? navIcons.Link2;
                                    return <Icon aria-hidden className="size-5" />;
                                  })()}
                                </span>
                                <span className="flex flex-col gap-0.5">
                                  <span className="flex items-center gap-1.5 text-sm font-bold transition-colors group-hover/link:text-ktgw-red">
                                    {label(child)}
                                    <ArrowRight
                                      aria-hidden
                                      className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100"
                                    />
                                  </span>
                                  <span className="text-xs leading-snug text-muted-foreground">{child.description || (child.key && t.has(`desc.${child.key}`) ? t(`desc.${child.key}`) : "")}</span>
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {item.featured && item.key && t.has(`featured.${item.key}.title`) && (
                      <Link
                        href={item.featured.href}
                        onClick={() => setOpen(null)}
                        className="group/feat relative m-2 flex w-56 shrink-0 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white"
                      >
                        <Image
                          src={featuredImage(item.featured.image).src}
                          alt=""
                          fill
                          sizes="224px"
                          className="object-cover transition-transform duration-700 group-hover/feat:scale-110"
                        />
                        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/0" />
                        <span className="relative flex flex-col gap-2">
                          <span className="font-heading text-lg leading-tight font-extrabold">{t(`featured.${item.key}.title`)}</span>
                          <span className="text-xs leading-relaxed text-white/85">{t(`featured.${item.key}.text`)}</span>
                          <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-ktgw-sun px-3.5 py-1.5 text-xs font-bold text-ink transition-colors group-hover/feat:bg-white">
                            {t(`featured.${item.key}.cta`)}
                            <ArrowRight aria-hidden className="size-3.5" />
                          </span>
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
