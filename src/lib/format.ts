const tz = 'Europe/Paris'

export const dateLongue = (d: Date | string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz }).format(new Date(d))

export const dateCourte = (d: Date | string) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz }).format(new Date(d))

export const jourMois = (d: Date | string) => ({
  jour: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', timeZone: tz }).format(new Date(d)),
  mois: new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: tz }).format(new Date(d)).replace('.', ''),
  annee: new Intl.DateTimeFormat('fr-FR', { year: 'numeric', timeZone: tz }).format(new Date(d)),
})

export const heure = (d: Date | string) =>
  new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(d)).replace(':', 'h')

const jourISO = (d: Date) => new Intl.DateTimeFormat('fr-CA', { timeZone: tz }).format(d)

// « 21 novembre 2026 » ou « du 21 au 22 novembre 2026 »
export function periode(start: Date, end?: Date) {
  if (!end || jourISO(start) === jourISO(end)) return dateLongue(start)
  const memeMois = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const debut = memeMois ? jourMois(start).jour.replace(/^0/, '') : dateLongue(start).replace(/ \d{4}$/, '')
  return `du ${debut} au ${dateLongue(end)}`
}
