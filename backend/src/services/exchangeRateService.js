const db = require('../config/database')
const logger = require('../config/logger')

/**
 * Taux de change, base EUR.
 *
 * Les montants du site sont stockés en euros ; ce service fournit de quoi les
 * convertir dans la devise du visiteur. Il interroge une API publique au plus
 * une fois par jour et conserve le résultat en base : si l'API tombe, le site
 * continue d'afficher les derniers taux connus plutôt qu'un montant vide.
 */

const API_URL = 'https://open.er-api.com/v6/latest/EUR'
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000 // une fois par jour
const FETCH_TIMEOUT_MS = 8000

// Devises réellement utiles au projet : inutile de stocker les 160 de l'API.
const TRACKED = [
  'EUR', 'USD', 'GBP', 'CHF', 'PLN', 'CZK', 'SEK', 'NOK', 'DKK', 'CAD',
  'XOF', 'XAF', 'CDF', 'NGN', 'GHS', 'KES', 'TZS', 'UGX', 'ZAR', 'GNF',
  'MAD', 'DZD', 'EGP', 'RWF', 'ETB', 'ZMW', 'MZN', 'AOA', 'CVE', 'GMD',
  'LRD', 'SLE', 'MUR', 'MWK', 'BIF', 'SOS', 'SDG', 'TND', 'LYD',
]

let refreshing = null // évite les appels concurrents au démarrage

async function readSetting(key) {
  const { rows } = await db.query('SELECT value FROM settings WHERE key = $1', [key])
  return rows[0]?.value || ''
}

async function writeSetting(key, value) {
  await db.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value]
  )
}

async function isStale() {
  const last = await readSetting('rates_last_refresh')
  if (!last) return true
  const age = Date.now() - new Date(last).getTime()
  return !Number.isFinite(age) || age > REFRESH_INTERVAL_MS
}

/** Interroge l'API et enregistre les taux. Renvoie le nombre de devises mises à jour. */
async function fetchAndStore() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(API_URL, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const payload = await response.json()
    if (payload.result !== 'success' || !payload.rates) {
      throw new Error(`réponse inattendue : ${payload.result || 'sans result'}`)
    }
    if (payload.base_code !== 'EUR') {
      throw new Error(`base inattendue : ${payload.base_code}`)
    }

    const entries = TRACKED
      .map(code => [code, Number(payload.rates[code])])
      .filter(([, rate]) => Number.isFinite(rate) && rate > 0)

    if (!entries.length) throw new Error('aucun taux exploitable dans la réponse')

    // Une seule requête pour tout écrire
    const values = entries.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}, 'api', NOW())`).join(', ')
    await db.query(
      `INSERT INTO exchange_rates (code, rate, source, updated_at) VALUES ${values}
       ON CONFLICT (code) DO UPDATE
         SET rate = EXCLUDED.rate, source = 'api', updated_at = NOW()`,
      entries.flat()
    )

    await writeSetting('rates_last_refresh', new Date().toISOString())
    logger.info(`💱 Taux de change rafraîchis : ${entries.length} devises`)
    return entries.length
  } finally {
    clearTimeout(timer)
  }
}

/** Rafraîchit si les taux ont plus d'un jour. N'échoue jamais bruyamment. */
async function refreshIfStale() {
  if (refreshing) return refreshing

  refreshing = (async () => {
    try {
      if (!(await isStale())) return { refreshed: false, reason: 'à jour' }
      const count = await fetchAndStore()
      return { refreshed: true, count }
    } catch (err) {
      // L'API est un confort, pas une dépendance : on garde les taux en base.
      logger.warn(`Taux de change non rafraîchis (${err.message}) — derniers taux connus conservés`)
      return { refreshed: false, reason: err.message }
    } finally {
      refreshing = null
    }
  })()

  return refreshing
}

/** Tous les taux connus, sous forme { EUR: 1, XOF: 655.957, … }. */
async function getRates() {
  await refreshIfStale()

  const { rows } = await db.query('SELECT code, rate, source, updated_at FROM exchange_rates')
  const rates = {}
  for (const row of rows) rates[row.code] = Number(row.rate)

  // Filet ultime : sans aucune ligne en base, on sait au moins convertir l'euro.
  if (!rates.EUR) rates.EUR = 1

  const updatedAt = rows.reduce(
    (latest, r) => (!latest || r.updated_at > latest ? r.updated_at : latest),
    null
  )
  const stale = rows.every(r => r.source === 'seed')

  return { base: 'EUR', rates, updatedAt, stale }
}

/** Convertit un montant en euros vers une devise. Renvoie null si inconnue. */
async function convert(amountEur, currency) {
  const { rates } = await getRates()
  const rate = rates[String(currency).toUpperCase()]
  if (!Number.isFinite(rate)) return null
  return amountEur * rate
}

module.exports = { getRates, convert, refreshIfStale, TRACKED }
