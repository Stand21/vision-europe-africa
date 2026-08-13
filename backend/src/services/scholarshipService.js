const db = require('../config/database')
const scholarshipImage = require('./scholarshipImageService')

const CACHE_TTL_MS = 60 * 1000
const cache = new Map()

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

function toCard(row) {
  const deadline = row.deadline ? new Date(row.deadline) : null

  let daysRemaining = null

  if (deadline && !Number.isNaN(deadline.getTime())) {
    daysRemaining = Math.ceil(
      (deadline.getTime() - Date.now()) / 86400000
    )
  }

  return {
    id: String(row.id),

    title: row.title,
    provider: row.provider || null,
    university: row.university || null,

    country: row.country || null,
    countryCode: row.country_code || null,
    city: row.city || null,

    levels: Array.isArray(row.levels)
      ? row.levels
      : [],

    fields: Array.isArray(row.fields)
      ? row.fields
      : [],

    fundingType: row.funding_type || null,

    amount:
      row.amount != null
        ? Number(row.amount)
        : null,

    currency: row.currency || null,

    covers: {
      tuition: Boolean(row.tuition_covered),
      accommodation: Boolean(row.accommodation_covered),
      travel: Boolean(row.travel_covered),
      stipend: Boolean(row.stipend_covered),
    },

    description: row.description || null,

    deadline: row.deadline || null,
    daysRemaining,

    isOpen:
      row.status === 'open' &&
      (daysRemaining == null || daysRemaining >= 0),

    applicationUrl:
      row.application_url ||
      row.source_url ||
      null,

    sourceUrl: row.source_url || null,
    sourceName: row.source_name || null,

    imageUrl:
      row.image_url ||
      scholarshipImage.resolve({
        countryCode: row.country_code,
        provider: row.provider,
        sourceName: row.source_name,
        fingerprint: row.fingerprint,
      }),

    status: row.status,

    lastVerifiedAt:
      row.last_verified_at || null,
  }
}

async function loadOverrides() {
  try {
    const { rows } = await db.query(`
      SELECT
        scholarship_ref,
        image_url,
        is_featured,
        is_hidden,
        sort_order
      FROM scholarship_overrides
    `)

    return new Map(
      rows.map(row => [
        String(row.scholarship_ref),
        row,
      ])
    )
  } catch {
    return new Map()
  }
}

function mergeOverride(card, override) {
  if (!override) return card

  return {
    ...card,

    imageUrl:
      override.image_url ||
      card.imageUrl,

    isFeatured:
      override.is_featured,

    isHidden:
      override.is_hidden,

    sortOrder:
      override.sort_order,
  }
}

function applyOverrides(cards, overrides) {
  return cards
    .map(card =>
      mergeOverride(card, overrides.get(String(card.id)))
    )

    .filter(card => !card.isHidden)

    .sort((a, b) => {
      const featured =
        Number(b.isFeatured || false) -
        Number(a.isFeatured || false)

      if (featured !== 0) {
        return featured
      }

      return (
        Number(a.sortOrder || 0) -
        Number(b.sortOrder || 0)
      )
    })
}

async function list(query = {}) {
  const params = {}

  const allowed = [
    'q',
    'country',
    'level',
    'field',
    'funding',
    'status',
    'page',
    'limit',
    'sort',
  ]

  for (const key of allowed) {
    if (
      query[key] != null &&
      query[key] !== ''
    ) {
      params[key] = String(query[key])
    }
  }

  const key = cacheKey(params)

  const cached = readCache(key)

  if (cached) {
    return cached
  }

  const page =
    Math.max(
      parseInt(params.page || '1', 10),
      1
    )

  const limit =
    Math.min(
      Math.max(
        parseInt(params.limit || '48', 10),
        1
      ),
      100
    )

  const offset =
    (page - 1) * limit

  const conditions = []
  const values = []

  // Par défaut (et avec status=active) on affiche open + unknown : une bourse
  // sans deadline exploitable ne doit pas être masquée pour autant. Seul
  // status=all lève tout filtre, et un statut explicite (open/closed/unknown)
  // reste un filtre exact.
  const status = params.status || 'active'

  if (status === 'active') {
    conditions.push(`status IN ('open', 'unknown')`)
  } else if (status !== 'all') {
    values.push(status)

    conditions.push(
      `status = $${values.length}`
    )
  }

  if (params.country) {
    values.push(`%${params.country}%`)

    conditions.push(
      `(
        country ILIKE $${values.length}
        OR country_code ILIKE $${values.length}
      )`
    )
  }

  if (params.level) {
    values.push(params.level)

    conditions.push(
      `$${values.length} = ANY(levels)`
    )
  }

  if (params.field) {
    values.push(params.field)

    conditions.push(
      `$${values.length} = ANY(fields)`
    )
  }

  if (params.funding) {
    values.push(params.funding)

    conditions.push(
      `funding_type = $${values.length}`
    )
  }

  if (params.q) {
    values.push(`%${params.q}%`)

    conditions.push(`
      (
        title ILIKE $${values.length}
        OR provider ILIKE $${values.length}
        OR university ILIKE $${values.length}
        OR description ILIKE $${values.length}
        OR country ILIKE $${values.length}
      )
    `)
  }

  const where =
    conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

  let orderBy =
    'deadline ASC NULLS LAST, created_at DESC'

  if (params.sort === 'newest') {
    orderBy =
      'created_at DESC'
  }

  if (params.sort === 'amount') {
    orderBy =
      'amount DESC NULLS LAST'
  }

  if (params.sort === 'title') {
    orderBy =
      'title ASC'
  }

  const countResult =
    await db.query(
      `
      SELECT COUNT(*)::int AS total
      FROM scholarships
      ${where}
      `,
      values
    )

  const total =
    countResult.rows[0].total

  const dataValues = [
    ...values,
    limit,
    offset,
  ]

  const dataResult =
    await db.query(
      `
      SELECT *
      FROM scholarships
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length}
      `,
      dataValues
    )

  const overrides =
    await loadOverrides()

  const cards =
    dataResult.rows.map(toCard)

  const result = {
    data:
      applyOverrides(
        cards,
        overrides
      ),

    pagination: {
      page,
      limit,
      total,
      pages:
        Math.ceil(total / limit),
    },

    available: true,
  }

  cache.set(
    key,
    {
      at: Date.now(),
      payload: result,
    }
  )

  return result
}

/**
 * Fiche détail d'une bourse. Contrairement à `list`, ne filtre pas sur le
 * statut : une bourse fermée reste consultable si son URL directe est connue.
 * N'exclut pas non plus les bourses masquées (`is_hidden`) pour la même raison.
 */
async function getById(id) {
  if (!/^\d+$/.test(String(id))) return null

  const { rows } = await db.query(
    `SELECT * FROM scholarships WHERE id = $1`,
    [id]
  )

  if (!rows.length) return null

  const overrides = await loadOverrides()
  const card = toCard(rows[0])

  return mergeOverride(card, overrides.get(String(card.id)))
}

async function countries() {
  const cached =
    readCache('__countries__')

  if (cached) {
    return cached
  }

  const { rows } =
    await db.query(`
      SELECT
        country,
        country_code,
        COUNT(*)::int AS count
      FROM scholarships
      WHERE status IN ('open', 'unknown')
        AND country IS NOT NULL
      GROUP BY
        country,
        country_code
      ORDER BY
        country ASC
    `)

  const result =
    rows.map(row => ({
      country: row.country,
      countryCode:
        row.country_code,
      count: row.count,
    }))

  cache.set(
    '__countries__',
    {
      at: Date.now(),
      payload: result,
    }
  )

  return result
}

function clearCache() {
  cache.clear()
}

module.exports = {
  list,
  getById,
  countries,
  toCard,
  clearCache,
}
