import { ShieldCheck } from "lucide-react";

/** Rappel de la règle de validation : la présidence exécute, les autres postes soumettent. */
export function ValidationRule({ presidency }: { presidency: boolean }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-card p-3 text-sm ring-1 ring-foreground/10">
      <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-ktgw-green-strong" />
      {presidency ? (
        <span>
          <strong>Présidence :</strong> vos actions s&apos;exécutent immédiatement. Celles des autres membres du bureau vous arrivent dans « Validations » :
          rien n&apos;est exécuté sans votre accord.
        </span>
      ) : (
        <span>
          <strong>Validation :</strong> chaque action que vous faites est d&apos;abord soumise à la présidence, puis exécutée après son accord. Suivez
          l&apos;état de vos demandes dans « Mes demandes ».
        </span>
      )}
    </p>
  );
}
