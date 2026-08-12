/**
 * Utilitaires partagés pour les champs multilingues stockés en JSONB.
 *
 * Un champ traduisible vaut { fr: 'Visa Travail', en: 'Work Visa', … }.
 * Le français est la langue de repli : une langue absente n'affiche jamais
 * de vide, elle retombe sur le français puis sur la première valeur remplie.
 */

const LANGUAGES = ['fr', 'en', 'pt', 'de']
const DEFAULT_LANG = 'fr'

/** Découpe une saisie « un élément par ligne » (ou une virgule) en tableau. */
function toArray(value) {
  if (value == null) return null
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value.split(/\r?\n|,/).map(v => v.trim()).filter(Boolean)
  }
  return []
}

/** Valeur d'un champ traduisible dans la langue voulue, avec repli. */
function pick(field, lang, fallback = null) {
  if (field == null) return fallback
  if (typeof field !== 'object' || Array.isArray(field)) return field
  for (const code of [lang, DEFAULT_LANG, ...LANGUAGES]) {
    const value = field[code]
    if (value == null) continue
    if (typeof value === 'string' && value.trim() === '') continue
    if (Array.isArray(value) && value.length === 0) continue
    return value
  }
  return fallback
}

/**
 * Normalise ce qu'envoie le formulaire admin.
 * Accepte { fr: …, en: … } ou une valeur simple (rangée sous 'fr').
 * `asList` convertit chaque langue en tableau.
 */
function toI18n(value, asList = false) {
  if (value == null) return null
  const clean = v => (asList ? (toArray(v) || []) : String(v))
  const filled = v => (asList ? v.length > 0 : String(v).trim() !== '')

  if (typeof value === 'object' && !Array.isArray(value)) {
    const out = {}
    for (const code of LANGUAGES) {
      if (value[code] == null) continue
      const v = clean(value[code])
      if (filled(v)) out[code] = v
    }
    return out
  }
  const v = clean(value)
  return filled(v) ? { [DEFAULT_LANG]: v } : {}
}

/** Langues pour lesquelles au moins un des champs fournis est vide. */
function missingLanguages(fields) {
  return LANGUAGES.filter(code =>
    fields.some(field => {
      const v = field?.[code]
      if (v == null) return true
      return Array.isArray(v) ? v.length === 0 : String(v).trim() === ''
    })
  )
}

/** Langue demandée dans la query string, restreinte aux langues connues. */
function requestedLang(req) {
  const raw = String(req?.query?.lang || '').toLowerCase()
  return LANGUAGES.includes(raw) ? raw : DEFAULT_LANG
}

const stringifyOrNull = v => (v == null ? null : JSON.stringify(v))

module.exports = {
  LANGUAGES,
  DEFAULT_LANG,
  toArray,
  pick,
  toI18n,
  missingLanguages,
  requestedLang,
  stringifyOrNull,
}
