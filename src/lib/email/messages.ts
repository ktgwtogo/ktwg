import "server-only";
import type { FormContext, FormKind } from "@/lib/forms/definitions";
import { safeName, siteUrl, type EmailContent, type EmailRow } from "./template";

/**
 * Textes des e-mails envoyés aux personnes (accusés de réception, décisions, reçus, cartes…).
 * Seules des valeurs courtes et contrôlées sont reprises : jamais le texte libre d'un message,
 * pour que le site ne puisse pas servir à relayer du contenu indésirable.
 */

type Values = Record<string, unknown>;
type Mail = { subject: string; content: EmailContent };

const short = (v: unknown, max = 80) => {
  const s = String(v ?? "").trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};
const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
const today = () => new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Lome" }).format(new Date());
const dateFr = (iso: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Africa/Lome" }).format(new Date(iso));
const dateTimeFr = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Lome" }).format(new Date(iso));
/** Référence courte d'une demande, à rappeler dans les échanges. */
export const reference = (id: string) => `KTGW-${id.slice(0, 8).toUpperCase()}`;

const processing = "Votre demande sera traitée par notre équipe dans les meilleurs délais, et une réponse vous parviendra par e-mail ou par téléphone.";

/** Accusé de réception d'un formulaire du site, adapté à la démarche. */
export function submissionAck(kind: FormKind, v: Values, ctx: FormContext & { eventDate?: string; eventVenue?: string }, id: string): Mail {
  const greeting = safeName(v.name as string) ? `Bonjour ${safeName(v.name as string)},` : "Bonjour,";
  const base: EmailRow[] = [
    ["Référence", reference(id)],
    ["Reçue le", today()],
  ];

  switch (kind) {
    case "contact":
      return {
        subject: "Nous avons bien reçu votre message — KTGW Togo",
        content: {
          title: "Votre message a bien été reçu",
          greeting,
          paragraphs: ["Merci d'avoir écrit à KTGW Togo. Votre message a bien été enregistré.", processing],
          rows: [["Objet", short(v.subject)], ...base],
          closing: ["Pour toute précision, répondez simplement à cet e-mail en rappelant la référence ci-dessus."],
        },
      };
    case "partnership":
      return {
        subject: "Votre proposition de partenariat — KTGW Togo",
        content: {
          title: "Proposition de partenariat reçue",
          greeting,
          paragraphs: [
            "Nous vous remercions de l'intérêt que vous portez aux actions de KTGW Togo. Votre proposition de partenariat a bien été reçue.",
            "Elle sera étudiée par notre équipe, qui reviendra vers vous pour échanger sur les modalités d'une collaboration.",
          ],
          rows: [["Organisation", short(v.organization, 60)], ["Type de partenaire", short(v.partnerType)], ["Budget indicatif", short(v.budget)], ...base],
        },
      };
    case "event":
      return {
        subject: `${ctx.full ? "Liste d'attente" : "Inscription confirmée"} : ${short(ctx.eventTitle, 70)}`,
        content: {
          title: ctx.full ? "Vous êtes sur la liste d'attente" : "Votre inscription est enregistrée",
          greeting,
          paragraphs: [
            ctx.full
              ? "L'événement est complet pour le moment : vous êtes inscrit·e sur la liste d'attente et serez prévenu·e si une place se libère."
              : "Nous avons le plaisir de confirmer votre inscription. Nous vous remercions de votre participation !",
            "Si vous ne pouvez finalement pas venir, merci de nous prévenir en répondant à cet e-mail.",
          ],
          rows: [
            ["Événement", short(ctx.eventTitle)],
            ...(ctx.eventDate ? ([["Date", dateTimeFr(ctx.eventDate)]] as EmailRow[]) : []),
            ...(ctx.eventVenue ? ([["Lieu", short(ctx.eventVenue)]] as EmailRow[]) : []),
            ["Nombre de places", String(v.seats ?? 1)],
            ...base,
          ],
        },
      };
    case "engagement":
      return {
        subject: `Votre demande (${short(v.type)}) — KTGW Togo`,
        content: {
          title: v.type === "Adhésion" ? "Demande d'adhésion reçue" : "Merci pour votre engagement bénévole",
          greeting,
          paragraphs: [
            `Votre demande de ${String(v.type).toLowerCase()} a bien été reçue. Merci de vouloir rejoindre l'action de KTGW Togo !`,
            processing,
          ],
          rows: [["Démarche", short(v.type)], ...base],
        },
      };
    case "training":
      return {
        subject: "Votre candidature à une formation — KTGW Togo",
        content: {
          title: "Candidature reçue",
          greeting,
          paragraphs: [
            "Votre candidature à une formation professionnelle au centre CEFOPEXD a bien été reçue.",
            "Notre équipe l'étudie et vous contactera par téléphone pour la suite (entretien, inscription, internat).",
          ],
          rows: [["Filière souhaitée", short(v.track)], ["Niveau scolaire", short(v.level)], ["Besoin de l'internat", v.boarding ? "Oui" : "Non"], ...base],
        },
      };
    case "donation":
      return {
        subject: "Merci pour votre don — KTGW Togo",
        content: {
          title: "Merci pour votre générosité !",
          greeting,
          paragraphs: [
            "Votre déclaration de don a bien été enregistrée. Chaque contribution aide un·e jeune à apprendre un métier et à construire son avenir.",
            "Dès que notre trésorerie aura confirmé la réception du paiement, vous recevrez votre reçu officiel par e-mail.",
          ],
          highlight: { label: "Montant déclaré", value: fcfa(Number(v.amount)) },
          rows: [["Moyen de paiement", short(v.method)], ["Fréquence", short(v.frequency)], ...(v.project ? ([["Projet soutenu", short(v.project, 60)]] as EmailRow[]) : []), ...base],
        },
      };
    default:
      return {
        subject: "Nous avons bien reçu votre demande — KTGW Togo",
        content: { title: "Demande reçue", greeting, paragraphs: [processing], rows: base },
      };
  }
}

export function newsletterConfirm(token: string): Mail {
  return {
    subject: "Confirmez votre inscription à la newsletter KTGW Togo",
    content: {
      title: "Plus qu'un clic !",
      greeting: "Bonjour,",
      paragraphs: ["Merci de votre intérêt pour KTGW Togo. Pour recevoir nos nouvelles (projets, événements, appels à soutien), confirmez votre inscription :"],
      cta: { label: "Confirmer mon inscription", href: `${siteUrl()}/api/newsletter?action=confirm&token=${token}` },
      note: "Vous n'êtes pas à l'origine de cette demande ? Ignorez simplement cet e-mail : vous ne serez pas inscrit·e.",
    },
  };
}

export function membershipAck(firstName: string | null, typeLabel: string, id: string): Mail {
  return {
    subject: "Votre demande d'adhésion — KTGW Togo",
    content: {
      title: "Demande d'adhésion reçue",
      greeting: safeName(firstName) ? `Bonjour ${safeName(firstName)},` : "Bonjour,",
      paragraphs: [
        "Nous avons bien reçu votre demande d'adhésion à KTGW Togo. Merci de vouloir rejoindre notre association !",
        "Elle sera examinée par le bureau. Vous serez informé·e de la décision par e-mail et dans votre espace membre.",
      ],
      rows: [
        ["Adhésion demandée", typeLabel],
        ["Référence", reference(id)],
        ["Reçue le", today()],
      ],
      cta: { label: "Suivre ma demande", href: `${siteUrl()}/mon-espace/adhesion` },
    },
  };
}

export function membershipDecision(firstName: string | null, approve: boolean): Mail {
  return {
    subject: approve ? "Bienvenue dans l'association — KTGW Togo" : "Votre demande d'adhésion — KTGW Togo",
    content: {
      title: approve ? "Votre adhésion est validée !" : "Réponse à votre demande d'adhésion",
      greeting: safeName(firstName) ? `Bonjour ${safeName(firstName)},` : "Bonjour,",
      paragraphs: approve
        ? [
            "Bonne nouvelle : le bureau de KTGW Togo a validé votre adhésion. Bienvenue dans l'association !",
            "Votre carte de membre vous sera adressée prochainement. Vous avez dès à présent accès aux documents réservés aux membres.",
          ]
        : ["Le bureau a examiné votre demande d'adhésion. Vous trouverez le détail de sa réponse dans votre espace membre."],
      cta: { label: "Ouvrir mon espace", href: `${siteUrl()}/mon-espace` },
    },
  };
}

export type ReceiptData = {
  receipt_number: string;
  name: string;
  amount_fcfa: number;
  kind: string;
  method: string;
  frequency: string;
  reference: string | null;
  project: string | null;
  received_at: string | null;
  created_at: string;
};

/** Reçu officiel envoyé automatiquement quand la trésorerie confirme un paiement. */
export function receiptMail(d: ReceiptData): Mail {
  const nature = d.kind === "cotisation" ? "Cotisation (adhésion)" : `Don ${d.frequency.toLowerCase()}`;
  return {
    subject: `Votre reçu ${d.receipt_number} — KTGW Togo`,
    content: {
      title: `Reçu officiel n° ${d.receipt_number}`,
      greeting: safeName(d.name) ? `Bonjour ${safeName(d.name)},` : "Bonjour,",
      paragraphs: [
        `KTGW Togo certifie avoir reçu de ${short(d.name, 60)} la somme indiquée ci-dessous, au titre de : ${nature.toLowerCase()}.`,
        "Nous vous remercions chaleureusement pour votre soutien à l'éducation et à la formation professionnelle des jeunes au Togo.",
      ],
      highlight: { label: "Montant reçu", value: fcfa(d.amount_fcfa) },
      rows: [
        ["N° de reçu", d.receipt_number],
        ["Date de réception", dateFr(d.received_at ?? d.created_at)],
        ["Nature", nature],
        ["Moyen de paiement", d.method],
        ...(d.reference ? ([["Référence de transaction", short(d.reference, 60)]] as EmailRow[]) : []),
        ...(d.project ? ([["Affectation", short(d.project, 60)]] as EmailRow[]) : []),
        ["Émis par", "KTGW Togo — la trésorerie"],
      ],
      note: "Ce reçu est émis électroniquement par KTGW Togo. Conservez cet e-mail comme justificatif de votre paiement.",
    },
  };
}

/** Envoi de la carte de membre. */
export function cardMail(d: { firstName: string | null; cardNumber: string; typeLabel: string; expiresAt: string; viewUrl: string; verifyUrl: string }): Mail {
  return {
    subject: `Votre carte de membre ${d.cardNumber} — KTGW Togo`,
    content: {
      title: "Votre carte de membre KTGW Togo",
      greeting: safeName(d.firstName) ? `Bonjour ${safeName(d.firstName)},` : "Bonjour,",
      paragraphs: [
        "Votre carte de membre est prête. Vous pouvez l'afficher, l'imprimer ou l'enregistrer en PDF depuis votre espace membre.",
        "Elle comporte un QR code : toute personne qui le scanne peut vérifier sa validité auprès de KTGW Togo.",
      ],
      rows: [
        ["N° de carte", d.cardNumber],
        ["Qualité", d.typeLabel],
        ["Valable jusqu'au", dateFr(d.expiresAt)],
      ],
      cta: { label: "Voir et télécharger ma carte", href: d.viewUrl },
      note: `Vérification de la carte : ${d.verifyUrl}`,
    },
  };
}

export function staffAccountMail(name: string, position: string, email: string, password: string): Mail {
  return {
    subject: "Votre accès à l'administration — KTGW Togo",
    content: {
      title: "Votre compte du bureau est prêt",
      greeting: safeName(name) ? `Bonjour ${safeName(name)},` : "Bonjour,",
      paragraphs: [`La présidence de KTGW Togo vous a créé un accès au tableau de gestion en tant que ${position}.`],
      rows: [
        ["Adresse de connexion", `${siteUrl().replace(/^https?:\/\//, "")}/connexion`],
        ["E-mail", email],
        ["Mot de passe provisoire", password],
      ],
      cta: { label: "Me connecter", href: `${siteUrl()}/connexion` },
      closing: ["À votre première connexion, vous devrez choisir votre propre mot de passe. Ne transmettez jamais ce mot de passe."],
    },
  };
}

export function passwordResetMail(name: string | null, password: string): Mail {
  return {
    subject: "Nouveau mot de passe provisoire — KTGW Togo",
    content: {
      title: "Votre mot de passe a été réinitialisé",
      greeting: safeName(name) ? `Bonjour ${safeName(name)},` : "Bonjour,",
      paragraphs: ["La présidence a réinitialisé votre mot de passe. Utilisez le mot de passe provisoire ci-dessous : vous devrez en choisir un nouveau à la connexion."],
      highlight: { label: "Mot de passe provisoire", value: password },
      cta: { label: "Me connecter", href: `${siteUrl()}/connexion` },
    },
  };
}
