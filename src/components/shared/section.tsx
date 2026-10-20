import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tones = {
  default: "bg-background text-foreground",
  muted: "bg-muted text-foreground",
  green: "bg-ktgw-green-dark text-white",
  // Fond clair dans les deux thèmes : on fixe localement les couleurs de texte
  sun: "bg-[image:var(--gradient-sun)] text-ink [--foreground:var(--ink)] [--muted-foreground:#3d3a35] [--eyebrow:var(--ktgw-green-dark)]",
} as const;

type SectionProps = ComponentProps<"section"> & {
  /** Couleur de fond de la section. */
  tone?: keyof typeof tones;
  /** Largeur maximale du contenu. */
  width?: "default" | "narrow" | "wide";
  /** Classes appliquées au conteneur interne. */
  containerClassName?: string;
};

const widths = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[96rem]",
};

/**
 * Bloc de page standard : espacement vertical généreux, conteneur centré
 * et marges latérales responsive (16 px sur mobile).
 */
export function Section({
  tone = "default",
  width = "default",
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-24", tones[tone], className)} {...props}>
      <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", widths[width], containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/** Conteneur centré seul (header, footer…). */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
