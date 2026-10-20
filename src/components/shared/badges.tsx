import { cn } from "@/lib/utils";
import type { Partner } from "@/content/partners";

/** Signale un contenu d'exemple à remplacer (événement, témoignage…). */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span
      title="Contenu d'exemple, à remplacer par l'équipe KTGW"
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-current px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase opacity-80",
        className
      )}
    >
      Exemple
    </span>
  );
}

const partnerTones: Record<Partner["tone"], string> = {
  red: "bg-ktgw-red-strong text-white",
  green: "bg-ktgw-green-strong text-white",
  sun: "bg-ktgw-sun text-ink",
  ink: "bg-ink text-white dark:bg-white dark:text-ink",
};

/** Badge partenaire : logo si fourni, sinon monogramme aux couleurs KTGW. */
export function PartnerMark({ partner, className }: { partner: Partner; className?: string }) {
  if (partner.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={partner.logo} alt="" className={cn("size-12 object-contain", className)} />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-2xl font-heading text-xs font-extrabold tracking-tight",
        partnerTones[partner.tone],
        className
      )}
    >
      {partner.initials}
    </span>
  );
}

/** Barre de progression accessible. */
export function ProgressBar({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{pct} %</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-[image:linear-gradient(90deg,var(--ktgw-green),var(--ktgw-sun))]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
