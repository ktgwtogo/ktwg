import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ReportEditor, type ReportDraft } from "@/components/admin/comms-ui";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";

/** Rédaction d'un rapport (« nouveau ») ou reprise d'un brouillon. */
export default async function ReportEditPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("reports.write")) return <Forbidden />;

  let draft: ReportDraft = { id: null, title: "", period: "", category: "activite", summary: "", body: "", audience: [], filePath: null, fileName: null };
  if (id !== "nouveau") {
    const { data: r } = await staff.supabase.from("reports").select("*").eq("id", id).eq("author_id", staff.user.id).maybeSingle();
    if (!r || (r.status !== "brouillon" && r.status !== "refuse")) notFound();
    draft = { id: r.id, title: r.title, period: r.period, category: r.category, summary: r.summary, body: r.body, audience: r.audience, filePath: r.file_path, fileName: r.file_name };
  }
  const { data: positions } = await staff.supabase.from("positions").select("id, name").neq("id", "president").order("sort_order");

  return (
    <>
      <Link href="/admin/rapports" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        Rapports
      </Link>
      <PageHeading title={draft.id ? draft.title || "Brouillon" : "Nouveau rapport"} />
      <div className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
        <ReportEditor draft={draft} positions={positions ?? []} presidency={staff.presidency} />
      </div>
    </>
  );
}
