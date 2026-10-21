import { setRequestLocale } from "next-intl/server";
import { Pencil, Printer } from "lucide-react";
import { IssueCardButton } from "@/components/cards/card-admin-ui";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { cardStage, cardStageLabels, cardStatus, cardStatusLabels } from "@/lib/cards/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { membershipTypeLabels } from "@/lib/validations/member";

/** Cartes de membre : membres validés à équiper, cartes émises (valides, expirées, révoquées). */
export default async function CardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("cards.manage") && !staff.can("members.view")) return <Forbidden />;
  const canManage = staff.can("cards.manage");

  const [{ data: cards }, { data: members }] = await Promise.all([
    staff.supabase.from("member_cards").select("*").order("created_at", { ascending: false }).limit(500),
    staff.supabase
      .from("profiles")
      .select("id, first_name, last_name, full_name, email, membership_type, member_number, member_since")
      .eq("membership_status", "validee")
      .order("member_since"),
  ]);
  const withActiveCard = new Set((cards ?? []).filter((c) => c.status === "active").map((c) => c.user_id));
  const toEquip = (members ?? []).filter((m) => !withActiveCard.has(m.id));

  return (
    <>
      <PageHeading
        title="Cartes de membre"
        description="Carte 9 × 5,5 cm avec photo, QR code vérifiable, valable 5 ans. Circuit : création → contrôle par le bureau → transmission au membre → accord du membre → téléchargement."
      />

      <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
        <h2 className="text-xl font-bold">Membres validés sans carte ({toEquip.length})</h2>
        {!toEquip.length ? (
          <p className="mt-3 text-sm text-muted-foreground">Tous les membres validés ont une carte active.</p>
        ) : (
          <ul className="mt-4 flex flex-col divide-y">
            {toEquip.map((m) => (
              <li key={m.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/admin/membres/${m.id}`} className="font-semibold hover:underline">
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") || m.full_name || m.email}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {m.member_number} · {m.membership_type ? membershipTypeLabels[m.membership_type] : ""}
                    {m.member_since ? ` · membre depuis le ${formatDate(m.member_since, locale, "short")}` : ""}
                  </p>
                </div>
                {canManage && <IssueCardButton userId={m.id} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Cartes émises ({cards?.length ?? 0})</h2>
        {!cards?.length ? (
          <p className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">Aucune carte émise pour le moment.</p>
        ) : (
          <div className="overflow-x-auto rounded-3xl bg-card shadow-soft ring-1 ring-foreground/5">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    N° de carte
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Titulaire
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Qualité
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Validité
                  </th>
                  <th scope="col" className="px-5 py-3">
                    État
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Circuit
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cards.map((c) => {
                  const [label, tone] = cardStatusLabels[cardStatus(c)];
                  const [stage, stageTone] = cardStageLabels[cardStage(c)];
                  return (
                    <tr key={c.id}>
                      <td className="px-5 py-3 font-semibold">
                        <Link href={`/admin/cartes/${c.id}`} className="hover:underline">
                          {c.card_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3">{c.full_name}</td>
                      <td className="px-5 py-3">{membershipTypeLabels[c.membership_type]}</td>
                      <td className="px-5 py-3 text-muted-foreground">jusqu&apos;au {formatDate(c.expires_at, locale, "short")}</td>
                      <td className="px-5 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tone)}>{label}</span>
                      </td>
                      <td className="px-5 py-3">
                        {c.status === "active" && (
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap", stageTone)}>{stage}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Link
                            href={`/admin/cartes/${c.id}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ktgw-green-strong px-2.5 text-xs font-semibold text-white"
                          >
                            <Pencil aria-hidden className="size-3.5" />
                            Contrôler
                          </Link>
                          {c.status === "active" && (
                            <a
                              href={`/impression/carte/${c.id}?format=carte`}
                              target="_blank"
                              rel="noopener"
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border-2 border-border px-2.5 text-xs font-semibold hover:bg-muted"
                            >
                              <Printer aria-hidden className="size-3.5" />
                              PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
