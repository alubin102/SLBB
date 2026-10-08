// Importe le contenu de l'ancien site Sportsregions dans le projet :
//   - pages libres, actualités, événements  -> src/content/**.md
//   - albums photos/vidéos, partenaires, bureau, boutique -> src/data/*.json
//   - images et documents -> public/media/**
//
// Usage : npm run import:site
// À relancer tant que l'ancien site est en ligne ; les fichiers générés sont écrasés.

import { mkdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'

const BASE = 'https://www.sullylesbordesbadminton.fr'
const SITE_ID = '21236'
const SEASONS = ['2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027']
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')

// Ancienne page libre -> emplacement dans la nouvelle arborescence
const PAGES = [
  ['en-savoir-plus/historique-slb-bad-128609', 'le-club', 'presentation', 'Présentation du club'],
  ['en-savoir-plus/le-slb-cest-quoi-156820', 'le-club', 'nos-valeurs', 'Le SLBB, c’est quoi ?'],
  ['en-savoir-plus/dirigeants-128652', 'le-club', 'dirigeants', 'Dirigeants'],
  ['en-savoir-plus/poulpy-la-mascotte-140622', 'le-club', 'poulpy-la-mascotte', 'Poulpy la mascotte'],
  ['en-savoir-plus/club-house-eddy-baetens-174378', 'le-club', 'club-house', 'Club House Eddy Baetens'],
  ['en-savoir-plus/la-popote-du-slbb-174208', 'le-club', 'la-popote', 'La Popote du SLBB'],
  ['en-savoir-plus/statuts-128622', 'le-club', 'statuts', 'Statuts, règlement, charte'],
  ['en-savoir-plus/documents-comptes-rendus-141917', 'le-club', 'documents', 'Documents et comptes rendus'],
  ['en-savoir-plus/horaires-128399', 'infos-pratiques', 'horaires', 'Horaires'],
  ['en-savoir-plus/reservation-minibus-164826', 'infos-pratiques', 'minibus', 'Réservation du minibus'],
  ['en-savoir-plus/sinscrire-prise-de-licence-128699', 'inscription', 'licence', 'Prise de licence'],
  ['en-savoir-plus/tarifs-128933', 'inscription', 'tarifs', 'Tarifs'],
  ['en-savoir-plus/ecole-de-badminton-132322', 'jeunes', 'ecole-de-badminton', 'École de badminton'],
  ['en-savoir-plus/aurore-131396', 'jeunes', 'aurore-touze', 'Aurore Touzé'],
  ['en-savoir-plus/la-nuit-du-bad-164779', 'actualites', 'la-nuit-du-bad', 'La Nuit du Bad'],
  ['en-savoir-plus/revue-de-presse-133190', 'actualites', 'revue-de-presse', 'Revue de presse'],
  ['en-savoir-plus/partenariat-131398', 'partenaires', 'devenir-partenaire', 'Devenir partenaire'],
  ['boutique/larde-sport-10546', 'partenaires', 'boutique-lardesports', 'Lardesports'],
  ['boutique/la-boutique-intersport-10542', 'partenaires', 'boutique-intersport', 'Intersport'],
  ['informations-legales', 'le-club', 'mentions-legales', 'Mentions légales'],
]

// Liens internes de l'ancien site -> nouvelles routes (complété pendant l'import)
const routes = new Map([
  ['/', '/'],
  ['/partenaires', '/partenaires'],
  ['/equipes', '/competition'],
  ['/resultats', '/competition'],
  ['/contactez-nous', '/contact'],
  ['/actualites-du-club', '/actualites'],
  ['/evenements', '/agenda'],
  ['/photos-du-club', '/actualites/photos'],
  ['/videos-du-club', '/actualites/videos'],
  ['/boutique', '/partenaires/boutique'],
  ['/boutique/la-boutique-slb-10547', '/partenaires/boutique'],
  ['/reservations', '/infos-pratiques/reservations'],
  ['/organigramme-du-club/comite-directeur-4592', '/le-club/bureau'],
  ['/informations-legales', '/le-club/mentions-legales'],
])
for (const [old, section, slug] of PAGES) routes.set('/' + old, `/${section}/${slug}`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const report = { pages: 0, actualites: 0, evenements: 0, albums: 0, videos: 0, medias: 0, erreurs: [] }

// ---------- réseau ----------

const htmlCache = new Map()
async function getHtml(url) {
  const abs = new URL(url, BASE).href
  if (htmlCache.has(abs)) return htmlCache.get(abs)
  await sleep(200)
  const res = await fetch(abs, { headers: { 'user-agent': 'Mozilla/5.0 (import SLBB)' } })
  const html = res.ok ? await res.text() : null
  if (!html) report.erreurs.push(`${res.status} ${abs}`)
  htmlCache.set(abs, html)
  return html
}

const exists = (p) => access(p).then(() => true, () => false)

function safeName(name) {
  let n = name
  try { n = decodeURIComponent(name) } catch {}
  return n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '')
}

const mediaCache = new Map()
// Télécharge un média (image, pdf, document) et renvoie son chemin public local.
async function media(url, folder = '') {
  if (!url || url.startsWith('data:')) return url
  let abs = new URL(url, BASE)
  // Miniatures Sportsregions -> fichier d'origine
  const thumb = abs.pathname.match(/^\/mu[a-z]*-[^/]+\/(\d+)\/([^/]+)\/(.+)$/)
  if (thumb) abs = new URL(`/media/uploaded/sites/${thumb[1]}/${thumb[2]}/${thumb[3]}`, BASE)
  abs.pathname = abs.pathname.replace(/\/crop_([^/]+)$/, '/$1')
  if (abs.hostname === 'admin.sportsregions.fr') abs.hostname = new URL(BASE).hostname
  const key = abs.href
  if (mediaCache.has(key)) return mediaCache.get(key)

  try {
    await sleep(100)
    const res = await fetch(abs, { headers: { 'user-agent': 'Mozilla/5.0 (import SLBB)' } })
    if (!res.ok) throw new Error(String(res.status))
    const finalPath = new URL(res.url).pathname
    const kind =
      folder ||
      finalPath.match(new RegExp(`/sites/${SITE_ID}/([^/]+)/`))?.[1] ||
      (finalPath.includes('document') ? 'document' : 'externe')
    let name = safeName(path.basename(finalPath))
    if (!path.extname(name)) {
      const type = res.headers.get('content-type') || ''
      name += type.includes('pdf') ? '.pdf' : type.includes('png') ? '.png' : type.includes('jpeg') ? '.jpg' : ''
    }
    const rel = `/media/${kind}/${name}`
    const dest = path.join(PUBLIC, rel)
    if (!(await exists(dest))) {
      await mkdir(path.dirname(dest), { recursive: true })
      await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    }
    report.medias++
    mediaCache.set(key, rel)
    return rel
  } catch (e) {
    report.erreurs.push(`média ${e.message} ${abs.href}`)
    mediaCache.set(key, abs.href)
    return abs.href
  }
}

// ---------- conversion ----------

const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', hr: '---' })
turndown.keep(['iframe', 'video', 'table'])

const isMediaPath = (p) =>
  /\.(jpe?g|png|gif|webp|svg|pdf|docx?|xlsx?|pptx?|zip)$/i.test(p) || /\/(documents?|document-download)\//.test(p)

function mapInternal(href) {
  const u = new URL(href, BASE)
  if (u.hostname !== new URL(BASE).hostname) return null
  const p = u.pathname.replace(/\/$/, '') || '/'
  if (routes.has(p)) return routes.get(p)
  const noSeason = p.replace(/^\/saison-\d{4}-\d{4}/, '')
  if (routes.has(noSeason)) return routes.get(noSeason)
  // variantes d'URL d'une même page libre (l'identifiant final fait foi)
  const id = p.match(/^\/en-savoir-plus\/.*-(\d+)$/)?.[1]
  if (id) for (const [old, route] of routes) if (old.endsWith('-' + id)) return route
  if (/\/equipes(\/|$)/.test(p)) return '/competition'
  return null
}

// Transforme un fragment HTML de l'ancien site en Markdown, médias rapatriés.
async function toMarkdown($, el) {
  const root = $(el).clone()
  root.find('script, style, form, .captcha, #partage').remove()
  // lignes de séparation décoratives (tirets, étoiles)
  root.find('p').each((_, p) => {
    if (/^[\s*\-_–—]{6,}$/.test($(p).text())) $(p).remove()
  })
  for (const img of root.find('img').toArray()) {
    const src = $(img).attr('src')
    if (/\/images\/common\/|captcha|kcupload\/images\/pdf\.png|jimstatic/.test(src || '')) $(img).remove()
    else $(img).attr('src', await media(src))
  }
  for (const a of root.find('a').toArray()) {
    const href = $(a).attr('href')
    if (!href || href.startsWith('javascript') || href.startsWith('#')) { $(a).replaceWith($(a).html() || ''); continue }
    if (/admin\.sportsregions\.fr\/(?!media)/.test(href)) { $(a).replaceWith($(a).html() || ''); continue }
    if (/^(mailto|tel):/.test(href)) continue
    const u = new URL(href, BASE)
    const internal = mapInternal(href)
    if (internal) $(a).attr('href', internal)
    else if (u.hostname === new URL(BASE).hostname && isMediaPath(u.pathname)) $(a).attr('href', await media(href))
    else $(a).attr('href', u.href)
    $(a).removeAttr('target').removeAttr('rel').removeAttr('id').removeAttr('title')
  }
  return turndown.turndown(root.html() || '').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+$/gm, '').trim()
}

// Documents, photos et vidéos listés sous une page (« contenus associés »)
async function associated($) {
  const documents = []
  const photos = []
  const videos = []
  const seenDocs = new Set()
  for (const art of $('section.liste.documents article').toArray()) {
    const a = $(art).find('h3 a, a').first()
    const href = a.attr('href')
    if (!href || seenDocs.has(href)) continue
    seenDocs.add(href)
    documents.push({
      title: $(art).find('h3').first().text().trim() || a.text().trim(),
      description: $(art).find('.description').text().trim() || undefined,
      file: await media(href, 'document'),
    })
  }
  for (const a of $('#contenus-associes a[data-fancybox], section.liste.photos a[data-fancybox]').toArray()) {
    const href = $(a).attr('href')
    if (href && /\.(jpe?g|png|gif|webp)$/i.test(href)) photos.push(await media(href))
  }
  for (const a of $('section.liste.videos a[href*="videos-du-club"]').toArray()) {
    const v = await videoDetail($(a).attr('href'))
    if (v) videos.push(v)
  }
  return { documents, photos: [...new Set(photos)], videos }
}

async function videoDetail(href) {
  const html = await getHtml(href)
  if (!html) return null
  const $ = cheerio.load(html)
  const src = $('video source').attr('src') || $('#main iframe').attr('src')
  if (!src) return null
  const poster = $('video').attr('poster')
  // les .mp4 sont hébergés par Sportsregions : on les rapatrie aussi
  const local = /\.mp4$/i.test(src) ? await media(src, 'video') : src
  return { title: $('#main h1').first().text().trim(), src: local, poster: poster ? await media(poster) : undefined }
}

const yaml = (v) => JSON.stringify(v)
function frontmatter(data) {
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}: ${yaml(v)}`)
  return `---\n${lines.join('\n')}\n---\n`
}

async function writeContent(collection, slug, data, body) {
  const file = path.join(ROOT, 'src/content', collection, `${slug}.md`)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${frontmatter(data)}\n${body}\n`)
}

async function writeData(name, data) {
  const file = path.join(ROOT, 'src/data', `${name}.json`)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2) + '\n')
}

const slugOf = (href) => new URL(href, BASE).pathname.split('/').pop().replace(/-\d+$/, '')
const isoDate = ($, scope) => $(scope).find('.infos-publications time').attr('datetime')?.slice(0, 10)

// ---------- imports ----------

async function importPages() {
  for (const [old, section, slug, title] of PAGES) {
    const html = await getHtml('/' + old)
    if (!html) continue
    const $ = cheerio.load(html)
    const main = $('#main-content').first()
    main.find('figure.illustration').remove()
    const body = await toMarkdown($, main)
    const extra = await associated($)
    const frDate = $('.infos-publications').first().text().replace(/\s+/g, ' ').match(/le (.+)$/)?.[1]?.trim()
    await writeContent('pages', `${section}/${slug}`, {
      title,
      section,
      updated: isoDate($, 'body') || frDate,
      source: `${BASE}/${old}`,
      ...extra,
    }, body)
    report.pages++
  }
}

// Parcourt une liste paginée (toutes saisons) et renvoie les liens de détail.
async function listLinks(listPath, pattern, seasons = true) {
  const found = new Set()
  const queue = ['', ...(seasons ? SEASONS.map((s) => `/saison-${s}`) : [])].map((b) => `${b}/${listPath}`)
  const seen = new Set()
  while (queue.length) {
    const page = queue.shift()
    if (seen.has(page)) continue
    seen.add(page)
    const html = await getHtml(page)
    if (!html) continue
    const $ = cheerio.load(html)
    $('#main a[href]').each((_, a) => {
      const u = new URL($(a).attr('href'), BASE)
      if (pattern.test(u.pathname)) found.add(u.pathname)
      else if (u.searchParams.has('page') && u.searchParams.size === 1 && u.pathname === page.split('?')[0]) queue.push(u.pathname + u.search)
    })
  }
  // les 404 de saisons sans contenu ne sont pas des erreurs
  report.erreurs = report.erreurs.filter((e) => !e.includes(`/${listPath}`))
  return [...found]
}

async function importActualites() {
  const links = await listLinks('actualites-du-club', /\/actualites-du-club\/[^/]+-\d+$/)
  for (const link of links) {
    const html = await getHtml(link)
    if (!html) continue
    const $ = cheerio.load(html)
    const date = isoDate($, 'body')
    const slug = slugOf(link)
    routes.set(link, `/actualites/${slug}`)
    const main = $('#main-content').first()
    const cover = main.find('figure.illustration a').attr('href')
    main.find('figure.illustration').remove()
    await writeContent('actualites', slug, {
      title: $('#main h1').first().text().trim(),
      date,
      image: cover ? await media(cover) : undefined,
      source: BASE + link,
      ...(await associated($)),
    }, await toMarkdown($, main))
    report.actualites++
  }
}

async function importEvenements() {
  const pattern = /\/evenements\/\d{4}\/\d{2}\/\d{2}\/[^/]+-\d+$/
  const links = new Set([
    ...(await listLinks('evenements', pattern, false)),
    ...(await listLinks('evenements/passes', pattern, false)),
  ])
  for (const link of links) {
    const html = await getHtml(link)
    if (!html) continue
    const $ = cheerio.load(html)
    const start = $('[itemprop=startDate]').first().attr('content')
    const title = $('#main h1').first().text().trim()
    // les rencontres d'interclubs viennent d'ICBaD (npm run import:interclubs)
    if (!start || / contre /.test(title)) continue
    const slug = `${start.slice(0, 10)}-${slugOf(link)}`
    routes.set(link, `/agenda/${slug}`)
    const loc = $('#main .location').first()
    const main = $('#main-content').first()
    const cover = main.find('figure.illustration a').attr('href')
    main.find('figure.illustration').remove()
    await writeContent('evenements', slug, {
      title,
      start,
      end: $('[itemprop=endDate]').first().attr('content'),
      lieu: loc.length ? loc.find('span').map((_, s) => $(s).text().trim()).get().join(' ') : undefined,
      image: cover ? await media(cover) : undefined,
      source: BASE + link,
      ...(await associated($)),
    }, await toMarkdown($, main))
    report.evenements++
  }
}

async function importAlbums() {
  const albums = []
  for (const link of await listLinks('photos-du-club', /\/photos-du-club\/[^/]+-\d+$/)) {
    const html = await getHtml(link)
    if (!html) continue
    const $ = cheerio.load(html)
    const photos = []
    for (const a of $('#main a[data-fancybox]').toArray()) {
      const href = $(a).attr('href')
      if (href && /\.(jpe?g|png|gif|webp)$/i.test(href)) photos.push(await media(href))
    }
    albums.push({ slug: slugOf(link), title: $('#main h1').first().text().trim(), date: isoDate($, 'body'), photos: [...new Set(photos)] })
    report.albums++
  }
  await writeData('albums', albums.sort((a, b) => (b.date || '').localeCompare(a.date || '')))

  const videos = []
  for (const link of await listLinks('videos-du-club', /\/videos-du-club\/[^/]+-\d+$/)) {
    const html = await getHtml(link)
    if (!html) continue
    const $ = cheerio.load(html)
    for (const a of $('section.liste.videos a[href*="videos-du-club"]').toArray()) {
      const thumb = $(a).find('img[itemprop=image]').attr('src')
      const v = await videoDetail($(a).attr('href'))
      if (v) videos.push({ ...v, album: $('#main h1').first().text().trim(), date: isoDate($, 'body'), poster: thumb ? await media(thumb) : v.poster })
    }
  }
  report.videos = videos.length
  await writeData('videos', videos.sort((a, b) => (b.date || '').localeCompare(a.date || '')))
}

async function importPartenaires() {
  const partenaires = []
  let categorie = ''
  for (let page = 1; ; page++) {
  const html = await getHtml(`/partenaires?page=${page}`)
  if (!html) break
  const $ = cheerio.load(html)
  const fiches = $('#main section.liste.partenaires .element-inline')
  if (!fiches.length) break
  // parcours dans l'ordre du document : titres de catégorie puis fiches
  for (const el of $('#main h2.subheader, #main h3.subheader, #main section.liste.partenaires .element-inline').toArray()) {
    if (el.tagName === 'h2' || el.tagName === 'h3') { categorie = $(el).text().trim(); continue }
    if (partenaires.some((p) => p.name === $(el).find('h2').first().text().trim())) continue
    const link = $(el).find('h2 a, a').first().attr('href')
    const name = $(el).find('h2').first().text().trim()
    if (!link || !name || /sportsregions/i.test(name)) continue
    const detail = await getHtml(link)
    let site, description
    let logo = $(el).find('img').attr('src')
    if (detail) {
      const $d = cheerio.load(detail)
      const main = $d('#main-content').first()
      logo = main.find('a[data-fancybox]').attr('href') || logo
      main.find('a[data-fancybox]').closest('p').remove()
      const siteLink = main.find('a').filter((_, a) => /^Site internet/i.test($d(a).text())).first()
      site = siteLink.attr('href')
      siteLink.closest('p').remove()
      description = await toMarkdown($d, main)
    }
    partenaires.push({ name, categorie, logo: logo ? await media(logo) : undefined, site, description })
  }
  if (!$(`#main a[href*="page=${page + 1}"]`).length) break
  }
  await writeData('partenaires', partenaires)
}

async function importBureau() {
  const html = await getHtml('/organigramme-du-club/comite-directeur-4592')
  if (!html) return
  const $ = cheerio.load(html)
  const groupes = []
  let current
  for (const el of $('#main h2, #main h3, #main [itemtype*="Person"], #main .element-inline, #main article').toArray()) {
    if (el.tagName === 'h2' || el.tagName === 'h3') {
      const t = $(el).text().trim()
      if ($(el).closest('[itemtype*="Person"], .element-inline, article').length || !t) continue
      current = { nom: t, membres: [] }
      groupes.push(current)
      continue
    }
    if ($(el).parents('[itemtype*="Person"], .element-inline, article').length) continue
    const nom = $(el).find('[itemprop=name], h2, h3, h4').first().text().replace(/\s+/g, ' ').trim()
    if (!nom || !current) continue
    const img = $(el).find('img').attr('src')
    $(el).find('script').remove()
    const roles = $(el).text().replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(nom, '')
      .replace(/Lire la suite|Contacter|Email\s*:.*$/gi, '').trim()
    current.membres.push({ nom, role: roles, photo: img && !/common|default|avatar/.test(img) ? await media(img, 'membre') : undefined })
  }
  await writeData('bureau', groupes.filter((g) => g.membres.length))
}

async function importBoutique() {
  const produits = []
  const seen = new Set()
  const queue = ['/boutique/la-boutique-slb-10547']
  while (queue.length) {
    const page = queue.shift()
    if (seen.has(page)) continue
    seen.add(page)
    const html = await getHtml(page)
    if (!html) continue
    const $ = cheerio.load(html)
    const categorie = $('#main h1').first().text().trim()
    $('#main a[href]').each((_, a) => {
      const p = new URL($(a).attr('href'), BASE).pathname
      if (/^\/boutique\/[^/]+-\d+$/.test(p) && !/larde|intersport/.test(p)) queue.push(p)
      if (/^\/produit\//.test(p)) queue.push(p)
    })
    if (page.startsWith('/produit/')) {
      const titre = $('#main h1').first().clone()
      titre.find('.prix, .price').remove()
      const images = []
      for (const a of $('#main a[data-fancybox], #main a[href*="/produit/"][href$=".jpeg"], #main a[href*="/produit/"][href$=".jpg"], #main a[href*="/produit/"][href$=".png"]').toArray()) {
        images.push(await media($(a).attr('href')))
      }
      const text = $('#main').text().replace(/\s+/g, ' ')
      const caracteristiques = {}
      $('#main table tr, #main dl > div').each((_, r) => {
        const k = $(r).find('th, dt, td').first().text().trim()
        const v = $(r).find('td, dd').last().text().trim()
        if (k && v && k !== v && !/^(Prix|Quantité)$/.test(k)) caracteristiques[k] = v
      })
      produits.push({
        nom: titre.text().replace(/Prix.*$/, '').replace(/\s+/g, ' ').trim(),
        prix: text.match(/Prix\s*([\d.,]+)\s*€/)?.[1],
        adherents: /Spécial adhérents/i.test(text),
        images: [...new Set(images)],
        caracteristiques,
      })
    } else if (page !== '/boutique/la-boutique-slb-10547') {
      for (const p of produits) if (!p.categorie && $(`#main a[href*="${safeName(p.nom).slice(0, 8)}"]`).length) p.categorie = categorie
    }
  }
  await writeData('boutique', produits)
}

// ---------- exécution ----------

await importActualites()
await importEvenements()
await importPages()
await importAlbums()
await importPartenaires()
await importBureau()
await importBoutique()

console.log(
  `Import terminé : ${report.pages} pages, ${report.actualites} actualités, ${report.evenements} événements, ` +
    `${report.albums} albums, ${report.videos} vidéos, ${report.medias} médias.`,
)
if (report.erreurs.length) {
  console.log(`\n${report.erreurs.length} élément(s) non récupéré(s) :`)
  for (const e of [...new Set(report.erreurs)]) console.log('  - ' + e)
}
