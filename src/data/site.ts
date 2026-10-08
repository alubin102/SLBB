// Informations du club éditées à la main. Le reste de src/data/*.json et de
// src/content/ est généré par les scripts d'import (voir README).

export const club = {
  nom: 'Sully Les Bordes Badminton',
  sigle: 'SLBB',
  description:
    'Club de badminton de Sully-sur-Loire et des Bordes (Loiret). École Française de Badminton 3 étoiles, loisirs et compétition jusqu’en Nationale 3.',
  email: 'slbb.45contact@gmail.com',
  telephone: '06 19 40 90 32',
  siege: '40 avenue des Roses, 45500 Poilly-lez-Gien',
  saison: '2026-2027',
  licencies: { total: 199, jeunes: 98, saison: '2025-2026' },
}

export const reseaux = [
  { nom: 'Facebook', url: 'https://www.facebook.com/profile.php?id=100083950892947', icon: 'facebook' },
  { nom: 'Instagram', url: 'https://www.instagram.com/sully_les_bordes_badminton/', icon: 'instagram' },
  { nom: 'YouTube', url: 'https://www.youtube.com/@SullylesBordesBadminton', icon: 'youtube' },
] as const

export const liensFederaux = [
  { nom: 'FFBaD', url: 'https://www.ffbad.org/' },
  { nom: 'Ligue Centre-Val de Loire', url: 'https://badmintoncvl.fr/' },
  { nom: 'Comité du Loiret', url: 'https://www.badminton-loiret.fr/' },
  { nom: 'BadNet', url: 'https://www.badnet.org/badnet/Src/' },
  { nom: 'MyFFBaD', url: 'https://www.myffbad.fr/connexion' },
]

export const navigation = [
  {
    label: 'Le club',
    href: '/le-club',
    items: [
      { label: 'Présentation', href: '/le-club/presentation' },
      { label: 'Nos valeurs', href: '/le-club/nos-valeurs' },
      { label: 'Bureau et entraîneurs', href: '/le-club/bureau' },
      { label: 'Dirigeants et organigramme', href: '/le-club/dirigeants' },
      { label: 'Club House Eddy Baetens', href: '/le-club/club-house' },
      { label: 'Poulpy la mascotte', href: '/le-club/poulpy-la-mascotte' },
      { label: 'La Popote du SLBB', href: '/le-club/la-popote' },
      { label: 'Statuts, règlement, charte', href: '/le-club/statuts' },
      { label: 'Documents et comptes rendus', href: '/le-club/documents' },
    ],
  },
  {
    label: 'Infos pratiques',
    href: '/infos-pratiques',
    items: [
      { label: 'Horaires et créneaux', href: '/infos-pratiques/horaires' },
      { label: 'Gymnases et accès', href: '/infos-pratiques/gymnases' },
      { label: 'Réservations', href: '/infos-pratiques/reservations' },
      { label: 'Minibus', href: '/infos-pratiques/minibus' },
    ],
  },
  {
    label: 'Jeunes',
    href: '/jeunes',
    items: [
      { label: 'École de badminton', href: '/jeunes/ecole-de-badminton' },
      { label: 'Aurore Touzé', href: '/jeunes/aurore-touze' },
    ],
  },
  {
    label: 'Compétition',
    href: '/competition',
    items: [
      { label: 'Équipes interclubs', href: '/competition' },
      { label: 'Tournois du club', href: '/competition/tournois' },
    ],
  },
  {
    label: 'Actualités',
    href: '/actualites',
    items: [
      { label: 'Les news', href: '/actualites' },
      { label: 'Agenda', href: '/agenda' },
      { label: 'Photos', href: '/actualites/photos' },
      { label: 'Vidéos', href: '/actualites/videos' },
      { label: 'Revue de presse', href: '/actualites/revue-de-presse' },
      { label: 'La Nuit du Bad', href: '/actualites/la-nuit-du-bad' },
    ],
  },
  {
    label: 'Partenaires',
    href: '/partenaires',
    items: [
      { label: 'Nos partenaires', href: '/partenaires' },
      { label: 'Devenir partenaire', href: '/partenaires/devenir-partenaire' },
      { label: 'Boutique', href: '/partenaires/boutique' },
    ],
  },
]

export const sections: Record<string, string> = Object.fromEntries(
  navigation.map((n) => [n.href.slice(1), n.label]).concat([['inscription', 'Inscription']]),
)

export const gymnases = [
  {
    id: 'torlet',
    court: 'Les Bordes Torlet',
    nom: 'Gymnase Élisabeth Torlet',
    adresse: 'Rue du Château d’Eau',
    ville: '45460 Les Bordes',
    terrains: 7,
    note: 'Lieu principal du club, avec le Club House Eddy Baetens.',
    maps: 'https://www.google.com/maps/search/?api=1&query=Gymnase+Elisabeth+Torlet+rue+du+Ch%C3%A2teau+d%27Eau+45460+Les+Bordes',
  },
  {
    id: 'jourdain',
    court: 'Sully Jourdain',
    nom: 'Gymnase Lionel Jourdain',
    adresse: 'Stade Lionel Jourdain, 7 route de Gien',
    ville: '45600 Sully-sur-Loire',
    terrains: 9,
    note: '',
    maps: 'https://www.google.com/maps/search/?api=1&query=Stade+Lionel+Jourdain+7+route+de+Gien+45600+Sully-sur-Loire',
  },
  {
    id: 'hameau',
    court: 'Sully Hameau',
    nom: 'Gymnase du Hameau',
    adresse: '46 route d’Orléans',
    ville: '45600 Sully-sur-Loire',
    terrains: null,
    note: 'Utilisé occasionnellement.',
    maps: 'https://www.google.com/maps/search/?api=1&query=Gymnase+du+Hameau+46+route+d%27Orl%C3%A9ans+45600+Sully-sur-Loire',
  },
]

export type Public = 'Jeunes' | 'Adultes' | 'Tous'
export const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Créneaux de la saison (page « Horaires » publiée le 3 septembre 2026)
export const creneaux: { jour: string; debut: string; fin: string; activite: string; gymnase: 'torlet' | 'jourdain'; public: Public; precision?: string }[] = [
  { jour: 'Lundi', debut: '17h00', fin: '18h00', activite: 'Minibads et Poussins', precision: '2016 et plus', gymnase: 'jourdain', public: 'Jeunes' },
  { jour: 'Lundi', debut: '18h00', fin: '19h30', activite: 'Benjamins à Juniors', precision: '2008 à 2015', gymnase: 'jourdain', public: 'Jeunes' },
  { jour: 'Mardi', debut: '16h30', fin: '18h00', activite: 'Minibads et Poussins', precision: '2016 et plus', gymnase: 'jourdain', public: 'Jeunes' },
  { jour: 'Mercredi', debut: '14h00', fin: '15h30', activite: 'Benjamins à Juniors', precision: '2008 à 2015', gymnase: 'jourdain', public: 'Jeunes' },
  { jour: 'Mercredi', debut: '17h00', fin: '18h30', activite: 'Minibads et Poussins', precision: '2016 et plus', gymnase: 'torlet', public: 'Jeunes' },
  { jour: 'Mercredi', debut: '18h30', fin: '20h00', activite: 'Benjamins à Juniors', precision: '2008 à 2015', gymnase: 'torlet', public: 'Jeunes' },
  { jour: 'Jeudi', debut: '17h00', fin: '18h00', activite: 'Minibads et Poussins', precision: '2016 et plus', gymnase: 'torlet', public: 'Jeunes' },
  { jour: 'Jeudi', debut: '17h15', fin: '19h00', activite: 'Jeunes autres', gymnase: 'torlet', public: 'Jeunes' },

  { jour: 'Lundi', debut: '19h30', fin: '21h00', activite: 'Entraînement Initiation / Performance / Élite', gymnase: 'jourdain', public: 'Adultes' },
  { jour: 'Lundi', debut: '21h00', fin: '22h30', activite: 'Jeu libre', gymnase: 'jourdain', public: 'Adultes' },
  { jour: 'Lundi', debut: '20h00', fin: '23h30', activite: 'Jeu libre', gymnase: 'torlet', public: 'Adultes' },
  { jour: 'Mardi', debut: '18h00', fin: '19h15', activite: 'Jeunes autres', precision: 'Adultes équipes 1 et 2', gymnase: 'jourdain', public: 'Adultes' },
  { jour: 'Mardi', debut: '20h00', fin: '23h30', activite: 'Jeu libre', gymnase: 'torlet', public: 'Adultes' },
  { jour: 'Mercredi', debut: '19h30', fin: '22h30', activite: 'Jeu libre', gymnase: 'jourdain', public: 'Adultes' },
  { jour: 'Jeudi', debut: '18h00', fin: '19h00', activite: 'Entraînement Initiation', gymnase: 'torlet', public: 'Adultes' },
  { jour: 'Jeudi', debut: '19h00', fin: '20h30', activite: 'Entraînement Initiation', gymnase: 'torlet', public: 'Adultes' },
  { jour: 'Jeudi', debut: '19h00', fin: '20h30', activite: 'Entraînement Élite', precision: 'Adultes N et R', gymnase: 'torlet', public: 'Adultes' },
  { jour: 'Jeudi', debut: '20h30', fin: '23h30', activite: 'Jeu libre', gymnase: 'torlet', public: 'Adultes' },

  { jour: 'Samedi', debut: '10h00', fin: '12h00', activite: 'Jeu libre', gymnase: 'torlet', public: 'Tous' },
]

// Tarifs (page « Tarifs » publiée le 25 août 2025)
export const tarifs = {
  saison: '2025-2026',
  licences: [
    { label: 'Adultes', detail: 'Tarif unique', prix: 170 },
    { label: 'Jeunes', detail: '6 ans et plus', prix: 140 },
    { label: 'Joueurs d’un autre club', detail: 'Si pas de convention entre les deux clubs', prix: 120 },
  ],
  inclus: [
    '2 séances découvertes gratuites',
    'Tournois organisés par le club pris en charge, ainsi que les championnats départemental, de ligue et de France',
    'Tournois jeunes pris en charge par le club à 100 %',
    'Frais d’inscription aux interclubs',
    'Tubes de volants à tarif unique (Forza S5000), en attente d’augmentation du fournisseur',
  ],
  paiement: 'Nous prenons les coupons sport ANCV, le Pass’Sport et le Pass Loisirs.',
}

export const reservations = [
  { nom: 'Gymnase 1', places: 12, regle: 'La réservation se fait sur le créneau de 18h00 à 19h00, uniquement le jeudi.' },
  { nom: 'Gymnase 2', places: 12, regle: 'La réservation se fait sur le créneau de 19h00 à 20h30, uniquement le jeudi.' },
  { nom: 'Club House Eddy Baetens — semaine', places: 50, regle: 'La réservation se fait sur les créneaux des lundis, mardis et jeudis.' },
  { nom: 'Club House Eddy Baetens — week-end', places: null, regle: '' },
]
