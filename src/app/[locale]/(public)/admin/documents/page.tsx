import { Download, FileText } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { DeleteDocumentButton, DocumentUpload } from "@/components/admin/document-upload";
import { redirect } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { getMember } from "@/lib/member/session";

/** Publication et liste des documents officiels. */
export default async function AdminDocuments({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const { supabase } = member;
  const isAdmin = member.profile.role === "admin" || member.profile.role === "super_admin";

  const [{ data: documents }, { data: people }] = await Promise.all([
    supabase.from("documents").select("id, title, description, audience, recipient_id, file_name, created_at").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, first_name, last_name, full_name, membership_status").order("last_name"),
  ]);
  const nameOf = new Map(
    (people ?? []).map((p) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email])
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section aria-labelledby="publier" className="h-fit rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
        <h2 id="publier" className="mb-5 text-xl font-bold">
          Publier un document
        </h2>
        {isAdmin ? (
          <DocumentUpload
            people={(people ?? []).map((p) => ({
              id: p.id,
              label: `${nameOf.get(p.id)} (${p.email})${p.membership_status === "validee" ? " — membre" : ""}`,
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">La publication est réservée aux administrateurs.</p>
        )}
      </section>

      <section aria-labelledby="publies" className="flex flex-col gap-4">
        <h2 id="publies" className="text-xl font-bold">
          Documents publiés
        </h2>
        {!documents?.length ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">Aucun document publié.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {documents.map((d) => (
              <li key={d.id} className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
                <div className="flex gap-3">
                  <FileText aria-hidden className="mt-0.5 size-6 shrink-0 text-ktgw-green" />
                  <div className="min-w-0">
                    <p className="font-semibold">{d.title}</p>
                    {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.audience === "members" ? "Tous les membres validés" : `Pour ${nameOf.get(d.recipient_id ?? "") ?? "une personne"}`} ·{" "}
                      {formatDate(d.created_at, locale)} · {d.file_name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`/api/documents/${d.id}`} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-muted">
                    <Download aria-hidden className="size-4" />
                    Télécharger
                  </a>
                  {isAdmin && <DeleteDocumentButton id={d.id} title={d.title} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
