import { Download, FileText, Mail } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { DeleteDocumentButton, DocumentUpload } from "@/components/admin/document-upload";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { redirect } from "@/i18n/navigation";
import { categoryLabel } from "@/lib/admin/mailbox";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";

/** Envois aux membres : documents, statuts, règlements, annonces, événements, publicités. */
export default async function AdminDocuments({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("documents.manage")) return <Forbidden />;
  const { supabase } = staff;
  const isAdmin = staff.presidency;

  const [{ data: documents }, { data: people }] = await Promise.all([
    supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("profiles").select("id, email, first_name, last_name, full_name, membership_status").order("last_name"),
  ]);
  const nameOf = new Map((people ?? []).map((p) => [p.id, [p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email]));

  return (
    <>
      <PageHeading
        title="Documents et envois aux membres"
        description={
          isAdmin
            ? "Statuts, règlement, convocations, annonces, événements, publicités… déposés dans l'espace des membres et envoyés dans leur boîte mail."
            : "Préparez vos envois : ils sont diffusés après validation par la présidence."
        }
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="publier" className="h-fit rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 id="publier" className="mb-5 text-xl font-bold">
            Nouvel envoi
          </h2>
          <DocumentUpload
            presidency={isAdmin}
            people={(people ?? []).map((p) => ({ id: p.id, label: `${nameOf.get(p.id)} (${p.email})${p.membership_status === "validee" ? " — membre" : ""}` }))}
          />
        </section>

        <section aria-labelledby="publies" className="flex flex-col gap-4">
          <h2 id="publies" className="text-xl font-bold">
            Envois effectués
          </h2>
          {!documents?.length ? (
            <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">Aucun envoi pour le moment.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {documents.map((d) => (
                <li key={d.id} className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
                  <div className="flex gap-3">
                    <FileText aria-hidden className="mt-0.5 size-6 shrink-0 text-ktgw-green" />
                    <div className="min-w-0">
                      <p className="font-semibold">
                        <span className="mr-2 rounded-full bg-ktgw-green/10 px-2 py-0.5 text-xs text-ktgw-green-strong">{categoryLabel(d.category)}</span>
                        {d.title}
                      </p>
                      {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        {d.audience === "members" ? "Tous les membres validés" : d.audience === "accounts" ? "Tous les inscrits" : `Pour ${nameOf.get(d.recipient_id ?? "") ?? "une personne"}`}
                        <span>· {formatDate(d.created_at, locale)}</span>
                        {d.emailed_count > 0 && (
                          <span className="inline-flex items-center gap-1">
                            · <Mail aria-hidden className="size-3" /> {d.emailed_count} e-mail(s)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {d.file_path && (
                      <a href={`/api/documents/${d.id}`} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-muted">
                        <Download aria-hidden className="size-4" />
                        {d.file_name}
                      </a>
                    )}
                    {isAdmin && <DeleteDocumentButton id={d.id} title={d.title} />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
