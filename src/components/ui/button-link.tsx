import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

/**
 * Lien interne stylé comme un bouton (conserve la langue courante).
 * À utiliser pour toute navigation : un <button> ne doit jamais changer de page.
 */
export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
