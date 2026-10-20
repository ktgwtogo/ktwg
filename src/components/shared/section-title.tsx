import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionTitleProps = {
  /** Petit sur-titre au-dessus du titre (ex. « Nos projets »). */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Niveau de titre HTML, h2 par défaut. */
  as?: "h1" | "h2" | "h3";
  /** id du titre, pour lier la section via aria-labelledby. */
  id?: string;
  /** Inverse les couleurs pour un fond sombre. */
  inverted?: boolean;
  className?: string;
};

/**
 * Titre de section : sur-titre, titre et texte d'introduction.
 * Un trait « chemin vert » souligne le sur-titre, en écho au logo.
 */
export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  id,
  inverted = false,
  className,
}: SectionTitleProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        centered && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "flex items-center gap-3 text-sm font-semibold tracking-widest uppercase",
            inverted ? "text-ktgw-sun" : "text-(--eyebrow)"
          )}
        >
          <span aria-hidden className="h-0.5 w-8 rounded-full bg-current" />
          {eyebrow}
        </p>
      )}
      <Heading
        id={id}
        className={cn(
          "text-3xl font-extrabold sm:text-4xl lg:text-5xl",
          inverted ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p className={cn("text-lg leading-relaxed", inverted ? "text-white/80" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </div>
  );
}
