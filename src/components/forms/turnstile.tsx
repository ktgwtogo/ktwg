"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
/** Nom du champ caché ajouté par Turnstile dans le <form>. */
export const TURNSTILE_FIELD = "cf-turnstile-response";

let loading: Promise<void> | null = null;
function loadScript() {
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("Turnstile indisponible"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Vérification anti-robot Cloudflare Turnstile, invisible sauf en cas de doute.
 * Le jeton est déposé dans un champ caché du formulaire englobant.
 * Sans NEXT_PUBLIC_TURNSTILE_SITE_KEY, rien n'est affiché.
 */
export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    const el = ref.current;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        id = window.turnstile.render(el, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          "response-field-name": TURNSTILE_FIELD,
          language: document.documentElement.lang || "fr",
        });
        el.dataset.turnstileId = id;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="empty:hidden" />;
}

/** Lit le jeton dans le formulaire puis réarme le widget (un jeton ne sert qu'une fois). */
export function takeTurnstileToken(form: HTMLFormElement | null) {
  if (!form) return undefined;
  const token = new FormData(form).get(TURNSTILE_FIELD);
  const id = form.querySelector<HTMLElement>("[data-turnstile-id]")?.dataset.turnstileId;
  if (id) window.turnstile?.reset(id);
  return typeof token === "string" && token ? token : undefined;
}
