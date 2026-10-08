import data from '@/data/interclubs.json'

export const interclubs = data
export const equipes = data.equipes
export const slugEquipe = (e: { numero: number; niveau: string }) => `equipe-${e.numero}-${e.niveau.toLowerCase()}`

type Rencontre = (typeof equipes)[number]['rencontres'][number]
const toutes = equipes.flatMap((e) => e.rencontres.map((m) => ({ ...m, equipe: e })))

export const derniersResultats = (n: number) =>
  toutes.filter((m) => m.score).sort((a, b) => b.date.localeCompare(a.date)).slice(0, n)

export const prochainesRencontres = (n: number, depuis = new Date()) =>
  toutes.filter((m) => !m.score && new Date(m.date) >= depuis).sort((a, b) => a.date.localeCompare(b.date)).slice(0, n)

export const positionDe = (e: (typeof equipes)[number]) => e.classement.find((l) => l.sigle === e.sigle)
export type { Rencontre }
