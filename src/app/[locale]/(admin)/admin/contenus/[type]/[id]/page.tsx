import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ContentEditor } from "@/components/admin/content-editor";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { canEdit, getContentType } from "@/lib/content/config";
import { toFormValues } from "@/lib/content/normalize";

/** Création (« nouveau ») ou modification d'un contenu. */
export default async function ContentEdit({ params }: { params: Promise<{ locale: string; type: string; id: string }> }) {
  const { locale, type: typeId, id } = await params;
  setRequestLocale(locale);
  const type = getContentType(typeId);
  if (!type) notFound();
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!canEdit(type, staff.can)) return <Forbidden />;

  const isNew = id === "nouveau";
  let row: Record<string, unknown> | null = null;
  if (!isNew) {
    const { data } = await staff.supabase.from(type.table as "posts").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    row = data as unknown as Record<string, unknown>;
  }

  const { data: pages } = type.fields.some((f) => f.type === "placements") ? await staff.supabase.from("pages").select("slug, title").order("sort_order") : { data: [] };
  const initial = toFormValues(type, row);
  if (isNew) {
    // Valeurs par défaut utiles pour un nouvel élément.
    const today = new Date().toISOString();
    for (const f of type.fields) {
      if (f.name === "published_on") initial[f.name] = today.slice(0, 10);
      if (f.name === "starts_at" && type.id === "annonces") initial[f.name] = today.slice(0, 16);
      if (f.type === "select" && f.options?.length && !initial[f.name]) initial[f.name] = f.options[0].value;
    }
  }

  return (
    <>
      <Link href={`/admin/contenus/${type.id}`} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        {type.label}
      </Link>
      <PageHeading
        title={isNew ? `Nouveau : ${type.singular}` : String(row?.[type.titleField] ?? type.singular)}
        description={staff.presidency ? undefined : "Votre proposition sera publiée après validation par la présidence."}
      />
      <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
        <ContentEditor typeId={type.id} id={isNew ? null : id} initial={initial} presidency={staff.presidency} pages={pages ?? []} />
      </div>
    </>
  );
}
