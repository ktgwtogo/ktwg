import { ExternalLink, FilePlus2, LayoutTemplate, Megaphone, Pencil, Pin } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { PublicationTools } from "@/components/admin/publication-tools";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { getSiteConfig } from "@/lib/site/settings";
import { cn } from "@/lib/utils";

const placementLabel = (p: string, pages: Map<string, string>) =>
  p === "actualites" ? "Actualités" : p === "accueil" ? "Accueil" : `Page « ${pages.get(p.slice(5)) ?? p.slice(5)} »`;

/**
 * Publications : articles, communiqués, annonces, opportunités…
 * Rédaction, emplacements (Actualités, accueil, pages), partage réseaux sociaux et e-mail.
 */
export default async function PublicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ rubrique?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("content.manage")) return <Forbidden />;
  const { rubrique } = await searchParams;
  const db = staff.supabase;

  const [{ data: all }, { data: pages }, { data: pendings }, { socials }] = await Promise.all([
    db.from("posts").select("*").order("pinned", { ascending: false }).order("published_on", { ascending: false }).limit(300),
    db.from("pages").select("slug, title"),
    db.from("approval_requests").select("payload").eq("status", "en_attente").eq("kind", "content.save"),
    getSiteConfig(),
  ]);
  const pageTitle = new Map((pages ?? []).map((p) => [p.slug, p.title]));
  const waiting = new Set((pendings ?? []).map((r) => (r.payload as { type?: string; id?: string }).type === "actualites" && (r.payload as { id?: string }).id).filter(Boolean));
  const waitingNew = (pendings ?? []).filter((r) => (r.payload as { type?: string; id?: string }).type === "actualites" && !(r.payload as { id?: string }).id).length;
  const categories = [...new Set((all ?? []).map((p) => p.category))].sort();
  const posts = (all ?? []).filter((p) => !rubrique || p.category === rubrique);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ktgw.tg";

  return (
    <>
      <PageHeading
        title="Publications"
        description={
          staff.presidency
            ? "Rédigez et publiez articles, communiqués, opportunités… Choisissez où ils paraissent et diffusez-les sur les réseaux sociaux ou par e-mail."
            : "Rédigez vos publications : elles paraissent sur le site après validation par la présidence."
        }
      >
        <Link href="/admin/contenus/actualites/nouveau" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ktgw-green-strong px-5 text-sm font-semibold text-white">
          <FilePlus2 aria-hidden className="size-4" />
          Nouvelle publication
        </Link>
      </PageHeading>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/contenus/annonces" className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 hover:ring-ktgw-green/40">
          <Megaphone aria-hidden className="size-6 text-ktgw-red" />
          <span>
            <span className="block font-semibold">Annonces (bandeau du site)</span>
            <span className="text-sm text-muted-foreground">Message court en haut de toutes les pages, avec dates d&apos;affichage.</span>
          </span>
        </Link>
        {staff.can("pages.manage") && (
          <Link href="/admin/contenus/pages" className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/5 hover:ring-ktgw-green/40">
            <LayoutTemplate aria-hidden className="size-6 text-ktgw-green" />
            <span>
              <span className="block font-semibold">Pages et rubriques</span>
              <span className="text-sm text-muted-foreground">Créez une page (ex. « Opportunités », « Presse ») pour y publier des articles.</span>
            </span>
          </Link>
        )}
      </div>

      {waitingNew > 0 && (
        <p className="rounded-2xl bg-ktgw-sun/15 px-5 py-4 text-sm font-semibold text-ktgw-orange">
          {waitingNew} nouvelle(s) publication(s) en attente de validation par la présidence.
        </p>
      )}

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/publications" className={cn("rounded-full px-4 py-2 text-sm font-semibold", !rubrique ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card ring-1 ring-foreground/10")}>
            Toutes
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={{ pathname: "/admin/publications", query: { rubrique: c } }}
              className={cn("rounded-full px-4 py-2 text-sm font-semibold", c === rubrique ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card ring-1 ring-foreground/10")}
            >
              {c}
            </Link>
          ))}
        </div>
      )}

      {!posts.length ? (
        <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">Aucune publication pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((p) => {
            const img = (p.image as { src?: string } | null)?.src;
            const url = `${site}/actualites/${p.slug}`;
            return (
              <li key={p.id} className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5 sm:flex-row">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-32 w-full shrink-0 rounded-2xl object-cover sm:w-48" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold", p.published ? "bg-ktgw-green/15 text-ktgw-green-strong" : "bg-muted")}>
                      {p.published ? "En ligne" : "Brouillon"}
                    </span>
                    {waiting.has(p.id) && <span className="rounded-full bg-ktgw-sun/20 px-2 py-0.5 font-semibold text-ktgw-orange">Modification en attente</span>}
                    {p.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-ktgw-red/10 px-2 py-0.5 font-semibold text-ktgw-red-strong">
                        <Pin aria-hidden className="size-3" /> À la une
                      </span>
                    )}
                    <span className="rounded-full bg-ktgw-sun/20 px-2 py-0.5 font-semibold text-ink dark:text-white">{p.category}</span>
                    <span className="text-muted-foreground">{formatDate(p.published_on, locale, "short")}</span>
                  </p>
                  <h2 className="text-lg font-bold">{p.title}</h2>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  <p className="text-xs text-muted-foreground">Publié sur : {(p.placements ?? []).map((x) => placementLabel(x, pageTitle)).join(" · ") || "—"}</p>
                  <div className="mt-1 flex flex-wrap items-start gap-2">
                    <Link href={`/admin/contenus/actualites/${p.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ktgw-green-strong px-3 text-sm font-semibold text-white">
                      <Pencil aria-hidden className="size-4" />
                      Modifier
                    </Link>
                    {p.published && (
                      <>
                        <a href={`/actualites/${p.slug}`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-lg border-2 border-border px-3 text-sm font-semibold hover:bg-muted">
                          <ExternalLink aria-hidden className="size-4" />
                          Voir
                        </a>
                        <PublicationTools
                          url={url}
                          title={p.title}
                          excerpt={p.excerpt}
                          instagram={socials.instagram || undefined}
                          tiktok={socials.tiktok || undefined}
                          canMail={staff.can("newsletter.manage")}
                          presidency={staff.presidency}
                        />
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
