"use client";

import { BadgeCheck, FileText, IdCard, KeyRound, LayoutDashboard, Receipt, UserRound } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/mon-espace", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/mon-espace/profil", label: "Mon profil", icon: UserRound },
  { href: "/mon-espace/adhesion", label: "Adhésion", icon: BadgeCheck },
  { href: "/mon-espace/carte", label: "Ma carte", icon: IdCard },
  { href: "/mon-espace/recus", label: "Mes reçus", icon: Receipt },
  { href: "/mon-espace/documents", label: "Documents", icon: FileText },
  { href: "/mon-espace/mot-de-passe", label: "Sécurité", icon: KeyRound },
] as const;

/** Onglets de l'espace membre. */
export function MemberNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Espace membre" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {items.map((item) => {
          const active = item.href === "/mon-espace" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
                  active ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card text-muted-foreground ring-1 ring-foreground/5 hover:text-foreground"
                )}
              >
                <item.icon aria-hidden className="size-4" />
                {item.label}
                {item.href === "/mon-espace" && unread > 0 && (
                  <span className="rounded-full bg-ktgw-red px-1.5 py-0.5 text-[11px] leading-none text-white">
                    {unread}
                    <span className="sr-only"> notification{unread > 1 ? "s" : ""} non lue{unread > 1 ? "s" : ""}</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
