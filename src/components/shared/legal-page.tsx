import type { ReactNode } from "react";
import { Container } from "./section";

/** Gabarit sobre pour les pages juridiques (mentions légales, confidentialité). */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>
      <div className="mt-10 flex flex-col gap-8 leading-relaxed text-foreground/85 [&_a]:font-medium [&_a]:text-ktgw-red [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
    </Container>
  );
}
