import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { Container } from "@/components/shared/section";
import { Link, redirect } from "@/i18n/navigation";
import { roleLabels } from "@/lib/member/labels";
import { getMember } from "@/lib/member/session";

/** Pages personnelles : toujours rendues à la demande, jamais mises en cache. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Administration", robots: { index: false } };

/** Gabarit de l'administration (équipe : editor et au-dessus ; vérifié aussi par le middleware). */
export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  if (member.profile.role === "member") return redirect({ href: "/mon-espace", locale });

  const { count } = await member.supabase
    .from("membership_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "en_attente");

  return (
    <Container className="flex flex-col gap-6 py-10 sm:py-14">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-ktgw-green-strong">
            <ShieldCheck aria-hidden className="size-4" />
            {roleLabels[member.profile.role]}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">Administration</h1>
        </div>
        <Link href="/mon-espace" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden className="size-4" />
          Mon espace
        </Link>
      </header>
      <AdminNav pending={count ?? 0} />
      {children}
    </Container>
  );
}
