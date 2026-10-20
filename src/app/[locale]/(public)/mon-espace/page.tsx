import { CalendarCheck, LogOut, MessageSquare, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/shared/section";
import { Link, redirect } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

type Status = Database["public"]["Enums"]["submission_status"];
const statusLabels: Record<Status, string> = { nouveau: "Reçue", en_cours: "En cours de traitement", traite: "Traitée", archive: "Archivée" };
const roleLabels = { member: "Membre", editor: "Éditeur·rice", admin: "Administrateur·rice", super_admin: "Super administrateur·rice" };

/** Espace membre : profil et demandes envoyées en étant connecté·e (RLS : uniquement les siennes). */
export default async function MemberPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return redirect({ href: "/connexion", locale });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect({ href: "/connexion", locale });

  const mine = <T,>(q: PromiseLike<{ data: T[] | null }>) => q.then((r) => r.data ?? []);
  const [profile, registrations, messages, partnerships, engagements, trainings, donations] = await Promise.all([
    supabase.from("profiles").select("full_name, email, role").eq("id", user.id).maybeSingle().then((r) => r.data),
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

  const role = profile?.role ?? "member";
  const isStaff = role !== "member";

  return (
    <Container className="flex flex-col gap-8 py-12 sm:py-16">
      <header className="flex flex-col justify-between gap-6 rounded-3xl bg-card p-8 shadow-soft ring-1 ring-foreground/5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-ktgw-green-strong">{roleLabels[role]}</p>
          <h1 className="mt-1 text-3xl font-extrabold">Bonjour{profile?.full_name ? `, ${profile.full_name}` : ""} !</h1>
          <p className="mt-1 text-muted-foreground">{profile?.email ?? user.email}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {isStaff && (
            <Link href="/admin" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 font-semibold text-white dark:bg-white dark:text-ink">
              <ShieldCheck aria-hidden className="size-5" />
              Tableau de bord
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-border px-5 font-semibold">
              <LogOut aria-hidden className="size-5" />
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

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
                status={r.status}
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
              <Item key={r.id} title={r.label} detail={`Envoyée le ${formatDate(r.created_at, locale)}`} status={r.status} />
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-muted-foreground">
        Pour consulter, corriger ou supprimer vos données (RGPD), <Link href="/contact" className="font-semibold underline underline-offset-2">écrivez-nous</Link>.
      </p>
    </Container>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">{children}</p>;
}

function Item({ title, detail, status }: { title: string; detail: string; status: Status }) {
  return (
    <li className="flex flex-col justify-between gap-2 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 sm:flex-row sm:items-center">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <span className="self-start rounded-full bg-ktgw-green/10 px-3 py-1 text-xs font-semibold text-ktgw-green-strong sm:self-auto">
        {statusLabels[status]}
      </span>
    </li>
  );
}
