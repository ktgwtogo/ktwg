import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { redirect } from "@/i18n/navigation";
import { guides } from "@/lib/admin/guides";
import { getAdminNav } from "@/lib/admin/nav";
import { getStaff } from "@/lib/admin/staff";

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
  const items = await getAdminNav(staff);

  return (
    <AdminShell
      items={items}
      guides={guides.filter((g) => items.some((i) => i.href === g.href))}
      presidency={staff.presidency}
      user={{
        name: staff.profile.full_name ?? staff.profile.email,
        position: staff.position?.name ?? (staff.presidency ? "Présidence" : "Équipe"),
      }}
    >
      {children}
    </AdminShell>
  );
}
