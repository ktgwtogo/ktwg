"use client";

import { Check, Link2, Mail } from "lucide-react";
import { useState } from "react";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTelegram, FaTiktok, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";

/**
 * Boutons de partage d'une publication.
 * WhatsApp, Facebook, LinkedIn, X, Telegram et e-mail ouvrent leur fenêtre de partage.
 * Instagram et TikTok n'acceptent pas de lien de partage : le texte et l'adresse sont copiés,
 * puis la page de l'association s'ouvre pour y coller la publication.
 */
export function ShareBar({
  url,
  title,
  text,
  instagram,
  tiktok,
  size = "md",
  className,
}: {
  url: string;
  title: string;
  text?: string;
  instagram?: string;
  tiktok?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const u = encodeURIComponent(url);
  const message = `${title}${text ? `\n\n${text}` : ""}\n\n${url}`;
  const links: { label: string; href: string; icon: IconType; tone: string }[] = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(message)}`, icon: FaWhatsapp, tone: "hover:bg-[#25D366]" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: FaFacebookF, tone: "hover:bg-[#1877F2]" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: FaLinkedinIn, tone: "hover:bg-[#0A66C2]" },
    { label: "X (Twitter)", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${u}`, icon: FaXTwitter, tone: "hover:bg-black" },
    { label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(title)}`, icon: FaTelegram, tone: "hover:bg-[#229ED9]" },
  ];

  const copy = async (key: string, open?: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      /* presse-papiers indisponible */
    }
    if (open) window.open(open, "_blank", "noopener");
  };

  const btn = cn(
    "flex items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:text-white",
    size === "sm" ? "size-9" : "size-10"
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`Partager sur ${l.label}`} title={l.label} className={cn(btn, l.tone)}>
          <l.icon aria-hidden className="size-4" />
        </a>
      ))}
      <button type="button" onClick={() => copy("instagram", instagram)} aria-label="Copier le texte pour Instagram" title="Instagram : texte copié, collez-le dans votre publication" className={cn(btn, "hover:bg-[#E1306C]")}>
        {copied === "instagram" ? <Check aria-hidden className="size-4" /> : <FaInstagram aria-hidden className="size-4" />}
      </button>
      <button type="button" onClick={() => copy("tiktok", tiktok)} aria-label="Copier le texte pour TikTok" title="TikTok : texte copié, collez-le dans votre publication" className={cn(btn, "hover:bg-black")}>
        {copied === "tiktok" ? <Check aria-hidden className="size-4" /> : <FaTiktok aria-hidden className="size-4" />}
      </button>
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`} aria-label="Partager par e-mail" title="E-mail" className={cn(btn, "hover:bg-ktgw-red-strong")}>
        <Mail aria-hidden className="size-4" />
      </a>
      <button type="button" onClick={() => copy("lien")} aria-label="Copier le lien" title="Copier le lien" className={cn(btn, "hover:bg-ktgw-green-strong")}>
        {copied === "lien" ? <Check aria-hidden className="size-4" /> : <Link2 aria-hidden className="size-4" />}
      </button>
      {copied && copied !== "lien" && <span className="text-xs font-semibold text-ktgw-green-strong">Texte copié : collez-le dans votre publication.</span>}
      {copied === "lien" && <span className="text-xs font-semibold text-ktgw-green-strong">Lien copié.</span>}
    </div>
  );
}
