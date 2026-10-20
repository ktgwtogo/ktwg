import { ArrowRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getMember } from "@/lib/member/session";

type CountTable =
  | "membership_applications"
  | "contact_messages"
  | "partnership_requests"
  | "event_registrations"
  | "engagement_applications"
  | "training_applications"
  | "donation_declarations";

/** Vue d'ensemble : ce qui attend un traitement. */
export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const { supabase } = member;

  const count = async (table: CountTable, status: string) => {
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("status", status as never);
    return count ?? 0;
  };

  const [pending, members, cards] = await Promise.all([
    count("membership_applications", "en_attente"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("membership_status", "validee")
      .then((r) => r.count ?? 0),
    Promise.all(
      (
        [
          ["contact_messages", "Messages de contact"],
          ["partnership_requests", "Demandes de partenariat"],
          ["event_registrations", "Inscriptions aux événements"],
          ["engagement_applications", "Bénévolat"],
          ["training_applications", "Candidatures aux formations"],
          ["donation_declarations", "Déclarations de don"],
        ] as const
      ).map(async ([table, label]) => ({ label, value: await count(table, "nouveau") }))
    ),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/adhesions" className="group rounded-3xl bg-ktgw-green-strong p-6 text-white shadow-soft">
          <p className="text-4xl font-extrabold">{pending}</p>
          <p className="mt-1 flex items-center gap-2 font-semibold">
            Demande{pending > 1 ? "s" : ""} d&apos;adhésion à traiter
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </p>
        </Link>
        <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <p className="text-4xl font-extrabold">{members}</p>
          <p className="mt-1 font-semibold text-muted-foreground">Membre{members > 1 ? "s" : ""} validé·e{members > 1 ? "s" : ""}</p>
        </div>
      </div>

      <section aria-labelledby="formulaires" className="flex flex-col gap-4">
        <h2 id="formulaires" className="text-xl font-bold">
          Nouvelles demandes reçues par le site
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <li key={c.label} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
              <p className="text-3xl font-extrabold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground">
          Ces demandes sont envoyées par e-mail à l&apos;équipe et consultables dans Supabase (Table Editor) en attendant leur écran de gestion.
        </p>
      </section>
    </div>
  );
}
