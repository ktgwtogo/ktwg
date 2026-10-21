/**
 * Modes d'emploi du tableau de bord : pour chaque rubrique, comment faire la tâche
 * et comment elle est validée. Affichés en tête de chaque page et dans « Mode d'emploi ».
 */
export type Guide = {
  href: string;
  title: string;
  summary: string;
  steps: string[];
};

export const guides: Guide[] = [
  {
    href: "/admin",
    title: "Vue d'ensemble",
    summary: "Votre point de départ : chiffres clés de votre poste, accès rapides et tâches en attente.",
    steps: [
      "Consultez les chiffres en tête de page ; un chiffre cliquable mène directement à la liste à traiter.",
      "Utilisez la colonne « Accès rapide » pour aller à vos rubriques, à votre espace personnel ou vous déconnecter.",
      "Ouvrez « Mode d'emploi » pour revoir la marche à suivre de chaque tâche.",
    ],
  },
  {
    href: "/admin/validations",
    title: "Validations / Mes demandes",
    summary: "Toute action d'un membre du bureau est soumise à la présidence avant d'être exécutée.",
    steps: [
      "Membre du bureau : chaque action que vous faites (publication, carte, reçu, envoi…) arrive ici avec l'état « En attente ».",
      "Présidence : ouvrez chaque demande, lisez le détail, puis cliquez « Valider » (l'action s'exécute) ou « Refuser » avec un motif.",
      "Le membre du bureau voit la décision et le motif dans « Mes demandes ».",
    ],
  },
  {
    href: "/admin/rapports",
    title: "Rapports d'activité",
    summary: "Rédiger et consulter les rapports (réunions, activités, bilans).",
    steps: [
      "Rédigez le rapport (activité, financier, projet, réunion…) : il reste en brouillon tant que vous le modifiez.",
      "Soumettez-le : il passe « En attente de validation » auprès de la présidence.",
      "La présidence le valide (« Validé et diffusé ») ou le renvoie « à corriger » avec un motif.",
    ],
  },
  {
    href: "/admin/statistiques",
    title: "Statistiques de visite",
    summary: "Fréquentation du site : visiteurs, pages vues, pages les plus consultées.",
    steps: [
      "Consultez les visiteurs, pages vues et membres connectés, puis le graphique jour par jour.",
      "Repérez les pages les plus consultées et la provenance des visites pour orienter vos publications.",
    ],
  },
  {
    href: "/admin/archives",
    title: "Archives",
    summary: "Retrouver les éléments traités : rapports, envois, demandes, documents.",
    steps: [
      "Utilisez « Rechercher dans les archives » ou choisissez une catégorie (documents, rapports, photos, membres et cartes, dons et reçus).",
      "Ouvrez un élément pour le consulter ou le télécharger.",
    ],
  },
  {
    href: "/admin/publications",
    title: "Publications / articles",
    summary: "Écrire un article avec images, vidéo et liens, choisir où il paraît et le partager.",
    steps: [
      "Rédigez la publication : titre, texte, image de couverture, vidéo ou liens si besoin.",
      "Choisissez les emplacements : page d'accueil, Actualités ou une page personnalisée.",
      "Enregistrez : la publication est soumise à la présidence et n'apparaît sur le site qu'après validation.",
      "Une fois en ligne, utilisez les boutons de partage (WhatsApp, Facebook, e-mail…).",
    ],
  },
  {
    href: "/admin/contenus/annonces",
    title: "Annonces",
    summary: "Messages courts affichés sur le site (bandeau, informations pratiques).",
    steps: ["Créez l'annonce, fixez ses dates d'affichage.", "Enregistrez : elle est soumise à la présidence avant parution."],
  },
  {
    href: "/admin/contenus",
    title: "Contenus du site",
    summary: "Projets, événements, formations, équipe, partenaires, galerie…",
    steps: [
      "Choisissez le type de contenu, puis « Ajouter » ou ouvrez un élément existant.",
      "Remplissez les champs, ajoutez les images, vérifiez l'aperçu.",
      "Enregistrez : la modification est soumise à la présidence et publiée après validation.",
    ],
  },
  {
    href: "/admin/site",
    title: "Apparence et textes",
    summary: "Menus, textes des pages, coordonnées, pages personnalisées.",
    steps: [
      "Modifiez le texte ou la coordonnée voulue ; l'aperçu montre le rendu.",
      "Enregistrez : le changement est soumis à la présidence. Le site se met à jour après validation (quelques minutes).",
    ],
  },
  {
    href: "/admin/communication",
    title: "E-mails et newsletter",
    summary: "Envois groupés aux membres, aux abonné·es ou à une liste choisie.",
    steps: [
      "Dans « Nouvel envoi », choisissez les destinataires, rédigez l'objet et le message (modèle KTGW automatique).",
      "Cliquez « Envoyer » : l'envoi est soumis à la présidence et part après validation.",
    ],
  },
  {
    href: "/admin/membres",
    title: "Fichier des membres",
    summary: "Liste des membres et dossier de chacun (pièces, cartes, dons, documents reçus).",
    steps: [
      "Recherchez un membre par nom, e-mail ou numéro, puis ouvrez son dossier.",
      "Dans le dossier : consultez et téléchargez ses pièces, ajoutez-en (soumis à la présidence).",
      "Exportez la liste en Excel si besoin.",
    ],
  },
  {
    href: "/admin/cartes",
    title: "Cartes de membre",
    summary: "Carte 9 × 5,5 cm, photo, QR code, valable 5 ans. Jamais envoyée automatiquement.",
    steps: [
      "1. Créer : dans « Membres validés sans carte », cliquez « Créer la carte » (soumis à la présidence).",
      "2. Contrôler : ouvrez la carte (« Contrôler »), vérifiez nom, photo, dates ; testez le QR code ; corrigez si besoin.",
      "3. Transmettre : choisissez « par e-mail + espace membre » ou « espace membre seulement » (soumis à la présidence).",
      "4. Accord du membre : il vérifie sa carte et confirme, ou demande une correction (vous êtes prévenu·e par e-mail).",
      "5. Une fois l'accord donné, le membre peut télécharger sa carte (format 9 × 5,5 cm ou planche A4).",
    ],
  },
  {
    href: "/admin/adhesions",
    title: "Adhésions",
    summary: "Demandes d'adhésion déposées par les membres.",
    steps: [
      "Ouvrez la demande, vérifiez le profil et les pièces.",
      "Cliquez « Valider » ou « Refuser » avec un message : la décision est soumise à la présidence.",
      "Après validation, le membre est prévenu par e-mail ; pensez ensuite à lui créer sa carte.",
    ],
  },
  {
    href: "/admin/documents",
    title: "Documents et envois",
    summary: "Statuts, règlement, convocations, annonces : dans l'espace des membres et par e-mail.",
    steps: [
      "Choisissez la catégorie et les destinataires (tous les membres, un groupe, une personne).",
      "Joignez le fichier ou rédigez le message, cochez l'envoi par e-mail si souhaité.",
      "Enregistrez : l'envoi est soumis à la présidence avant d'être déposé et envoyé.",
    ],
  },
  {
    href: "/admin/demandes",
    title: "Demandes reçues",
    summary: "Messages de contact, partenariats, bénévolat, inscriptions, candidatures.",
    steps: [
      "Ouvrez la demande, lisez-la et répondez à la personne (e-mail ou téléphone).",
      "Changez son état (« En cours », « Traité ») et ajoutez une note interne.",
    ],
  },
  {
    href: "/admin/dons",
    title: "Dons et cotisations",
    summary: "Vérifier les dons déclarés, enregistrer les paiements, éditer et envoyer les reçus (A4).",
    steps: [
      "« À vérifier » : contrôlez le paiement reçu, puis « Confirmer » : le reçu est généré (soumis à la présidence).",
      "Paiement reçu en main propre ou don en nature : utilisez le formulaire « Enregistrer un paiement ».",
      "« Reçus générés » : « Voir le reçu » pour le relire, « PDF A4 » pour le télécharger.",
      "Sur la page du reçu, cliquez « Envoyer au donateur » : e-mail et espace membre (soumis à la présidence).",
    ],
  },
  {
    href: "/admin/equipe",
    title: "Équipe et postes",
    summary: "Présidence : attribuer les postes du bureau et leurs droits.",
    steps: [
      "Créez le compte d'un membre du bureau (« Créer le compte ») et transmettez-lui le mot de passe provisoire.",
      "Attribuez-lui un poste : il ou elle ne voit alors que les rubriques de ce poste.",
      "« Suspendre » retire l'accès quand la personne quitte le bureau ; « Réactiver » le rétablit.",
    ],
  },
  {
    href: "/admin/journal",
    title: "Journal d'activité",
    summary: "Présidence : qui a fait quoi et quand, sur tout le tableau de bord.",
    steps: ["Chaque ligne indique la date, la personne, l'action et son détail.", "Les actions validées par la présidence y figurent aussi."],
  },
];

/** Mode d'emploi de la page affichée (préfixe le plus long). */
export function guideFor(pathname: string, available: Guide[]) {
  return available
    .filter((g) => (g.href === "/admin" ? pathname === "/admin" : pathname === g.href || pathname.startsWith(`${g.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
