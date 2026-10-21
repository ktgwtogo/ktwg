import { setRequestLocale } from "next-intl/server";
import { MailingForm } from "@/components/admin/comms-ui";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { redirect } from "@/i18n/navigation";
import { audienceLabel } from "@/lib/admin/audiences";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, [string, string]> = {
  en_attente: ["En attente de validation", "bg-ktgw-sun/20 text-ktgw-orange"],
  envoye: ["Envoyé", "bg-ktgw-green/15 text-ktgw-green-strong"],
  refuse: ["Refusé", "bg-destructive/10 text-destructive"],
  echec: ["Échec", "bg-destructive/10 text-destructive"],
};

/** E-mails groupés et newsletter. */
export default async function CommunicationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("newsletter.manage")) return <Forbidden />;
  const { data: history } = await staff.supabase.from("mailings").select("*").order("created_at", { ascending: false }).limit(30);

  return (
    <>
      <PageHeading
        title="E-mails groupés et newsletter"
        description="Écrivez aux membres, à un type de membres, au bureau ou aux abonné·es de la newsletter. Chaque envoi est tracé."
      />
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
          <h2 className="mb-4 text-xl font-bold">Nouvel envoi</h2>
          <MailingForm presidency={staff.presidency} />
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Historique</h2>
          {!history?.length ? (
            <p className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">Aucun envoi pour le moment.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {history.map((m) => {
                const [label, tone] = statusLabels[m.status] ?? [m.status, "bg-muted"];
                return (
                  <li key={m.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/5">
                    <p className="font-semibold">{m.subject}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn("rounded-full px-2 py-0.5 font-semibold", tone)}>{label}</span>
                      {audienceLabel(m.audience)} · {formatDate(m.sent_at ?? m.created_at, locale, "short")}
                      {m.status === "envoye" && ` · ${m.recipients_count} destinataire(s)`}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
