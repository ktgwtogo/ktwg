import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/records-ui";
import { Logo } from "@/components/shared/logo";
import { redirect } from "@/i18n/navigation";
import { getStaff } from "@/lib/admin/staff";
import { formatDate } from "@/lib/format";
import { getMember, photoUrl } from "@/lib/member/session";
import { membershipTypeLabels } from "@/lib/validations/member";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Carte de membre", robots: { index: false } };

/** Carte de membre imprimable (format carte bancaire) : la personne elle-même ou le secrétariat. */
export default async function MemberCardPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const member = await getMember();
  if (!member) return redirect({ href: "/connexion", locale });
  const staff = member.user.id === id ? null : await getStaff();
  if (member.user.id !== id && !staff?.can("members.view")) notFound();

  const { data: p } = await member.supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!p || p.membership_status !== "validee") notFound();
  const photo = await photoUrl(member, p.photo_path);
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.full_name || p.email;
  const year = new Date().getFullYear();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted p-6 print:bg-white print:p-0">
      <style>{"@page { size: 85.6mm 54mm; margin: 0 } @media print { html, body { background: white } }"}</style>
      <article
        aria-label={`Carte de membre de ${name}`}
        className="relative flex h-[54mm] w-[85.6mm] overflow-hidden rounded-[3mm] bg-gradient-to-br from-ktgw-green-dark to-ktgw-green-strong text-white shadow-2xl print:rounded-none print:shadow-none"
      >
        <div className="absolute inset-x-0 bottom-0 h-[2.2mm] bg-gradient-to-r from-ktgw-red via-ktgw-sun to-ktgw-green" />
        <div className="flex w-[27mm] shrink-0 flex-col items-center justify-center gap-[2mm] bg-white/10 p-[2.5mm]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-[30mm] w-[23mm] rounded-[1.5mm] object-cover ring-2 ring-white/70" />
          ) : (
            <span className="flex h-[30mm] w-[23mm] items-center justify-center rounded-[1.5mm] bg-white/20">
              <UserRound aria-hidden className="size-10" />
            </span>
          )}
          <span className="text-[2.6mm] font-bold tracking-wider">{p.member_number}</span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-[3mm] pb-[4mm]">
          <div className="flex items-center gap-[2mm]">
            <span className="rounded-[1mm] bg-white p-[0.8mm]">
              <Logo className="h-[8mm] w-auto" />
            </span>
            <div className="leading-tight">
              <p className="text-[2.8mm] font-extrabold">KTGW Togo</p>
              <p className="text-[2mm] text-white/80">Carte de membre {year}</p>
            </div>
          </div>
          <div className="leading-tight">
            <p className="text-[4mm] font-extrabold">{name}</p>
            <p className="mt-[0.8mm] inline-block rounded-full bg-ktgw-sun px-[2mm] py-[0.4mm] text-[2.3mm] font-bold text-ink">
              {p.membership_type ? membershipTypeLabels[p.membership_type] : "Membre"}
            </p>
          </div>
          <div className="text-[2.1mm] leading-snug text-white/85">
            {p.member_since && <p>Membre depuis le {formatDate(p.member_since, locale)}</p>}
            <p>Valable jusqu&apos;au 31/12/{year} · www.ktgw.tg</p>
          </div>
        </div>
      </article>
      <PrintButton />
    </main>
  );
}
