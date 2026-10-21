import { FileText, HandCoins, IdCard, Image as ImageIcon, Newspaper, NotebookText, Search } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { PageHeading } from "@/components/admin/page-heading";
import { redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { canEdit, contentTypes } from "@/lib/content/config";
import { formatDate } from "@/lib/format";

type Hit = { href: string; title: string; detail: string; date: string; external?: boolean; thumb?: string };
type Group = { label: string; icon: typeof FileText; hits: Hit[] };

/**
 * Archives : recherche unique dans les documents, rapports, photos, membres (cartes),
 * dons (reçus) et contenus. Les droits du poste s'appliquent (RLS).
 */
export default async function ArchivesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  const db = staff.supabase;
  const q = ((await searchParams).q ?? "").trim().replace(/[%,()]/g, "").slice(0, 80);
  const like = `%${q}%`;
  const groups: Group[] = [];

  const docs = await (q ? db.from("documents").select("*").ilike("title", like) : db.from("documents").select("*")).order("created_at", { ascending: false }).limit(12);
  groups.push({
    label: "Documents officiels",
    icon: FileText,
    hits: (docs.data ?? []).map((d) => ({ href: `/api/documents/${d.id}`, title: d.title, detail: d.file_name, date: d.created_at, external: true })),
  });

  if (staff.can("reports.view") || staff.can("reports.write")) {
    const reports = await (q ? db.from("reports").select("*").or(`title.ilike.${like},summary.ilike.${like}`) : db.from("reports").select("*"))
      .eq("status", "valide")
      .order("validated_at", { ascending: false })
      .limit(12);
    groups.push({
      label: "Rapports",
      icon: NotebookText,
      hits: (reports.data ?? []).map((r) => ({ href: "/admin/rapports", title: r.title, detail: r.period || r.summary.slice(0, 80), date: r.validated_at ?? r.created_at })),
    });
  }

  const photos = await (q ? db.from("gallery_items").select("*").ilike("caption", like) : db.from("gallery_items").select("*")).order("created_at", { ascending: false }).limit(12);
  groups.push({
    label: "Photos",
    icon: ImageIcon,
    hits: (photos.data ?? []).map((g) => {
      const img = g.image as { src: string };
      return { href: img.src, title: g.caption, detail: g.category, date: g.created_at, external: true, thumb: img.src };
    }),
  });

  if (staff.can("members.view")) {
    const people = await (q
      ? db.from("profiles").select("*").or(`full_name.ilike.${like},email.ilike.${like},member_number.ilike.${like}`)
      : db.from("profiles").select("*").eq("membership_status", "validee")
    )
      .order("member_since", { ascending: false })
      .limit(12);
    groups.push({
      label: "Membres et cartes",
      icon: IdCard,
      hits: (people.data ?? []).map((p) => ({
        href: p.membership_status === "validee" ? `/impression/carte/${p.id}` : "/admin/membres",
        title: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email,
        detail: p.member_number ? `Carte n° ${p.member_number}` : p.email,
        date: p.member_since ?? p.created_at,
        external: p.membership_status === "validee",
      })),
    });
  }

  if (staff.can("donations.manage")) {
    const gifts = await (q ? db.from("donation_declarations").select("*").or(`name.ilike.${like},receipt_number.ilike.${like},reference.ilike.${like}`) : db.from("donation_declarations").select("*"))
      .eq("status", "traite")
      .order("received_at", { ascending: false })
      .limit(12);
    groups.push({
      label: "Dons et reçus",
      icon: HandCoins,
      hits: (gifts.data ?? []).map((d) => ({
        href: `/impression/recu/${d.id}`,
        title: `${d.amount_fcfa.toLocaleString("fr-FR")} FCFA — ${d.name}`,
        detail: `${d.receipt_number} · ${d.kind}`,
        date: d.received_at ?? d.created_at,
        external: true,
      })),
    });
  }

  for (const type of contentTypes.filter((t) => canEdit(t, staff.can) && ["actualites", "evenements", "projets", "pages"].includes(t.id))) {
    const res = await (q ? db.from(type.table as "posts").select("*").ilike("title", like) : db.from(type.table as "posts").select("*"))
      .order("updated_at", { ascending: false })
      .limit(6);
    groups.push({
      label: type.label,
      icon: Newspaper,
      hits: ((res.data ?? []) as unknown as Record<string, string>[]).map((r) => ({ href: `/admin/contenus/${type.id}/${r.id}`, title: r.title, detail: r.slug ?? "", date: r.updated_at })),
    });
  }

  return (
    <>
      <PageHeading title="Archives" description="Retrouvez en un seul endroit documents, rapports, photos, cartes de membre, reçus et contenus." />
      <form className="relative">
        <Search aria-hidden className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <input name="q" defaultValue={q} placeholder="Rechercher un titre, un nom, un numéro de carte ou de reçu…" aria-label="Rechercher dans les archives" className="h-14 w-full rounded-2xl border border-input bg-card pr-4 pl-12 text-base shadow-soft" />
      </form>
      <p className="text-sm text-muted-foreground">{q ? `Résultats pour « ${q} »` : "Éléments les plus récents"}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((g) => (
          <section key={g.label} className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
            <h2 className="mb-3 flex items-center gap-2 font-bold">
              <g.icon aria-hidden className="size-5 text-ktgw-green" />
              {g.label}
              <span className="text-sm font-normal text-muted-foreground">({g.hits.length})</span>
            </h2>
            {!g.hits.length ? (
              <p className="text-sm text-muted-foreground">Aucun résultat.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {g.hits.map((h, i) => (
                  <li key={`${h.href}-${i}`}>
                    <a href={h.href} target={h.external ? "_blank" : undefined} rel={h.external ? "noopener" : undefined} className="flex items-center gap-3 py-2.5 hover:text-ktgw-red">
                      {h.thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.thumb} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{h.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{h.detail}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(h.date, locale, "short")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
