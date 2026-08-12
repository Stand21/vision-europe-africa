const db = require('../config/database')
const logger = require('../config/logger')
const {
  LANGUAGES, DEFAULT_LANG, toArray, pick, toI18n,
  missingLanguages, requestedLang, stringifyOrNull,
} = require('../utils/i18n')

// Columns exposed publicly (no internal flags).
const PUBLIC_COLS = `
  code, country_code, flag, image_url, accent_color, is_featured,
  available_from, available_until,
  name_i18n, tagline_i18n, description_i18n, programs_i18n, highlights_i18n,
  languages, profiles, avg_salary, cost_level, visa_weeks_min, visa_weeks_max
`

const ADMIN_COLS = `
  id, code, country_code, name, flag, tagline, description,
  highlights, programs, image_url, accent_color, is_featured,
  available_from, available_until, is_active, sort_order,
  name_i18n, tagline_i18n, description_i18n, highlights_i18n, programs_i18n,
  languages, profiles, avg_salary, cost_level, visa_weeks_min, visa_weeks_max,
  created_at, updated_at
`


// Un champ multilingue est stocké {fr: …, en: …}. On sert la langue demandée
// et on retombe sur le français, puis sur la première valeur non vide.

// Aplatit une ligne pour le site public : les champs i18n deviennent des
// chaînes/tableaux dans la langue demandée.
function localise(row, lang) {
  const {
    name_i18n, tagline_i18n, description_i18n, highlights_i18n, programs_i18n, ...rest
  } = row
  return {
    ...rest,
    name: pick(name_i18n, lang, rest.code),
    tagline: pick(tagline_i18n, lang, null),
    description: pick(description_i18n, lang, null),
    highlights: pick(highlights_i18n, lang, []),
    programs: pick(programs_i18n, lang, []),
  }
}

// Accepte soit {fr: 'x', en: 'y'}, soit une valeur simple (rangée sous 'fr').
// `asList` convertit chaque langue en tableau (points forts, programmes).

// Langues pour lesquelles il manque au moins un champ — affiché dans l'admin.


const PROFILE_VALUES = ['student', 'worker', 'visitor']
const COST_LEVELS = ['low', 'medium', 'high']

// Un entier optionnel : '' et undefined deviennent null plutôt que NaN.
function toInt(value) {
  if (value === '' || value == null) return null
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

// Normalise a highlights/programs payload: accepts an array, or a string with
// one item per line / separated by commas.

function slugify(value) {
  return String(value)
    .normalize('NFD')
    // strip combining diacritical marks
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Computed status used by the admin UI: active | scheduled | expired | disabled
function withStatus(row) {
  const today = new Date().toISOString().slice(0, 10)
  const from = row.available_from ? new Date(row.available_from).toISOString().slice(0, 10) : null
  const until = row.available_until ? new Date(row.available_until).toISOString().slice(0, 10) : null

  let status = 'active'
  if (!row.is_active) status = 'disabled'
  else if (from && from > today) status = 'scheduled'
  else if (until && until < today) status = 'expired'

  return {
    ...row,
    available_from: from,
    available_until: until,
    status,
    is_visible: status === 'active',
    missing_translations: missingLanguages([row.name_i18n, row.tagline_i18n, row.description_i18n, row.highlights_i18n, row.programs_i18n]),
  }
}

// ── Public: only active destinations inside their validity window ─────────────
exports.listPublic = async (req, res) => {
  try {
    const lang = requestedLang(req)
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLS} FROM destinations_public ORDER BY sort_order, name`
    )
    // Le cache HTTP doit distinguer les langues
    res.set('Vary', 'Accept-Language')
    res.json(rows.map(row => localise(row, lang)))
  } catch (err) {
    logger.error('List destinations error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: everything, including expired and disabled ─────────────────────────
exports.list = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT ${ADMIN_COLS} FROM destinations ORDER BY sort_order, name`
    )
    res.json({ destinations: rows.map(withStatus) })
  } catch (err) {
    logger.error('List destinations (admin) error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: create ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  const {
    code, country_code, name, flag, image_url, accent_color,
    is_featured = false, available_from, available_until,
    is_active = true, sort_order = 0,
    languages, profiles, avg_salary, cost_level, visa_weeks_min, visa_weeks_max,
  } = req.body

  // Le formulaire envoie les champs traduisibles sous leur forme i18n ;
  // on tolère aussi l'ancienne forme (chaîne simple) pour ne rien casser.
  const nameI18n = req.body.name_i18n ?? req.body.name
  const tagline = req.body.tagline_i18n ?? req.body.tagline
  const description = req.body.description_i18n ?? req.body.description
  const highlights = req.body.highlights_i18n ?? req.body.highlights
  const programs = req.body.programs_i18n ?? req.body.programs

  if (!name || !country_code) {
    return res.status(400).json({ error: 'name and country_code are required' })
  }
  if (available_from && available_until && available_from > available_until) {
    return res.status(400).json({ error: 'available_from must be before available_until' })
  }
  if (cost_level && !COST_LEVELS.includes(cost_level)) {
    return res.status(400).json({ error: `cost_level must be one of ${COST_LEVELS.join(', ')}` })
  }

  const wmin = toInt(visa_weeks_min)
  const wmax = toInt(visa_weeks_max)
  if (wmin != null && wmax != null && wmin > wmax) {
    return res.status(400).json({ error: 'visa_weeks_min must be lower than visa_weeks_max' })
  }

  const profileList = (toArray(profiles) || PROFILE_VALUES).filter(p => PROFILE_VALUES.includes(p))

  try {
    const { rows } = await db.query(
      `INSERT INTO destinations
        (code, country_code, name, flag,
         name_i18n, tagline_i18n, description_i18n, highlights_i18n, programs_i18n,
         image_url, accent_color, is_featured, available_from, available_until, is_active, sort_order,
         languages, profiles, avg_salary, cost_level, visa_weeks_min, visa_weeks_max)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING ${ADMIN_COLS}`,
      [
        slugify(code || name),
        String(country_code).trim().toUpperCase(),
        String(name).trim(),
        flag || null,
        JSON.stringify(toI18n(nameI18n) || {}),
        JSON.stringify(toI18n(tagline) || {}),
        JSON.stringify(toI18n(description) || {}),
        JSON.stringify(toI18n(highlights, true) || {}),
        JSON.stringify(toI18n(programs, true) || {}),
        image_url || null,
        accent_color || '#635bff',
        is_featured,
        available_from || null,
        available_until || null,
        is_active,
        sort_order,
        JSON.stringify(toArray(languages) || []),
        JSON.stringify(profileList.length ? profileList : PROFILE_VALUES),
        toInt(avg_salary),
        cost_level || null,
        wmin,
        wmax,
      ]
    )

    await db.query(
      `INSERT INTO activity_logs (action, entity, entity_id, metadata) VALUES ($1,$2,$3,$4)`,
      ['destination.create', 'destination', rows[0].id, JSON.stringify({ name: rows[0].name })]
    ).catch(() => {})

    res.status(201).json({ success: true, destination: withStatus(rows[0]) })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A destination with this code already exists' })
    }
    logger.error('Create destination error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: update ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  const { id } = req.params
  const b = req.body

  if (b.available_from && b.available_until && b.available_from > b.available_until) {
    return res.status(400).json({ error: 'available_from must be before available_until' })
  }
  if (b.cost_level && !COST_LEVELS.includes(b.cost_level)) {
    return res.status(400).json({ error: `cost_level must be one of ${COST_LEVELS.join(', ')}` })
  }
  if (toInt(b.visa_weeks_min) != null && toInt(b.visa_weeks_max) != null
      && toInt(b.visa_weeks_min) > toInt(b.visa_weeks_max)) {
    return res.status(400).json({ error: 'visa_weeks_min must be lower than visa_weeks_max' })
  }

  try {
    const { rows } = await db.query(
      `UPDATE destinations SET
         code            = COALESCE($2,  code),
         country_code    = COALESCE($3,  country_code),
         name            = COALESCE($4,  name),
         flag            = COALESCE($5,  flag),
         name_i18n        = COALESCE($23::jsonb, name_i18n),
         tagline_i18n     = COALESCE($6::jsonb, tagline_i18n),
         description_i18n = COALESCE($7::jsonb, description_i18n),
         highlights_i18n  = COALESCE($8::jsonb, highlights_i18n),
         programs_i18n    = COALESCE($9::jsonb, programs_i18n),
         image_url       = COALESCE($10, image_url),
         accent_color    = COALESCE($11, accent_color),
         is_featured     = COALESCE($12, is_featured),
         available_from  = CASE WHEN $13::text IS NULL THEN available_from  WHEN $13::text = '' THEN NULL ELSE $13::date END,
         available_until = CASE WHEN $14::text IS NULL THEN available_until WHEN $14::text = '' THEN NULL ELSE $14::date END,
         is_active       = COALESCE($15, is_active),
         sort_order      = COALESCE($16, sort_order),
         languages       = COALESCE($17::jsonb, languages),
         profiles        = COALESCE($18::jsonb, profiles),
         avg_salary      = COALESCE($19, avg_salary),
         cost_level      = COALESCE($20, cost_level),
         visa_weeks_min  = COALESCE($21, visa_weeks_min),
         visa_weeks_max  = COALESCE($22, visa_weeks_max)
       WHERE id = $1
       RETURNING ${ADMIN_COLS}`,
      [
        id,
        b.code != null ? slugify(b.code) : null,
        b.country_code != null ? String(b.country_code).toUpperCase() : null,
        b.name ?? null,
        b.flag ?? null,
        stringifyOrNull(toI18n(b.tagline_i18n ?? b.tagline)),
        stringifyOrNull(toI18n(b.description_i18n ?? b.description)),
        stringifyOrNull(toI18n(b.highlights_i18n ?? b.highlights, true)),
        stringifyOrNull(toI18n(b.programs_i18n ?? b.programs, true)),
        b.image_url ?? null,
        b.accent_color ?? null,
        b.is_featured ?? null,
        b.available_from === null ? '' : (b.available_from ?? null),
        b.available_until === null ? '' : (b.available_until ?? null),
        b.is_active ?? null,
        b.sort_order ?? null,
        b.languages != null ? JSON.stringify(toArray(b.languages)) : null,
        b.profiles != null
          ? JSON.stringify((toArray(b.profiles) || []).filter(p => PROFILE_VALUES.includes(p)))
          : null,
        toInt(b.avg_salary),
        b.cost_level || null,
        toInt(b.visa_weeks_min),
        toInt(b.visa_weeks_max),
        stringifyOrNull(toI18n(b.name_i18n)),
      ]
    )

    if (!rows.length) return res.status(404).json({ error: 'Destination not found' })
    res.json({ success: true, destination: withStatus(rows[0]) })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A destination with this code already exists' })
    }
    logger.error('Update destination error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: delete ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  const { id } = req.params
  try {
    const { rowCount } = await db.query('DELETE FROM destinations WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Destination not found' })

    await db.query(
      `INSERT INTO activity_logs (action, entity, entity_id) VALUES ($1,$2,$3)`,
      ['destination.delete', 'destination', id]
    ).catch(() => {})

    res.json({ success: true })
  } catch (err) {
    logger.error('Delete destination error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: purge expired destinations ─────────────────────────────────────────
// Deletes every destination whose availability window ended before today.
exports.purgeExpired = async (req, res) => {
  try {
    const { rows } = await db.query(
      `DELETE FROM destinations
        WHERE available_until IS NOT NULL AND available_until < CURRENT_DATE
        RETURNING code, name`
    )
    logger.info(`Purged ${rows.length} expired destination(s)`)
    res.json({ success: true, deleted: rows.length, destinations: rows })
  } catch (err) {
    logger.error('Purge destinations error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Helper reused by the application controller to validate submissions ───────
exports.isDestinationOpen = async (code) => {
  if (!code) return false
  const { rows } = await db.query(
    'SELECT 1 FROM destinations_public WHERE code = $1',
    [String(code).toLowerCase()]
  )
  return rows.length > 0
}
