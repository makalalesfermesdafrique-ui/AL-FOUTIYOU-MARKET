export type Field = { k: string; l: string; t: 'text' | 'number' | 'select' | 'multi' | 'area'; o?: string[]; pub?: boolean; hint?: string }
const OUI = ['Oui', 'Non', 'Je ne sais pas']
const EAU = ['Eau et électricité', 'Eau seulement', 'Électricité seulement', 'Aucun des deux', 'Je ne sais pas']
export const FIELDS: Record<string, Field[]> = {
  terrains: [
    { k: 'surface', l: 'Superficie', t: 'number', pub: true },
    { k: 'unite', l: 'Unité', t: 'select', o: ['m²', 'hectares'], pub: true },
    { k: 'statut_foncier', l: 'Statut foncier', t: 'select', o: ['Titre foncier', 'Bail', 'Délibération', 'Affectation', "Permis d'occuper", 'Autre / en cours'], pub: true },
    { k: 'documents', l: 'Documents administratifs disponibles', t: 'multi', o: ['Titre foncier', 'Bail', 'Délibération', 'Plan de bornage / cadastral', 'Certificat de non-litige', 'Quitus fiscal', "Attestation d'affectation", 'Acte de vente précédent', 'Autre'], pub: true },
    { k: 'titulaire', l: 'Nom figurant sur le titre ou la délibération', t: 'text' },
    { k: 'numero_titre', l: 'Numéro du titre ou de la parcelle', t: 'text' },
    { k: 'hypotheque', l: 'Le terrain est-il hypothéqué ou grevé ?', t: 'select', o: OUI, pub: true },
    { k: 'litige', l: 'Existe-t-il un litige ou une contestation ?', t: 'select', o: OUI, pub: true },
    { k: 'bornage', l: 'Terrain borné', t: 'select', o: OUI, pub: true },
    { k: 'viabilise', l: 'Viabilisé', t: 'select', o: OUI, pub: true },
    { k: 'eau_electricite', l: 'Eau et électricité à proximité', t: 'select', o: EAU, pub: true },
    { k: 'acces', l: 'Accès (route goudronnée, piste…)', t: 'text', pub: true },
    { k: 'localisation', l: 'Localisation précise (quartier, repère)', t: 'text', pub: true },
  ],
  immobilier: [
    { k: 'type_bien', l: 'Type de bien', t: 'select', o: ['Villa', 'Maison', 'Appartement', 'Immeuble', 'Local commercial', 'Autre'], pub: true },
    { k: 'surface_terrain', l: 'Superficie du terrain (m²)', t: 'number', pub: true },
    { k: 'surface_habitable', l: 'Surface habitable (m²)', t: 'number', pub: true },
    { k: 'chambres', l: 'Chambres', t: 'number', pub: true },
    { k: 'salles_bain', l: 'Salles de bain', t: 'number', pub: true },
    { k: 'etat', l: 'État du bien', t: 'select', o: ['Neuf', 'Très bon', 'Bon', 'À rénover'], pub: true },
    { k: 'eau_electricite', l: 'Eau et électricité', t: 'select', o: EAU, pub: true },
    { k: 'statut_foncier', l: 'Statut foncier', t: 'select', o: ['Titre foncier', 'Bail', 'Délibération', 'Autre / en cours'], pub: true },
    { k: 'documents', l: 'Documents administratifs disponibles', t: 'multi', o: ['Titre foncier', 'Bail', 'Délibération', 'Permis de construire', 'Certificat de conformité', "Permis d'habiter", 'Plan de la construction', 'Quitus fiscal', 'Acte de vente précédent', 'Autre'], pub: true },
    { k: 'titulaire', l: 'Nom figurant sur le titre', t: 'text' },
    { k: 'numero_titre', l: 'Numéro du titre', t: 'text' },
    { k: 'hypotheque', l: 'Le bien est-il hypothéqué ou grevé ?', t: 'select', o: OUI, pub: true },
    { k: 'litige', l: 'Existe-t-il un litige ou une contestation ?', t: 'select', o: OUI, pub: true },
    { k: 'occupation', l: "Statut d'occupation", t: 'select', o: ['Libre', 'Occupé par le propriétaire', 'Loué'], pub: true },
  ],
  automobiles: [
    { k: 'marque', l: 'Marque', t: 'text', pub: true }, { k: 'modele', l: 'Modèle', t: 'text', pub: true },
    { k: 'annee', l: 'Année', t: 'number', pub: true }, { k: 'kilometrage', l: 'Kilométrage', t: 'number', pub: true },
    { k: 'carburant', l: 'Carburant', t: 'select', o: ['Essence', 'Diesel', 'Hybride', 'Électrique'], pub: true },
    { k: 'boite', l: 'Boîte de vitesses', t: 'select', o: ['Manuelle', 'Automatique'], pub: true },
    { k: 'couleur', l: 'Couleur', t: 'text', pub: true },
    { k: 'etat', l: 'État général', t: 'select', o: ['Excellent', 'Bon', 'Moyen', 'À réparer'], pub: true },
    { k: 'origine', l: 'Origine', t: 'select', o: ['Achetée neuve au Sénégal', 'Importée et dédouanée', 'Occasion locale'], pub: true },
    { k: 'documents', l: 'Documents administratifs disponibles', t: 'multi', o: ['Carte grise', 'Certificat de non-gage', 'Visite technique à jour', 'Assurance en cours', 'Quitus / dédouanement', "Facture d'achat", 'Autre'], pub: true },
    { k: 'immatriculation', l: "Immatriculation (reste privée)", t: 'text' },
    { k: 'titulaire', l: 'Nom figurant sur la carte grise', t: 'text' },
  ],
  motos: [
    { k: 'marque', l: 'Marque', t: 'text', pub: true }, { k: 'modele', l: 'Modèle', t: 'text', pub: true },
    { k: 'cylindree', l: 'Cylindrée (cm³)', t: 'number', pub: true }, { k: 'annee', l: 'Année', t: 'number', pub: true },
    { k: 'kilometrage', l: 'Kilométrage', t: 'number', pub: true },
    { k: 'etat', l: 'État général', t: 'select', o: ['Excellent', 'Bon', 'Moyen', 'À réparer'], pub: true },
    { k: 'documents', l: 'Documents administratifs disponibles', t: 'multi', o: ['Carte grise', 'Certificat de non-gage', 'Quitus / dédouanement', "Facture d'achat", 'Assurance en cours', 'Autre'], pub: true },
    { k: 'immatriculation', l: 'Immatriculation (reste privée)', t: 'text' },
    { k: 'titulaire', l: 'Nom figurant sur la carte grise', t: 'text' },
  ],
}
export const COMMON: Field[] = [
  { k: 'disponibilite', l: 'Disponibilité', t: 'select', o: ['Immédiate', 'Sous préavis', 'À discuter'], pub: true },
  { k: 'modalites', l: 'Modalités de paiement souhaitées', t: 'select', o: ['Comptant', 'Échelonné possible', 'À discuter'], pub: true },
  { k: 'raison_vente', l: 'Motif de la vente (facultatif)', t: 'text' },
  { k: 'observations', l: 'Autres informations utiles pour l’acheteur', t: 'area', pub: true },
]
export const fieldsFor = (slug: string) => [...(FIELDS[slug] ?? FIELDS.automobiles.slice(0, 0)), ...COMMON]
export const allLabel = (k: string) => { for (const s of Object.keys(FIELDS)) { const f = FIELDS[s].find((x) => x.k === k); if (f) return f.l } return COMMON.find((x) => x.k === k)?.l ?? k.replace(/_/g, ' ') }
export const val = (x: unknown) => (Array.isArray(x) ? x.join(', ') : String(x ?? ''))
export const pubDetails = (slug: string, d: Record<string, any>) => {
  const o: Record<string, any> = {}
  for (const f of fieldsFor(slug)) { const x = d[f.k]; if (f.pub && x !== undefined && x !== '' && !(Array.isArray(x) && !x.length)) o[f.k] = x }
  return o
}
