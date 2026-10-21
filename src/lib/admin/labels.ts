/** Libellés lisibles des actions du journal d'activité. */
const auditLabels: Record<string, string> = {
  "adhesion.validee": "a validé une adhésion",
  "adhesion.refusee": "a refusé une adhésion",
  "document.publie": "a publié un document",
  "document.supprime": "a supprimé un document",
  "validation.demandee": "a soumis une demande de validation",
  "validation.approuvee": "a approuvé une demande",
  "validation.refusee": "a refusé une demande",
  "compte.cree": "a créé un compte du bureau",
  "compte.suspendu": "a suspendu un compte",
  "compte.reactive": "a réactivé un compte",
  "compte.mot_de_passe_reinitialise": "a réinitialisé un mot de passe",
  "poste.attribue": "a attribué un poste",
  "poste.enregistre": "a enregistré un poste",
  "poste.supprime": "a supprimé un poste",
  "contenu.cree": "a créé un contenu du site",
  "contenu.modifie": "a modifié un contenu du site",
  "contenu.supprime": "a supprimé un contenu du site",
  "parametre.modifie": "a modifié les paramètres du site",
};

export const auditLabel = (action: string) => auditLabels[action] ?? action;
