"use client";

import { ExternalLink, LifeBuoy, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/logo";
import { Link, usePathname } from "@/i18n/navigation";
import { guideFor, type Guide } from "@/lib/admin/guides";
import { cn } from "@/lib/utils";
import { navIcons, type AdminNavItem } from "./nav-icons";
import { ValidationRule } from "./validation-rule";

export type { AdminNavItem };

/**
 * Gabarit du tableau de bord : menu latéral (repliable sur mobile), zone de contenu
 * et, en tête de chaque page, son mode d'emploi (repliable).
 */
export function AdminShell({
  items,
  guides,
  presidency,
  user,
  children,
}: {
  items: AdminNavItem[];
  guides: Guide[];
  presidency: boolean;
  user: { name: string; position: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const sections = [...new Set(items.map((i) => i.section))];
  const guide = guideFor(pathname, guides);
  const nav = (
    <nav aria-label="Administration" className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section} className="flex flex-col gap-1">
          {/* Titre de rubrique : jaune KTGW, distinct des liens (blancs). */}
          <p className="mb-1 flex items-center gap-2 px-3 text-xs font-extrabold tracking-widest text-ktgw-sun uppercase">
            <span aria-hidden className="h-3 w-1 rounded-full bg-ktgw-sun" />
            {section}
          </p>
          {items
            .filter((i) => i.section === section)
            .map((item) => {
              const Icon = navIcons[item.icon];
              const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "ml-2 flex h-10 items-center gap-3 rounded-xl border-l-2 px-3 text-sm font-medium transition-colors",
                    active ? "border-ktgw-sun bg-white font-bold text-ktgw-green-dark" : "border-white/15 text-white hover:border-white/60 hover:bg-white/10",
                  )}
                >
                  <Icon aria-hidden className={cn("size-4 shrink-0", active ? "text-ktgw-green-strong" : "text-white/70")} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? <span className="rounded-full bg-ktgw-sun px-2 py-0.5 text-[11px] leading-none font-bold text-ink">{item.badge}</span> : null}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="flex flex-col gap-1 border-t border-white/15 pt-4 text-sm">
      <div className="px-3 pb-2">
        <p className="truncate font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-white/60">{user.position}</p>
      </div>
      <Link href="/mon-espace" className="flex h-9 items-center gap-3 rounded-lg px-3 text-white/80 hover:bg-white/10">
        <UserRound aria-hidden className="size-4" />
        Mon espace personnel
      </Link>
      <a href="/" target="_blank" rel="noopener" className="flex h-9 items-center gap-3 rounded-lg px-3 text-white/80 hover:bg-white/10">
        <ExternalLink aria-hidden className="size-4" />
        Voir le site
      </a>
      <form action="/auth/signout" method="post">
        <button type="submit" className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-white/80 hover:bg-white/10">
          <LogOut aria-hidden className="size-4" />
          Se déconnecter
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-1 bg-muted/40">
      {/* Menu latéral (ordinateur) */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-6 overflow-y-auto bg-gradient-to-b from-ktgw-green-dark to-ktgw-green-strong p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2">
          <Logo className="h-10 w-auto" />
          <span className="font-heading text-sm font-extrabold text-ktgw-green-dark">Administration</span>
        </Link>
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre du haut (mobile) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 bg-ktgw-green-dark px-4 text-white lg:hidden">
          <Link href="/admin" className="font-heading font-extrabold">
            KTGW · Administration
          </Link>
          <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir le menu" aria-expanded={open} className="rounded-lg p-2 hover:bg-white/10">
            <Menu aria-hidden className="size-6" />
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu d'administration">
            <button type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/60" />
            <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-6 overflow-y-auto bg-gradient-to-b from-ktgw-green-dark to-ktgw-green-strong p-5">
              <div className="flex justify-end">
                <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="rounded-lg p-2 text-white hover:bg-white/10">
                  <X aria-hidden className="size-6" />
                </button>
              </div>
              <div className="flex-1">{nav}</div>
              {footer}
            </div>
          </div>
        )}
        <main id="main" className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            {guide && guide.href !== "/admin" && (
              <details className="group rounded-2xl bg-ktgw-green/10 ring-1 ring-ktgw-green/25 print:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-ktgw-green-strong">
                  <LifeBuoy aria-hidden className="size-4" />
                  Mode d&apos;emploi : {guide.title}
                  <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">Afficher</span>
                  <span className="ml-auto hidden text-xs font-normal text-muted-foreground group-open:inline">Masquer</span>
                </summary>
                <div className="flex flex-col gap-3 px-4 pb-4 text-sm">
                  <p className="text-muted-foreground">{guide.summary}</p>
                  <ol className="flex list-decimal flex-col gap-1 pl-5 marker:font-bold marker:text-ktgw-green-strong">
                    {guide.steps.map((step) => (
                      <li key={step}>{step.replace(/^\d\.\s/, "")}</li>
                    ))}
                  </ol>
                  <ValidationRule presidency={presidency} />
                </div>
              </details>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
