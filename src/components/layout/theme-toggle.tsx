"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Bascule clair / sombre.
 * Les deux icônes sont rendues et affichées via la variante `dark:` :
 * aucun écart d'hydratation, aucun clignotement au chargement.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Theme");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={t("toggle")}
      title={t("toggle")}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-colors",
        className
      )}
    >
      <Sun aria-hidden className="hidden size-4 dark:block" />
      <Moon aria-hidden className="size-4 dark:hidden" />
    </button>
  );
}
