/**
 * Coordonnées et liens de l'ONG.
 *
 * Valeurs par défaut utilisées tant que la base n'est pas branchée.
 * En Phase 5, ces données seront lues depuis la table des paramètres
 * (modifiables depuis /admin → Paramètres) avec ce fichier en repli.
 */

export type SocialNetwork = "facebook" | "tiktok" | "instagram" | "youtube" | "linkedin" | "whatsapp";

export const siteConfig = {
  name: "KTGW Togo",
  fullName: "KommTogoGehWeiter Togo",
  foundedYear: 2008,

  togo: {
    address: {
      street: "Rue Okeloukoutou, non loin du CHU Sylvanus Olympio",
      district: "Tokoin Cébévito",
      city: "Lomé",
      country: "Togo",
    },
    phones: [
      { display: "+228 79 95 20 20", e164: "+22879952020", whatsapp: true },
      { display: "+228 70 88 13 06", e164: "+22870881306", whatsapp: true },
    ],
    // ⚠️ À confirmer : adresse provisoire tant que le domaine n'est pas configuré
    email: "contact@ktgw-togo.org",
    mapsUrl: "https://maps.app.goo.gl/UQVigCoGSvx4Xuxg7",
    // Intégration sans clé API ; à remplacer par les coordonnées exactes du siège si besoin
    mapsEmbedUrl:
      "https://www.google.com/maps?q=CHU+Sylvanus+Olympio,+Tokoin,+Lom%C3%A9,+Togo&z=15&output=embed",
  },

  germany: {
    name: "kommTOGOgehweiter e.V.",
    city: "Köln / Cologne",
    phone: { display: "+49 2234 389 9322", e164: "+4922343899322" },
    email: "info@kommtogogehweiter.de",
    website: "https://kommtogogehweiter.de",
  },

  /**
   * Réseaux sociaux, dans l'ordre d'affichage. Laisser une URL vide masque l'icône.
   * ⚠️ À REMPLACER : Facebook, TikTok et YouTube pointent provisoirement vers
   * l'accueil de chaque plateforme, en attendant les adresses des pages officielles.
   */
  socials: {
    facebook: "https://www.facebook.com/",
    tiktok: "https://www.tiktok.com/",
    instagram: "https://www.instagram.com/kommtogogehweiter/",
    youtube: "https://www.youtube.com/",
    linkedin: "",
    whatsapp: "https://wa.me/22879952020",
  } satisfies Record<SocialNetwork, string>,
} as const;

/** Lien WhatsApp à partir d'un numéro E.164 (« +228… » → « wa.me/228… »). */
export const whatsappUrl = (e164: string) => `https://wa.me/${e164.replace(/\D/g, "")}`;
