import { FileText } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { ApprovalDecision } from "@/components/admin/approval-decision";
import { ContentPreview } from "@/components/admin/content-preview";
import { SettingPreview } from "@/components/admin/setting-preview";
import { PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { approvalKindLabels } from "@/lib/admin/approvals";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Status = Database["public"]["Enums"]["approval_status"];
const statusLabels: Record<Status, string> = { en_attente: "En attente", approuvee: "Approuvée", rejetee: "Refusée" };
const statusTone: Record<Status, string> = {
  en_attente: "bg-ktgw-sun/20 text-ktgw-orange",
  approuvee: "bg-ktgw-green/15 text-ktgw-green-strong",
  rejetee: "bg-destructive/10 text-destructive",
};

/** File de validation (présidence) ou suivi de ses propres demandes (autres postes). */
export default async function ValidationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ statut?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  const { statut } = await searchParams;
  const status: Status = statut === "approuvee" || statut === "rejetee" ? statut : "en_attente";

  // RLS : la présidence voit tout, les autres uniquement leurs demandes.
  const { data: requests } = await staff.supabase
    .from("approval_requests")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: status === "en_attente" })
    .limit(100);

  const ids = [...new Set((requests ?? []).map((r) => r.requested_by).filter(Boolean))] as string[];
  const { data: authors } = ids.length ? await staff.supabase.from("profiles").select("id, full_name, email, position_id").in("id", ids) : { data: [] };
  const authorOf = new Map((authors ?? []).map((a) => [a.id, a.full_name ?? a.email]));

  // Aperçu des fichiers en attente (bucket privé) pour la présidence.
  const paths = (requests ?? [])
    .map((r) => (r.payload as { filePath?: string }).filePath)
    .filter((p): p is string => Boolean(p) && status === "en_attente" && staff.presidency);
  const { data: signed } = paths.length ? await staff.supabase.storage.from("documents").createSignedUrls(paths, 3600) : { data: [] };
  const previewOf = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <>
      <PageHeading
        title={staff.presidency ? "Validations" : "Mes demandes de validation"}
        description={
          staff.presidency
            ? "Tout ce qui est public (documents, pages, articles, newsletters, rapports) attend ici votre accord avant d'être effectif."
            : "Ce que vous avez soumis à la présidence, et sa décision."
        }
      />
      <div role="tablist" aria-label="Statut" className="flex flex-wrap gap-2">
        {(Object.keys(statusLabels) as Status[]).map((s) => (
          <Link
            key={s}
            href={{ pathname: "/admin/validations", query: { statut: s } }}
            role="tab"
            aria-selected={s === status}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold", s === status ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card ring-1 ring-foreground/10")}
          >
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      {!requests?.length ? (
        <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">Aucune demande dans cette catégorie.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {requests.map((r) => {
            const payload = r.payload as Record<string, string | null>;
            const preview = payload.filePath ? previewOf.get(payload.filePath) : null;
            return (
              <li key={r.id} className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-ktgw-green-strong uppercase">{approvalKindLabels[r.kind] ?? r.kind}</p>
                    <h2 className="mt-1 text-xl font-bold">{r.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Par {authorOf.get(r.requested_by ?? "") ?? "un membre de l'équipe"} · {formatDate(r.created_at, locale)}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusTone[r.status])}>{statusLabels[r.status]}</span>
                </div>
                {r.summary && <p className="text-muted-foreground">{r.summary}</p>}
                {r.kind === "document.publish" && (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted/60 p-4 text-sm">
                    <FileText aria-hidden className="size-5 text-ktgw-green" />
                    <span className="font-semibold">{payload.fileName}</span>
                    {payload.description && <span className="text-muted-foreground">— {payload.description}</span>}
                    {preview && (
                      <a href={preview} target="_blank" rel="noopener" className="font-semibold text-ktgw-red underline underline-offset-2">
                        Ouvrir le fichier
                      </a>
                    )}
                  </div>
                )}
                {r.kind === "content.save" && <ContentPreview payload={r.payload as never} />}
                {r.kind === "settings.save" && <SettingPreview payload={r.payload as never} />}
                {r.decision_note && <p className="text-sm">Message de la présidence : {r.decision_note}</p>}
                {r.status === "en_attente" && staff.presidency && <ApprovalDecision id={r.id} title={r.title} />}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
