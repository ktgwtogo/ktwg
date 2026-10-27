import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Logo officiel cliquable, renvoie à l'accueil.
 * Fichier généré par scripts/prepare-logo.mjs : 867 × 552 px, fond transparent
 * (lisible sur fond clair comme sombre). La hauteur se règle via `className` (ex. h-14).
 */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  const t = useTranslations("Common");
  return (
    <Link href="/" className={cn("inline-flex shrink-0 rounded-lg", className)}>
      <Image
        src="/images/logo-ktgw.png"
        alt={t("home")}
        width={861}
        height={544}
        priority={priority}
        sizes="200px"
        className="h-full w-auto"
      />
    </Link>
  );
}
