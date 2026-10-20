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
      <h1 className="text-3xl font-extrabold sm:text-4xl">Ce chemin ne mène nulle part…</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Reprenons la route ensemble !
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" size="xl">
          <ArrowLeft aria-hidden />
          Retour à l&apos;accueil
        </ButtonLink>
        <ButtonLink href="/contact" size="xl" variant="outline">
          Nous contacter
        </ButtonLink>
      </div>
    </Container>
  );
}
