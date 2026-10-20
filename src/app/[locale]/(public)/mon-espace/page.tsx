import { ArrowRight, Bell, CalendarCheck, CheckCheck, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { markNotificationsRead } from "@/lib/member/actions";
import { submissionStatusLabels } from "@/lib/member/labels";
import { getMember } from "@/lib/member/session";
import { missingProfileFields } from "@/lib/validations/member";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

/** Tableau de bord : prochaine étape, notifications, inscriptions et demandes. */
export default async function MemberPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const { supabase, user, profile } = member;

  const mine = <T,>(q: PromiseLike<{ data: T[] | null }>) => q.then((r) => r.data ?? []);
  const [notifications, registrations, messages, partnerships, engagements, trainings, donations] = await Promise.all([
    mine(supabase.from("notifications").select("id, title, body, link, read_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)),
    mine(supabase.from("event_registrations").select("id, seats, status, created_at, events(title, starts_at)").eq("user_id", user.id)),
    mine(supabase.from("contact_messages").select("id, subject, status, created_at").eq("user_id", user.id)),
    mine(supabase.from("partnership_requests").select("id, organization, status, created_at").eq("user_id", user.id)),
    mine(supabase.from("engagement_applications").select("id, type, status, created_at").eq("user_id", user.id)),
    mine(supabase.from("training_applications").select("id, track, status, created_at").eq("user_id", user.id)),
    mine(supabase.from("donation_declarations").select("id, amount_fcfa, status, created_at").eq("user_id", user.id)),
  ]);

  const requests = [
    ...messages.map((m) => ({ ...m, label: `Message : ${m.subject}` })),
    ...partnerships.map((p) => ({ ...p, label: `Partenariat : ${p.organization}` })),
    ...engagements.map((e) => ({ ...e, label: e.type })),
    ...trainings.map((t) => ({ ...t, label: `Candidature : ${t.track}` })),
    ...donations.map((d) => ({ ...d, label: `Don de ${d.amount_fcfa.toLocaleString("fr-FR")} FCFA` })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const missing = missingProfileFields(profile);
  const unread = notifications.filter((n) => !n.read_at).length;
  const nextStep =
    missing.length > 0
      ? { title: "Complétez votre profil", text: "Présentez-vous, ajoutez vos coordonnées et votre photo.", href: "/mon-espace/profil", cta: "Compléter mon profil" }
      : profile.membership_status === "aucune" || profile.membership_status === "refusee"
        ? { title: "Demandez votre adhésion", text: "Choisissez de devenir adhérent·e, membre actif·ve ou donateur·rice.", href: "/mon-espace/adhesion", cta: "Faire ma demande" }
        : profile.membership_status === "en_attente"
          ? { title: "Demande en cours d'examen", text: "L'association étudie votre demande. Vous serez notifié·e ici dès la décision.", href: "/mon-espace/adhesion", cta: "Voir ma demande" }
          : { title: "Vous êtes membre de l'association", text: "Retrouvez les documents officiels partagés par l'administration.", href: "/mon-espace/documents", cta: "Voir les documents" };

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={nextStep.href}
        className="group flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-ktgw-green-strong to-ktgw-green p-6 text-white shadow-soft sm:flex-row sm:items-center sm:p-8"
      >
        <div>
          <p className="text-xl font-bold">{nextStep.title}</p>
          <p className="mt-1 text-white/85">{nextStep.text}</p>
        </div>
        <span className="inline-flex items-center gap-2 font-semibold whitespace-nowrap">
          {nextStep.cta}
          <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>

      <section aria-labelledby="notifications" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="notifications" className="flex items-center gap-2 text-xl font-bold">
            <Bell aria-hidden className="size-5 text-ktgw-green" />
            Notifications
          </h2>
          {unread > 0 && (
            <form action={markNotificationsRead}>
              <button type="submit" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
                <CheckCheck aria-hidden className="size-4" />
                Tout marquer comme lu
              </button>
            </form>
          )}
        </div>
        {notifications.length === 0 ? (
          <Empty>Aucune notification pour le moment.</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {notifications.map((n) => (
              <li key={n.id} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">
                    {!n.read_at && <span aria-label="Non lue" className="mr-2 inline-block size-2 rounded-full bg-ktgw-red align-middle" />}
                    {n.title}
                  </p>
                  <time dateTime={n.created_at} className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(n.created_at, locale, "short")}
                  </time>
                </div>
                {n.body && <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">{n.body}</p>}
                {n.link?.startsWith("/") && (
                  <Link href={n.link} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ktgw-red">
                    Voir <ArrowRight aria-hidden className="size-4" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="mes-inscriptions" className="flex flex-col gap-4">
        <h2 id="mes-inscriptions" className="flex items-center gap-2 text-xl font-bold">
          <CalendarCheck aria-hidden className="size-5 text-ktgw-green" />
          Mes inscriptions aux événements
        </h2>
        {registrations.length === 0 ? (
          <Empty>
            Aucune inscription pour le moment. <Link href="/evenements" className="font-semibold text-ktgw-red underline underline-offset-2">Voir l&apos;agenda</Link>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {registrations.map((r) => (
              <Item
                key={r.id}
                title={r.events?.title ?? "Événement"}
                detail={`${r.events ? formatDate(r.events.starts_at, locale) : ""} · ${r.seats} place${r.seats > 1 ? "s" : ""}`}
                status={submissionStatusLabels[r.status]}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="mes-demandes" className="flex flex-col gap-4">
        <h2 id="mes-demandes" className="flex items-center gap-2 text-xl font-bold">
          <MessageSquare aria-hidden className="size-5 text-ktgw-green" />
          Mes messages et demandes
        </h2>
        {requests.length === 0 ? (
          <Empty>Les demandes envoyées en étant connecté·e apparaîtront ici.</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.map((r) => (
              <Item key={r.id} title={r.label} detail={`Envoyée le ${formatDate(r.created_at, locale)}`} status={submissionStatusLabels[r.status]} />
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        Pour consulter, corriger ou supprimer vos données (RGPD), <Link href="/contact" className="font-semibold underline underline-offset-2">écrivez-nous</Link>.
      </p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">{children}</p>;
}

function Item({ title, detail, status }: { title: string; detail: string; status: string }) {
  return (
    <li className="flex flex-col justify-between gap-2 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 sm:flex-row sm:items-center">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <span className="self-start rounded-full bg-ktgw-green/10 px-3 py-1 text-xs font-semibold text-ktgw-green-strong sm:self-auto">{status}</span>
    </li>
  );
}
