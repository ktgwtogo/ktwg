import { Download, FileText, Lock } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { getMember } from "@/lib/member/session";

export const metadata: Metadata = { title: "Documents", robots: { index: false } };

/** Documents officiels : ceux destinés aux membres validés et ceux adressés personnellement. */
export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });

  // RLS : ne renvoie que les documents auxquels la personne a droit.
  const { data: documents } = await member.supabase
    .from("documents")
    .select("id, title, description, file_name, audience, created_at")
    .order("created_at", { ascending: false });

  const isMember = member.profile.membership_status === "validee";

  return (
    <section aria-labelledby="documents" className="flex flex-col gap-4">
      <h2 id="documents" className="text-2xl font-bold">
        Documents officiels
      </h2>
      {!isMember && (
        <p className="flex items-start gap-3 rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            Les documents réservés aux membres (statuts, comptes rendus, convocations…) seront visibles ici dès que votre adhésion sera validée.{" "}
            <Link href="/mon-espace/adhesion" className="font-semibold text-foreground underline underline-offset-2">
              Voir mon adhésion
            </Link>
          </span>
        </p>
      )}
      {!documents?.length ? (
        <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">Aucun document pour le moment.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-col justify-between gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <FileText aria-hidden className="mt-0.5 size-6 shrink-0 text-ktgw-green" />
                <div>
                  <p className="font-semibold">{d.title}</p>
                  {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.audience === "user" ? "Document personnel" : "Tous les membres"} · {formatDate(d.created_at, locale)}
                  </p>
                </div>
              </div>
              <a
                href={`/api/documents/${d.id}`}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-border px-4 text-sm font-semibold"
              >
                <Download aria-hidden className="size-4" />
                Télécharger
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
