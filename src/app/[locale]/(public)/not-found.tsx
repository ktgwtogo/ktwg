import { T } from "@/components/edit/editable";
import { ArrowLeft, Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/shared/section";

/** Page 404 personnalisée (dans le gabarit public : header et footer visibles). */
export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-6 py-24 text-center sm:py-32">
      <span className="flex size-20 items-center justify-center rounded-full bg-accent text-ktgw-red">
        <Compass aria-hidden className="size-10" />
      </span>
      <p className="font-heading text-7xl font-extrabold text-ktgw-red sm:text-8xl">404</p>
      <h1 className="text-3xl font-extrabold sm:text-4xl"><T s="home-not-found">{"Ce chemin ne mène nulle part…"}</T></h1>
      <p className="max-w-md text-lg text-muted-foreground"><T s="home-not-found">{"La page que vous cherchez n'existe pas ou a été déplacée. Reprenons la route ensemble !"}</T></p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" size="xl">
          <ArrowLeft aria-hidden /><T s="home-not-found">{"Retour à l'accueil"}</T></ButtonLink>
        <ButtonLink href="/contact" size="xl" variant="outline"><T s="home-not-found">{"Nous contacter"}</T></ButtonLink>
      </div>
    </Container>
  );
}
