import { Lock } from "lucide-react";

/** Titre de page du tableau de bord. */
export function PageHeading({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

/** Affiché quand le poste ne donne pas accès à la page demandée. */
export function Forbidden() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center ring-1 ring-foreground/5">
      <Lock aria-hidden className="size-10 text-muted-foreground" />
      <p className="text-xl font-bold">Accès réservé</p>
      <p className="max-w-md text-muted-foreground">Cette rubrique ne fait pas partie de votre poste. Adressez-vous à la présidence si vous en avez besoin.</p>
    </div>
  );
}
