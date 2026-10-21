import type { Metadata } from "next";
import { AdminShell, type AdminNavItem } from "@/components/admin/admin-shell";
import { redirect } from "@/i18n/navigation";
import { inboxes } from "@/lib/admin/records";
import { getStaff } from "@/lib/admin/staff";
import { canEdit, contentTypes } from "@/lib/content/config";

/** Pages personnelles : toujours rendues à la demande, jamais mises en cache. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

/**
 * Gabarit de l'administration. Chaque rubrique n'apparaît qu'aux postes qui en ont le droit ;
 * les pages vérifient aussi ce droit côté serveur, et la base l'applique par RLS.
 */
export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const staff = await getStaff();
  if (!staff) return redirect({ href: "/mon-espace", locale });
  const { supabase } = staff;

  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [approvals, memberships] = await Promise.all([
    staff.presidency
      ? count(supabase.from("approval_requests").select("id", { count: "exact", head: true }).eq("status", "en_attente"))
      : 0,
    staff.can("members.view")
      ? count(supabase.from("membership_applications").select("id", { count: "exact", head: true }).eq("status", "en_attente"))
      : 0,
  ]);

  const when = (ok: boolean, item: AdminNavItem) => (ok ? [item] : []);
  const items: AdminNavItem[] = [
    { href: "/admin", label: "Vue d'ensemble", icon: "overview", section: "Pilotage" },
    { href: "/admin/validations", label: staff.presidency ? "Validations" : "Mes demandes", icon: "approvals", badge: approvals, section: "Pilotage" },
    ...when(staff.can("reports.view") || staff.can("reports.write"), { href: "/admin/rapports", label: "Rapports d'activité", icon: "reports", section: "Pilotage" }),
    ...when(staff.can("dashboard.view"), { href: "/admin/statistiques", label: "Statistiques de visite", icon: "stats", section: "Pilotage" }),
    { href: "/admin/archives", label: "Archives", icon: "archives", section: "Pilotage" },
    ...when(staff.can("content.manage"), { href: "/admin/publications", label: "Publications / articles", icon: "publications", section: "Site web" }),
    ...when(staff.can("content.manage"), { href: "/admin/contenus/annonces", label: "Annonces", icon: "announcements", section: "Site web" }),
    ...when(contentTypes.some((t) => canEdit(t, staff.can)), { href: "/admin/contenus", label: "Contenus du site", icon: "content", section: "Site web" }),
    ...when(staff.can("pages.manage"), { href: "/admin/site", label: "Apparence et textes", icon: "site", section: "Site web" }),
    ...when(staff.can("newsletter.manage"), { href: "/admin/communication", label: "E-mails et newsletter", icon: "mail", section: "Site web" }),
    ...when(staff.can("members.view"), { href: "/admin/membres", label: "Fichier des membres", icon: "members", section: "Membres" }),
    ...when(staff.can("cards.manage") || staff.can("members.view"), { href: "/admin/cartes", label: "Cartes de membre", icon: "cards", section: "Membres" }),
    ...when(staff.can("members.view"), { href: "/admin/adhesions", label: "Adhésions", icon: "memberships", badge: memberships, section: "Membres" }),
    ...when(staff.can("documents.manage"), { href: "/admin/documents", label: "Documents et envois", icon: "documents", section: "Membres" }),
    ...when(inboxes.some((i) => staff.can(i.permission)), { href: "/admin/demandes", label: "Demandes reçues", icon: "inbox", section: "Membres" }),
    ...when(staff.can("donations.manage"), { href: "/admin/dons", label: "Dons et cotisations", icon: "donations", section: "Finances" }),
    ...when(staff.presidency, { href: "/admin/equipe", label: "Équipe et postes", icon: "team", section: "Présidence" }),
    ...when(staff.presidency, { href: "/admin/journal", label: "Journal d'activité", icon: "journal", section: "Présidence" }),
  ];

  return (
    <AdminShell
      items={items}
      user={{
        name: staff.profile.full_name ?? staff.profile.email,
        position: staff.position?.name ?? (staff.presidency ? "Présidence" : "Équipe"),
      }}
    >
      {children}
    </AdminShell>
  );
}
