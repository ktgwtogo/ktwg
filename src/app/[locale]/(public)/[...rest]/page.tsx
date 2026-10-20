import { notFound } from "next/navigation";

/** Toute URL inconnue affiche la page 404 du gabarit public (avec header et footer). */
export default function CatchAll() {
  notFound();
}
