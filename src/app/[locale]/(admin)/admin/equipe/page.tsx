import { setRequestLocale } from "next-intl/server";
import { AssignExisting, CreateAccountForm, PositionEditor, StaffControls } from "@/components/admin/team-manager";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { roleLabels } from "@/lib/member/labels";
import { cn } from "@/lib/utils";

/** Équipe et postes : réservé à la présidence. */
export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.presidency) return <Forbidden />;
  const { supabase } = staff;

  const [{ data: positions }, { data: profiles }] = await Promise.all([
    supabase.from("positions").select("*").order("sort_order").order("name"),
    supabase.from("profiles").select("id, email, full_name, role, position_id, is_active, must_change_password").order("full_name"),
  ]);
  const options = (positions ?? []).map((p) => ({ id: p.id, name: p.name }));
  const positionName = new Map(options.map((p) => [p.id, p.name]));
  const team = (profiles ?? []).filter((p) => p.role !== "member" || p.position_id);
  const others = (profiles ?? []).filter((p) => p.role === "member" && !p.position_id);

  return (
    <>
      <PageHeading
        title="Équipe et postes"
        description="Créez les comptes du bureau, attribuez les postes et réglez ce que chaque poste peut voir et faire. Vous seul·e avez accès à cette page."
      />

      <section aria-labelledby="bureau" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
        <h2 id="bureau" className="mb-4 text-xl font-bold">
          Membres du bureau ({team.length})
        </h2>
        <ul className="flex flex-col divide-y">
          {team.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">
                  {p.full_name ?? p.email}
                  {!p.is_active && <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Suspendu</span>}
                  {p.must_change_password && (
                    <span className="ml-2 rounded-full bg-ktgw-sun/20 px-2 py-0.5 text-xs text-ktgw-orange">Mot de passe provisoire</span>
                  )}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {p.email} · {positionName.get(p.position_id ?? "") ?? roleLabels[p.role]}
                </p>
              </div>
              <StaffControls
                userId={p.id}
                email={p.email}
                positionId={p.position_id}
                active={p.is_active}
                positions={options}
                isSelf={p.id === staff.user.id}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="creer" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 id="creer" className="text-xl font-bold">
            Créer un compte du bureau
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            Un mot de passe provisoire est généré et envoyé par e-mail. La personne le change à sa première connexion, ainsi que son adresse si besoin.
          </p>
          <CreateAccountForm positions={options} />
        </section>
        <section aria-labelledby="existant" className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 id="existant" className="text-xl font-bold">
            Donner un poste à un compte existant
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">Pour une personne déjà inscrite sur le site (Google ou e-mail).</p>
          <AssignExisting people={others.map((p) => ({ id: p.id, label: `${p.full_name ?? p.email} (${p.email})` }))} positions={options} />
        </section>
      </div>

      <section aria-labelledby="postes" className="flex flex-col gap-4">
        <h2 id="postes" className="text-xl font-bold">
          Postes et permissions
        </h2>
        {(positions ?? []).map((p) => (
          <details key={p.id} className={cn("group rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5")}>
            <summary className="cursor-pointer list-none">
              <span className="text-lg font-bold">{p.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {p.id === "president" ? "Tous les droits" : `${p.permissions.length} permission${p.permissions.length > 1 ? "s" : ""}`}
              </span>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            </summary>
            <div className="mt-5 border-t pt-5">
              {p.id === "president" ? (
                <p className="text-sm text-muted-foreground">La présidence a tous les droits et seule elle valide les publications, gère l&apos;équipe et lit le journal.</p>
              ) : (
                <PositionEditor position={p} />
              )}
            </div>
          </details>
        ))}
        <details className="rounded-3xl border-2 border-dashed p-6">
          <summary className="cursor-pointer text-lg font-bold">+ Nouveau poste</summary>
          <div className="mt-5">
            <PositionEditor />
          </div>
        </details>
      </section>
    </>
  );
}
