import { ArrowLeft, Download, FileText, HandCoins, IdCard, Receipt, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { IssueCardButton } from "@/components/cards/card-admin-ui";
import { Forbidden, PageHeading } from "@/components/admin/page-heading";
import { Link, redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { cardPhotoUrl, cardStatus, cardStatusLabels } from "@/lib/cards/card";
import { formatDate } from "@/lib/format";
import { membershipStatusLabels, membershipStatusTone } from "@/lib/member/labels";
import { cn } from "@/lib/utils";
import { membershipTypeLabels } from "@/lib/validations/member";

/** Dossier d'un membre : fiche, adhésions, cartes, documents personnels et paiements. */
export default async function MemberFilePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  if (!staff.can("members.view")) return <Forbidden />;
  const db = staff.supabase;

  const { data: p } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const [applications, cards, documents, payments, photo] = await Promise.all([
    db.from("membership_applications").select("*").eq("user_id", id).order("created_at", { ascending: false }).then((r) => r.data ?? []),
    db.from("member_cards").select("*").eq("user_id", id).order("created_at", { ascending: false }).then((r) => r.data ?? []),
    db.from("documents").select("*").eq("recipient_id", id).order("created_at", { ascending: false }).then((r) => r.data ?? []),
    staff.can("donations.manage")
      ? db.from("donation_declarations").select("*").or(`user_id.eq.${id},email.eq.${p.email}`).order("created_at", { ascending: false }).then((r) => r.data ?? [])
      : Promise.resolve([]),
    cardPhotoUrl(db, p.photo_path),
  ]);
  const name = [p.civility, p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email;
  const activeCard = cards.find((c) => c.status === "active");

  const info: [string, string | null][] = [
    ["E-mail", p.email],
    ["Téléphone", p.phone],
    ["WhatsApp", p.whatsapp],
    ["Né·e le", p.birth_date ? formatDate(p.birth_date, locale) : null],
    ["Nationalité", p.nationality],
    ["Profession", [p.profession, p.organization].filter(Boolean).join(" · ") || null],
    ["Adresse", [p.address, p.city, p.country].filter(Boolean).join(", ") || null],
    ["Inscrit·e le", formatDate(p.created_at, locale)],
  ];

  return (
    <>
      <Link href="/admin/membres" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        Fichier des membres
      </Link>

      <section className="flex flex-col gap-6 rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5 sm:flex-row">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`Photo de ${name}`} className="h-40 w-32 shrink-0 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-40 w-32 shrink-0 items-center justify-center rounded-2xl bg-muted">
            <UserRound aria-hidden className="size-12 text-muted-foreground" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <PageHeading title={name} />
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className={cn("rounded-full px-3 py-1 font-semibold", membershipStatusTone[p.membership_status])}>
              {membershipStatusLabels[p.membership_status]}
              {p.membership_type ? ` · ${membershipTypeLabels[p.membership_type]}` : ""}
            </span>
            {p.member_number && <span className="text-muted-foreground">N° {p.member_number}</span>}
            {p.member_since && <span className="text-muted-foreground">membre depuis le {formatDate(p.member_since, locale)}</span>}
          </p>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {info.map(([label, value]) =>
              value ? (
                <div key={label} className="flex gap-2">
                  <dt className="shrink-0 font-semibold">{label} :</dt>
                  <dd className="min-w-0 break-words text-muted-foreground">{value}</dd>
                </div>
              ) : null
            )}
          </dl>
          {p.bio && <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm whitespace-pre-line">{p.bio}</p>}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel icon={IdCard} title="Cartes de membre">
          {!cards.length ? (
            <p className="text-sm text-muted-foreground">Aucune carte émise.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {cards.map((c) => {
                const [label, tone] = cardStatusLabels[cardStatus(c)];
                return (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={`/admin/cartes/${c.id}`} className="font-semibold hover:underline">
                      {c.card_number}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(c.issued_at, locale, "short")} → {formatDate(c.expires_at, locale, "short")}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tone)}>{label}</span>
                    {c.status === "active" && (
                      <a href={`/impression/carte/${c.id}`} target="_blank" rel="noopener" aria-label="Télécharger la carte" className="rounded-lg p-1.5 hover:bg-muted">
                        <Download aria-hidden className="size-4" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!activeCard && p.membership_status === "validee" && staff.can("cards.manage") && (
            <div className="mt-3">
              <IssueCardButton userId={p.id} />
            </div>
          )}
        </Panel>

        <Panel icon={FileText} title="Demandes d'adhésion">
          {!applications.length ? (
            <p className="text-sm text-muted-foreground">Aucune demande.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {applications.map((a) => (
                <li key={a.id} className="rounded-2xl bg-muted/50 p-3 text-sm">
                  <p className="font-semibold">
                    {membershipTypeLabels[a.type]} · {formatDate(a.created_at, locale, "short")} ·{" "}
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", membershipStatusTone[a.status])}>{membershipStatusLabels[a.status]}</span>
                  </p>
                  <p className="mt-1 text-muted-foreground">{a.motivation}</p>
                  {a.decision_note && <p className="mt-1 text-xs">Décision : {a.decision_note}</p>}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel icon={FileText} title="Documents adressés personnellement">
          {!documents.length ? (
            <p className="text-sm text-muted-foreground">Aucun document personnel.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="font-semibold">{d.title}</span>
                  <a href={`/api/documents/${d.id}`} className="inline-flex items-center gap-1 text-ktgw-red">
                    <Download aria-hidden className="size-4" />
                    {formatDate(d.created_at, locale, "short")}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {staff.can("donations.manage") && (
          <Panel icon={HandCoins} title="Dons et cotisations">
            {!payments.length ? (
              <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {payments.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span>
                      <strong>{d.amount_fcfa.toLocaleString("fr-FR")} FCFA</strong> · {d.kind} · {formatDate(d.received_at ?? d.created_at, locale, "short")}
                    </span>
                    {d.receipt_number ? (
                      <a href={`/impression/recu/${d.id}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-ktgw-red">
                        <Receipt aria-hidden className="size-4" />
                        {d.receipt_number}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">à vérifier</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>
    </>
  );
}

function Panel({ icon: Icon, title, children }: { icon: typeof IdCard; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-foreground/5">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Icon aria-hidden className="size-5 text-ktgw-green" />
        {title}
      </h2>
      {children}
    </section>
  );
}
