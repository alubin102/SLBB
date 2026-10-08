// Récupère les interclubs du club sur ICBaD (site fédéral FFBaD) :
// classements des poules, calendrier/résultats et effectif de chaque équipe.
// Écrit src/data/interclubs.json.
//
// Usage : npm run import:interclubs
// À lancer après chaque journée (ou depuis une tâche planifiée avant le build).

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const CLUB = 'SLB45'
const SIGLE = '45-SLB-'
const ICBAD = 'https://icbad.ffbad.org'
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data/interclubs.json')

const clean = (s) => s.replace(/\s+/g, ' ').trim()
const int = (s) => Number.parseInt(clean(s), 10)

async function load(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (site SLBB)' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return cheerio.load(await res.text())
}

// "Sully Les Bordes Badminton (45-SLB-1)" -> { nom, sigle }
function splitTeam(label) {
  const m = clean(label).match(/^(.*?)\s*\(([^()]+)\)$/)
  return m ? { nom: m[1], sigle: m[2] } : { nom: clean(label), sigle: '' }
}

// La saison commence en septembre : "19/09" -> 2026-09-19, "20/03" -> 2027-03-20
function isoDate(dayMonth, time, seasonStart) {
  const [d, m] = dayMonth.split('/').map(Number)
  const year = m >= 8 ? seasonStart : seasonStart + 1
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${time || '00:00'}`
}

const now = new Date()
const seasonStart = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1

const $ = await load(`${ICBAD}/instance/${CLUB}`)
const equipes = []

// Une poule par tableau de classement ; le titre de la compétition est le <h2> qui précède
for (const table of $('table.classement-poule').toArray()) {
  const titre = clean($(table).prevAll('h2').first().text() || $(table).parent().prevAll('h2').first().text())
  const lienPoule = $(table).parent().prevAll().find('a[href*="/tableau/"]').not('[href$="classementPDF"]').first().attr('href')
    || $(table).prevAll().find('a[href*="/tableau/"]').not('[href$="classementPDF"]').first().attr('href')

  const classement = []
  $(table).find('tr').slice(1).each((_, tr) => {
    const td = $(tr).find('td')
    const a = td.filter('.nom-equipe').find('a')
    if (!a.length) return
    const n = (i) => int(td.eq(i).text())
    classement.push({
      rang: n(0),
      ...splitTeam(a.text()),
      logo: td.eq(1).find('img').attr('src'),
      url: a.attr('href'),
      joues: n(3), gagnes: n(4), nuls: n(5), perdus: n(6), forfaits: n(7),
      bonus: n(8), penalites: n(9), points: n(10), matchsDiff: n(11), setsDiff: n(12), pointsDiff: n(13),
    })
  })

  for (const ligne of classement.filter((l) => l.sigle.startsWith(SIGLE))) {
    const $e = await load(ligne.url)

    const joueurs = []
    $e('h2:contains("Liste des joueurs")').nextAll('table').first().find('tr').slice(1).each((_, tr) => {
      const td = $e(tr).find('td')
      const nom = clean(td.eq(2).find('a').first().text())
      if (!nom) return
      joueurs.push({
        nom,
        sexe: td.eq(0).find('.fa-female').length ? 'F' : 'H',
        classements: td.eq(2).find('.ic-match-clsmt').map((_, c) => clean($e(c).text())).get(),
        rencontres: int(td.eq(3).text()) || 0,
      })
    })

    const rencontres = []
    $e('tr.clickable-row').each((_, tr) => {
      const td = $e(tr).find('td')
      const quand = clean(td.eq(1).text()).match(/(\d{1,2}\/\d{1,2})(?:\s*à\s*(\d{1,2}:\d{2}))?/)
      if (!quand) return
      const domicile = splitTeam(td.eq(3).text())
      const exterieur = splitTeam(td.eq(5).text())
      const score = clean(td.eq(4).text()).match(/(\d+)\s*-\s*(\d+)/)
      const [sd, se] = score ? [Number(score[1]), Number(score[2])] : [0, 0]
      const lieu = clean(td.eq(2).text()).replace(/,\s*$/, '')
      rencontres.push({
        journee: clean(td.eq(0).text()),
        date: isoDate(quand[1], quand[2], seasonStart),
        lieu: /non définie/i.test(lieu) ? undefined : lieu,
        domicile, exterieur,
        aDomicile: domicile.sigle === ligne.sigle,
        // une rencontre non jouée est affichée 0 - 0
        score: sd + se > 0 ? { domicile: sd, exterieur: se } : undefined,
        url: td.eq(1).find('a').attr('href'),
      })
    })

    const parts = titre.split(' - ')
    const poule = parts.length > 1 ? parts.at(-1) : ''
    const division = parts.length > 2 ? parts.at(-2) : ''
    equipes.push({
      sigle: ligne.sigle,
      numero: Number(ligne.sigle.split('-').pop()),
      competition: titre,
      niveau: titre.match(/\b(N[1-3]|R[1-3]|PR|D[1-6])\b/)?.[1] || division,
      poule,
      url: ligne.url,
      urlPoule: lienPoule,
      classement: classement.map(({ url, ...l }) => l),
      rencontres,
      joueurs,
    })
  }
}

// deux équipes peuvent partager une même poule départementale : tri par numéro puis par niveau
equipes.sort((a, b) => a.numero - b.numero || a.competition.localeCompare(b.competition))

await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify({ saison: `${seasonStart}-${seasonStart + 1}`, majLe: now.toISOString(), source: `${ICBAD}/instance/${CLUB}`, equipes }, null, 2) + '\n')

console.log(`Interclubs ${seasonStart}-${seasonStart + 1} : ${equipes.length} équipe(s)`)
for (const e of equipes) {
  const moi = e.classement.find((l) => l.sigle === e.sigle)
  console.log(`  ${e.sigle} ${e.niveau} ${e.poule} : ${moi.rang}e/${e.classement.length}, ${e.rencontres.length} rencontres, ${e.joueurs.length} joueurs`)
}
