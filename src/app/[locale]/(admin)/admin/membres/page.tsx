import { Download, IdCard, Search, UserRound } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { membershipStatusLabels, membershipStatusTone } from "@/lib/member/labels";
import { cn } from "@/lib/utils";
import { membershipTypeLabels } from "@/lib/validations/member";

const filters = [
  { id: "membres", label: "Membres validés" },
  { id: "en-attente", label: "Adhésions en attente" },
  { id: "tous", label: "Tous les comptes" },
] as const;

/** Fichier des membres : recherche, fiche, carte de membre, export. */
export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filtre?: string; q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("members.view")) return <Forbidden />;
  const { filtre, q } = await searchParams;
  const filter = filters.find((f) => f.id === filtre)?.id ?? "membres";

  let query = staff.supabase.from("profiles").select("*").order("last_name").limit(500);
  if (filter === "membres") query = query.eq("membership_status", "validee");
  if (filter === "en-attente") query = query.eq("membership_status", "en_attente");
  const search = (q ?? "").trim().replace(/[%,()]/g, "");
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,member_number.ilike.%${search}%,city.ilike.%${search}%`);
  const { data: people } = await query;

  const paths = (people ?? []).map((p) => p.photo_path).filter((p): p is string => Boolean(p));
  const { data: signed } = paths.length ? await staff.supabase.storage.from("avatars").createSignedUrls(paths, 3600) : { data: [] };
  const photo = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <>
      <PageHeading title="Fichier des membres" description="Toutes les personnes inscrites sur la plateforme et les membres validés de l'association.">
        {/* Téléchargement de fichier (route API), pas une page : un <a> est voulu. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/admin/export/membres" className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-sm font-semibold">
          <Download aria-hidden className="size-4" />
          Exporter (Excel)
        </a>
      </PageHeading>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.id}
              href={{ pathname: "/admin/membres", query: { filtre: f.id } }}
              className={cn("rounded-full px-4 py-2 text-sm font-semibold", f.id === filter ? "bg-ktgw-green-strong text-white" : "bg-card ring-1 ring-foreground/10")}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form className="relative">
          <input type="hidden" name="filtre" value={filter} />
          <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input name="q" defaultValue={q} placeholder="Nom, e-mail, n° de membre, ville…" aria-label="Rechercher" className="h-11 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm sm:w-80" />
        </form>
      </div>

      <p className="text-sm text-muted-foreground">{people?.length ?? 0} résultat(s)</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {(people ?? []).map((p) => {
          const src = p.photo_path ? photo.get(p.photo_path) : null;
          return (
            <li key={p.id} className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/5">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <UserRound aria-hidden className="size-7 text-muted-foreground" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{[p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {p.email}
                  {p.phone ? ` · ${p.phone}` : ""}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold", membershipStatusTone[p.membership_status])}>
                    {membershipStatusLabels[p.membership_status]}
                    {p.membership_type ? ` · ${membershipTypeLabels[p.membership_type]}` : ""}
                  </span>
                  {p.member_number && <span className="text-muted-foreground">N° {p.member_number}</span>}
                  {p.member_since && <span className="text-muted-foreground">depuis le {formatDate(p.member_since, locale, "short")}</span>}
                </p>
              </div>
              {p.membership_status === "validee" && (
                <a href={`/impression/carte/${p.id}`} target="_blank" rel="noopener" aria-label="Carte de membre" className="self-start rounded-lg p-2 text-ktgw-green-strong hover:bg-muted">
                  <IdCard aria-hidden className="size-5" />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
