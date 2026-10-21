import { Download } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { SubmissionControls } from "@/components/admin/records-ui";
import { Link, redirect } from "@/i18n/navigation";
import { columnLabels, inboxes, submissionStatuses } from "@/lib/admin/records";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Demandes reçues par les formulaires du site, selon les boîtes du poste. */
export default async function InboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ boite?: string; statut?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  const mine = inboxes.filter((i) => staff.can(i.permission));
  if (!mine.length) return <Forbidden />;
  const { boite, statut } = await searchParams;
  const inbox = mine.find((i) => i.id === boite) ?? mine[0];
  const status = submissionStatuses.find((s) => s.value === statut)?.value ?? "nouveau";

  const { data } = await staff.supabase
    .from(inbox.table as "contact_messages")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as unknown as Record<string, unknown>[];

  // Titres des événements pour les inscriptions.
  let eventTitle = new Map<string, string>();
  if (inbox.table === "event_registrations" && rows.length) {
    const { data: events } = await staff.supabase.from("events").select("id, title").in("id", [...new Set(rows.map((r) => String(r.event_id)))]);
    eventTitle = new Map((events ?? []).map((e) => [e.id, e.title]));
  }

  return (
    <>
      <PageHeading title="Demandes reçues" description="Messages et candidatures envoyés par les formulaires du site. Changez le statut au fil du traitement.">
        <a href={`/api/admin/export/${inbox.id}`} className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-sm font-semibold">
          <Download aria-hidden className="size-4" />
          Exporter (Excel)
        </a>
      </PageHeading>
      <div className="flex flex-wrap gap-2">
        {mine.map((i) => (
          <Link
            key={i.id}
            href={{ pathname: "/admin/demandes", query: { boite: i.id } }}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold", i.id === inbox.id ? "bg-ktgw-green-strong text-white" : "bg-card ring-1 ring-foreground/10")}
          >
            {i.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {submissionStatuses.map((s) => (
          <Link
            key={s.value}
            href={{ pathname: "/admin/demandes", query: { boite: inbox.id, statut: s.value } }}
            className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", s.value === status ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-card ring-1 ring-foreground/10")}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {!rows.length ? (
        <p className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">Aucune demande dans cette catégorie.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={String(r.id)} className="rounded-3xl bg-card p-5 shadow-soft ring-1 ring-foreground/5">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">
                    {inbox.title(r)}
                    {inbox.table === "event_registrations" && <span className="font-normal text-muted-foreground"> · {eventTitle.get(String(r.event_id))}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(String(r.created_at), locale, "short")}</span>
                </summary>
                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {Object.entries(columnLabels).map(([k, label]) => {
                    const v = r[k];
                    if (v === null || v === undefined || v === "" || (Array.isArray(v) && !v.length)) return null;
                    const long = typeof v === "string" && v.length > 80;
                    return (
                      <div key={k} className={long ? "sm:col-span-2" : undefined}>
                        <dt className="font-semibold">{label}</dt>
                        <dd className="whitespace-pre-line text-muted-foreground">
                          {k === "email" ? <a href={`mailto:${v}`} className="underline">{String(v)}</a> : Array.isArray(v) ? v.join(", ") : v === true ? "Oui" : v === false ? "Non" : String(v)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </details>
              <div className="mt-3">
                <SubmissionControls inbox={inbox.id} id={String(r.id)} status={String(r.status)} notes={(r.admin_notes as string | null) ?? null} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
