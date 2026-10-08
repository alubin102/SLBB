import { getCollection } from 'astro:content'

// Pages importées remplacées par une page mise en forme à la main
const REMPLACEES = new Set(['infos-pratiques/horaires', 'inscription/tarifs', 'inscription/licence'])

export const pagesLibres = async () => (await getCollection('pages')).filter((p) => !REMPLACEES.has(p.id))
export const pagesDe = async (section: string) => (await pagesLibres()).filter((p) => p.data.section === section)

export const actualites = async () =>
  (await getCollection('actualites')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime())

export async function evenements(now = new Date()) {
  const tous = (await getCollection('evenements')).sort((a, b) => a.data.start.getTime() - b.data.start.getTime())
  const fin = (e: (typeof tous)[number]) => e.data.end ?? e.data.start
  return {
    tous,
    aVenir: tous.filter((e) => fin(e) >= now),
    passes: tous.filter((e) => fin(e) < now).reverse(),
  }
}
