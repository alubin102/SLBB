# Sully Les Bordes Badminton — site web

Site statique du club, construit avec [Astro](https://astro.build) et Tailwind CSS.

## Commandes

```sh
npm install
npm run dev                 # serveur local sur http://localhost:4321
npm run build               # génère le site dans dist/
npm run import:interclubs   # met à jour classements et résultats depuis ICBaD
npm run import:site         # réimporte le contenu de l'ancien site Sportsregions
```

## Où modifier quoi

| Contenu | Fichier |
|---|---|
| Coordonnées, menu, gymnases, créneaux, tarifs | `src/data/site.ts` |
| Pages (présentation, statuts, école de bad…) | `src/content/pages/<rubrique>/<page>.md` |
| Actualités | `src/content/actualites/<slug>.md` |
| Agenda | `src/content/evenements/<date>-<slug>.md` |
| Partenaires, bureau, boutique, albums, vidéos | `src/data/*.json` |
| Images et documents | `public/media/` |
| Couleurs et typographie | `src/styles/global.css` |

Pour publier une actualité, créer un fichier Markdown avec l'en-tête :

```md
---
title: "Titre"
date: "2026-10-08"
image: "/media/actualite/photo.jpg"
---

Texte de l'article.
```

## Interclubs

`npm run import:interclubs` lit la page du club sur ICBaD
(<https://icbad.ffbad.org/instance/SLB45>) et écrit `src/data/interclubs.json` :
classement de chaque poule, calendrier, résultats et effectif. À relancer après
chaque journée, puis reconstruire le site.

## Import de l'ancien site

`npm run import:site` écrase `src/content/` et les fichiers JSON générés
(`albums`, `videos`, `partenaires`, `bureau`, `boutique`). Les corrections faites
à la main dans ces fichiers sont donc perdues si on le relance : ne s'en servir
que tant que l'ancien site reste la référence.
