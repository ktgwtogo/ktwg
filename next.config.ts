import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";

/**
 * Politique de sécurité du contenu : seules les origines utilisées par le site sont autorisées.
 * - challenges.cloudflare.com : anti-robot Turnstile
 * - www.google.com : carte intégrée
 * - Supabase : API, connexion et médias ; lh3.googleusercontent.com : photos de profil Google
 * - vercel.live : barre d'outils des déploiements de prévisualisation
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://challenges.cloudflare.com https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabase} https://lh3.googleusercontent.com https://vercel.live https://vercel.com`,
  "font-src 'self' data: https://vercel.live",
  `connect-src 'self' ${supabase} ${supabase.replace("https://", "wss://")} https://challenges.cloudflare.com https://vercel.live wss://ws-us3.pusher.com ${isDev ? "ws:" : ""}`,
  "frame-src https://challenges.cloudflare.com https://www.google.com https://vercel.live https://www.youtube-nocookie.com https://www.facebook.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .join("; ")
  .replace(/\s{2,}/g, " ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Sans includeSubDomains : mail.ktgw.tg (messagerie LWS) n'est pas géré par Vercel.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Médias uploadés via le dashboard (Supabase Storage)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
