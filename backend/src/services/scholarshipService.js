const logger = require('../config/logger')
const db = require('../config/database')

/**
 * Bourses d'études — relais vers l'API « Ma Bourse d'Études ».
 *
 * Le site n'interroge pas cette API directement : le backend sert de relais.
 * Trois raisons — pas de CORS à configurer, l'URL de l'API reste privée, et
 * un cache court évite de la marteler à chaque visite.
 *
 * Si l'API est injoignable, on renvoie une liste vide plutôt qu'une erreur :
 * la section disparaît de la page au lieu de la casser.
 */

const API_URL = (process.env.SCHOLARSHIP_API_URL || '').replace(/\/$/, '')
const TIMEOUT_MS = 8000
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const cache = new Map() // clé de requête → { at, payload }

function cacheKey(params) {
  return JSON.stringify(params, Object.keys(params).sort())
}

function readCache(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.payload
}

/** Ne garde que ce que le site affiche, et normalise les noms de champs. */
function toCard(row) {
  return {
    id: String(row.id),
    title: row.title,
    provider: row.provider || null,
    university: row.university || null,
    country: row.country || null,
    countryCode: row.country_code || row.countryCode || null,
    city: row.city || null,
    levels: Array.isArray(row.levels) ? row.levels : [],
    fields: Array.isArray(row.fields) ? row.fields : [],
    fundingType: row.funding_type || row.fundingType || null,
    amount: row.amount != null ? Number(row.amount) : null,
    currency: row.currency || null,
    covers: {
      tuition: Boolean(row.tuition_covered ?? row.tuitionCovered),
      accommodation: Boolean(row.accommodation_covered ?? row.accommodationCovered),
      travel: Boolean(row.travel_covered ?? row.travelCovered),
      stipend: Boolean(row.stipend_covered ?? row.stipendCovered),
    },
    description: row.description || null,
    deadline: row.deadline || null,
    daysRemaining: row.daysRemaining ?? null,
    isOpen: row.isOpen ?? null,
    applicationUrl: row.application_url || row.applicationUrl || null,
    imageUrl: row.image_url || row.imageUrl || null,
  }
}

const EMPTY = { data: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 }, available: false }

/**
 * Personnalisations saisies dans l'administration : visuel, mise en avant,
 * masquage. Elles se superposent aux données de l'API sans jamais l'altérer.
 */
async function loadOverrides() {
  try {
    const { rows } = await db.query(
      'SELECT scholarship_ref, image_url, is_featured, is_hidden, sort_order FROM scholarship_overrides'
    )
    return new Map(rows.map(r => [String(r.scholarship_ref), r]))
  } catch {
    // Table absente (migration pas encore passée) : on sert l'API telle quelle.
    return new Map()
  }
}

function applyOverrides(cards, overrides) {
  return cards
    .map(card => {
      const o = overrides.get(String(card.id))
      if (!o) return card
      return {
        ...card,
        // Un visuel ajouté dans l'admin prime sur celui de l'API
        imageUrl: o.image_url || card.imageUrl,
        isFeatured: o.is_featured,
        isHidden: o.is_hidden,
        sortOrder: o.sort_order,
      }
    })
    .filter(card => !card.isHidden)
    .sort((a, b) => Number(b.isFeatured || false) - Number(a.isFeatured || false))
}

/** Liste de bourses, filtres transmis tels quels à l'API amont. */
async function list(query = {}) {
  if (!API_URL) {
    logger.warn('SCHOLARSHIP_API_URL non défini — section bourses masquée')
    return EMPTY
  }

  const allowed = ['q', 'country', 'level', 'field', 'status', 'page', 'limit', 'sort']
  const params = {}
  for (const key of allowed) {
    if (query[key] != null && query[key] !== '') params[key] = String(query[key])
  }

  const key = cacheKey(params)
  const cached = readCache(key)
  if (cached) return cached

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const url = `${API_URL}/api/scholarships?${new URLSearchParams(params)}`
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const payload = await response.json()
    const overrides = await loadOverrides()
    const cards = Array.isArray(payload.data) ? payload.data.map(toCard) : []
    const result = {
      data: applyOverrides(cards, overrides),
      pagination: payload.pagination || EMPTY.pagination,
      available: true,
    }

    cache.set(key, { at: Date.now(), payload: result })
    return result
  } catch (err) {
    logger.warn(`Bourses indisponibles (${err.message}) — section masquée`)
    return EMPTY
  } finally {
    clearTimeout(timer)
  }
}

/** Pays disponibles, pour alimenter le filtre. */
async function countries() {
  if (!API_URL) return []
  const cached = readCache('__countries__')
  if (cached) return cached

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(`${API_URL}/api/countries`, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    const list = Array.isArray(payload) ? payload : payload.data || []
    cache.set('__countries__', { at: Date.now(), payload: list })
    return list
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

/** Vide le cache — appelé après une modification depuis l'administration. */
function clearCache() {
  cache.clear()
}

module.exports = { list, countries, toCard, clearCache }
