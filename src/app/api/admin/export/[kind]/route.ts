import { NextResponse, type NextRequest } from "next/server";
import { getInbox } from "@/lib/admin/records";
import { audit, getStaff } from "@/lib/admin/staff";

/** Cellule CSV sûre : guillemets doublés, formules neutralisées (=, +, -, @). */
const cell = (v: unknown) => {
  let s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join(", ") : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

function csv(rows: Record<string, unknown>[], columns: [string, string][]) {
  const lines = [columns.map(([, label]) => cell(label)).join(";"), ...rows.map((r) => columns.map(([k]) => cell(r[k])).join(";"))];
  // BOM UTF-8 : accents correctement lus par Excel.
  return `﻿${lines.join("\r\n")}`;
}

/** Export Excel (CSV) : membres, dons, ou une boîte de demandes, selon les droits du poste. */
export async function GET(_: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const staff = await getStaff();
  if (!staff) return new NextResponse("Accès refusé.", { status: 403 });
  const db = staff.supabase;
  let body: string | null = null;

  if (kind === "membres" && staff.can("members.view")) {
    const { data } = await db.from("profiles").select("*").order("last_name");
    body = csv((data ?? []) as never, [
      ["member_number", "N° de membre"], ["membership_status", "Statut"], ["membership_type", "Type"], ["member_since", "Membre depuis"],
      ["civility", "Civilité"], ["first_name", "Prénom"], ["last_name", "Nom"], ["email", "E-mail"], ["phone", "Téléphone"],
      ["whatsapp", "WhatsApp"], ["birth_date", "Naissance"], ["nationality", "Nationalité"], ["profession", "Profession"],
      ["address", "Adresse"], ["city", "Ville"], ["country", "Pays"], ["created_at", "Inscrit le"],
    ]);
  } else if (kind === "dons" && staff.can("donations.manage")) {
    const { data } = await db.from("donation_declarations").select("*").order("created_at", { ascending: false });
    body = csv((data ?? []) as never, [
      ["receipt_number", "N° de reçu"], ["status", "Statut"], ["kind", "Nature"], ["amount_fcfa", "Montant (FCFA)"], ["name", "Nom"],
      ["email", "E-mail"], ["phone", "Téléphone"], ["method", "Moyen"], ["frequency", "Fréquence"], ["reference", "Référence"],
      ["project", "Projet"], ["received_at", "Reçu le"], ["created_at", "Déclaré le"],
    ]);
  } else {
    const inbox = getInbox(kind);
    if (inbox && staff.can(inbox.permission)) {
      const { data } = await db.from(inbox.table as "contact_messages").select("*").order("created_at", { ascending: false });
      const rows = (data ?? []) as unknown as Record<string, unknown>[];
      const keys = rows.length ? Object.keys(rows[0]).filter((k) => !["id", "user_id"].includes(k)) : [];
      body = csv(rows, keys.map((k) => [k, k]));
    }
  }

  if (body === null) return new NextResponse("Accès refusé.", { status: 403 });
  await audit(staff, "export", kind, null, { title: kind });
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ktgw-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
