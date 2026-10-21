import { ExternalLink, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { canEdit, getContentType } from "@/lib/content/config";
import { formatDate } from "@/lib/format";

/** Liste des éléments d'un type de contenu. */
export default async function ContentList({ params }: { params: Promise<{ locale: string; type: string }> }) {
  const { locale, type: typeId } = await params;
  setRequestLocale(locale);
  const type = getContentType(typeId);
  if (!type) notFound();
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!canEdit(type, staff.can)) return <Forbidden />;

  const [{ data: rows }, { data: pendings }] = await Promise.all([
    staff.supabase
      .from(type.table as "posts")
      .select("*")
      .order(type.orderBy.column as "title", { ascending: type.orderBy.ascending })
      .limit(200),
    staff.supabase.from("approval_requests").select("id, title, payload").eq("status", "en_attente").in("kind", ["content.save", "content.delete"]),
  ]);
  const items = (rows ?? []) as unknown as Record<string, unknown>[];
  const waiting = (pendings ?? []).filter((p) => (p.payload as { type?: string }).type === type.id);
  const waitingIds = new Set(waiting.map((p) => (p.payload as { id?: string }).id).filter(Boolean));

  return (
    <>
      <PageHeading title={type.label} description={type.description}>
        <Link
          href={`/admin/contenus/${type.id}/nouveau`}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ktgw-green-strong px-5 text-sm font-semibold text-white hover:bg-ktgw-green-strong/90"
        >
          <Plus aria-hidden className="size-4" />
          Ajouter {type.singular === "actualité" || type.singular === "photo" || type.singular === "annonce" ? "une" : "un"} {type.singular}
        </Link>
      </PageHeading>

      {waiting.length > 0 && (
        <p className="rounded-2xl bg-ktgw-sun/15 px-5 py-4 text-sm font-semibold text-ktgw-orange">
          {waiting.length} proposition{waiting.length > 1 ? "s" : ""} en attente de validation par la présidence.{" "}
          <Link href="/admin/validations" className="underline underline-offset-2">
            Voir
          </Link>
        </p>
      )}

      {!items.length ? (
        <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">Aucun élément pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((row) => {
            const id = String(row.id);
            const image = (row.image as { src?: string } | null)?.src;
            const date = (row.published_on ?? row.starts_at ?? row.updated_at) as string | undefined;
            return (
              <li key={id} className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/5">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/contenus/${type.id}/${id}`} className="font-semibold hover:underline">
                    {String(row[type.titleField] ?? "Sans titre")}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={row.published ? "rounded-full bg-ktgw-green/15 px-2 py-0.5 font-semibold text-ktgw-green-strong" : "rounded-full bg-muted px-2 py-0.5 font-semibold"}>
                      {row.published ? "Publié" : "Brouillon"}
                    </span>
                    {waitingIds.has(id) && <span className="rounded-full bg-ktgw-sun/20 px-2 py-0.5 font-semibold text-ktgw-orange">Modification en attente</span>}
                    {date && <span>{formatDate(date, locale, "short")}</span>}
                  </p>
                </div>
                {type.publicPath && Boolean(row.published) && (
                  <a href={type.publicPath(row)} target="_blank" rel="noopener" aria-label="Voir sur le site" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                    <ExternalLink aria-hidden className="size-4" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
