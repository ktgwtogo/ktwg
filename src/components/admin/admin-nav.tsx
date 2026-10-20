"use client";

import { BadgeCheck, FileText, LayoutDashboard } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/adhesions", label: "Adhésions", icon: BadgeCheck },
  { href: "/admin/documents", label: "Documents", icon: FileText },
] as const;

export function AdminNav({ pending }: { pending: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-2">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
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
                {item.href === "/admin/adhesions" && pending > 0 && (
                  <span className="rounded-full bg-ktgw-red px-1.5 py-0.5 text-[11px] leading-none text-white">
                    {pending}
                    <span className="sr-only"> en attente</span>
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
