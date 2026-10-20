import { UserRound } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { DecisionForm } from "@/components/admin/decision-form";
import { Link, redirect } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { membershipStatusLabels, membershipStatusTone } from "@/lib/member/labels";
import { getMember } from "@/lib/member/session";
import { cn } from "@/lib/utils";
import { membershipTypeLabels } from "@/lib/validations/member";
import type { Database } from "@/types/database";

type Status = Database["public"]["Enums"]["membership_status"];
const filters: { value: Exclude<Status, "aucune">; label: string }[] = [
  { value: "en_attente", label: "À traiter" },
  { value: "validee", label: "Validées" },
  { value: "refusee", label: "Refusées" },
];

/** Demandes d'adhésion, avec la fiche complète de chaque personne. */
export default async function AdminMemberships({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ statut?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { statut } = await searchParams;
  const status = filters.find((f) => f.value === statut)?.value ?? "en_attente";
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const { supabase } = member;
  const canDecide = member.profile.role === "admin" || member.profile.role === "super_admin";

  const { data: applications } = await supabase
    .from("membership_applications")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: status === "en_attente" })
    .limit(100);

  const ids = [...new Set((applications ?? []).map((a) => a.user_id))];
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("*").in("id", ids) : { data: [] };
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Photos (bucket privé) : URLs signées en une seule requête.
  const paths = (profiles ?? []).map((p) => p.photo_path).filter((p): p is string => Boolean(p));
  const { data: signed } = paths.length ? await supabase.storage.from("avatars").createSignedUrls(paths, 3600) : { data: [] };
  const photoOf = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Statut des demandes" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={{ pathname: "/admin/adhesions", query: { statut: f.value } }}
            role="tab"
            aria-selected={f.value === status}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              f.value === status ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card ring-1 ring-foreground/10"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {!applications?.length ? (
        <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">Aucune demande dans cette catégorie.</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {applications.map((a) => {
            const p = byId.get(a.user_id);
            const name = p ? [p.civility, p.first_name, p.last_name].filter(Boolean).join(" ") || p.email : "Compte supprimé";
            const photo = p?.photo_path ? photoOf.get(p.photo_path) : null;
            return (
              <li key={a.id} className="flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={`Photo de ${name}`} className="size-24 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <span className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-muted">
                      <UserRound aria-hidden className="size-10 text-muted-foreground" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold">{name}</h2>
                      <span className="rounded-full bg-ktgw-green/10 px-3 py-1 text-xs font-semibold text-ktgw-green-strong">{membershipTypeLabels[a.type]}</span>
                      <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", membershipStatusTone[a.status])}>{membershipStatusLabels[a.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Demande du {formatDate(a.created_at, locale)}
                      {p?.member_number ? ` · N° ${p.member_number}` : ""}
                    </p>
                    {p && (
                      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        <Info label="E-mail" value={p.email} />
                        <Info label="Téléphone" value={p.phone} />
                        <Info label="WhatsApp" value={p.whatsapp} />
                        <Info label="Né·e le" value={p.birth_date ? formatDate(p.birth_date, locale) : null} />
                        <Info label="Nationalité" value={p.nationality} />
                        <Info label="Profession" value={[p.profession, p.organization].filter(Boolean).join(" · ")} />
                        <Info label="Adresse" value={[p.address, p.city, p.country].filter(Boolean).join(", ")} />
                      </dl>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 text-sm lg:grid-cols-2">
                  {p?.bio && <Block title="Présentation">{p.bio}</Block>}
                  <Block title="Motivation">{a.motivation}</Block>
                  {a.interests.length > 0 && <Block title="Domaines d'intérêt">{a.interests.join(", ")}</Block>}
                  {a.skills && <Block title="Compétences">{a.skills}</Block>}
                  {a.availability && <Block title="Disponibilités">{a.availability}</Block>}
                  {a.contribution && <Block title="Contribution envisagée">{a.contribution}</Block>}
                  {a.referral && <Block title="A connu l'association par">{a.referral}</Block>}
                  {a.decision_note && <Block title="Message envoyé">{a.decision_note}</Block>}
                </div>

                {a.status === "en_attente" &&
                  (canDecide ? (
                    <DecisionForm applicationId={a.id} name={name} />
                  ) : (
                    <p className="border-t pt-4 text-sm text-muted-foreground">La décision est réservée aux administrateurs.</p>
                  ))}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-semibold">{label} :</dt>
      <dd className="min-w-0 break-words text-muted-foreground">{value}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 whitespace-pre-line text-muted-foreground">{children}</p>
    </div>
  );
}
