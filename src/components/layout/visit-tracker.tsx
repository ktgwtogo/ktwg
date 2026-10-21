"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const KEY = "ktgw-visitor";

/** Identifiant aléatoire du navigateur (aucune donnée personnelle) ; null si le stockage est bloqué. */
function visitorId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

const device = () => {
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablette" : "ordinateur";
};

/** Source de la visite : domaine du site d'origine (Google, Facebook…), ou rien pour un accès direct. */
function source() {
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    return ref && ref.host !== window.location.host ? ref.host.replace(/^www\./, "") : null;
  } catch {
    return null;
  }
}

/** Compte les pages vues du site public (statistiques du tableau de bord, sans cookie ni IP). */
export function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const id = visitorId();
    if (!id || navigator.webdriver) return;
    const timer = window.setTimeout(() => {
      createClient()
        .rpc("record_page_view", { p_path: pathname, p_visitor: id, p_referrer: source(), p_device: device() })
        .then(() => undefined);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
