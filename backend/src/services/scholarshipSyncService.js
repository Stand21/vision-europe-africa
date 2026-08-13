const crypto = require('crypto')
const db = require('../config/database')

function fingerprint(s) {
  return crypto
    .createHash('sha256')
    .update(
      [
        s.title || '',
        s.provider || '',
        s.countryCode || '',
        s.sourceUrl || '',
      ]
        .join('|')
        .toLowerCase()
    )
    .digest('hex')
}

async function saveScholarship(s) {
  if (!s.title) throw new Error('Titre de bourse manquant')
  if (!s.sourceUrl) throw new Error('Source officielle manquante')
  if (!s.sourceName) throw new Error('Nom de source manquant')

  const fp = fingerprint(s)

  const { rows } = await db.query(
    `
    INSERT INTO scholarships (
      fingerprint,
      title,
      provider,
      university,
      country,
      country_code,
      city,
      levels,
      fields,
      funding_type,
      amount,
      currency,
      tuition_covered,
      accommodation_covered,
      travel_covered,
      stipend_covered,
      description,
      deadline,
      application_url,
      source_url,
      source_name,
      image_url,
      status,
      last_verified_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24
    )

    ON CONFLICT (fingerprint)

    DO UPDATE SET
      title = EXCLUDED.title,
      provider = EXCLUDED.provider,
      university = EXCLUDED.university,
      country = EXCLUDED.country,
      country_code = EXCLUDED.country_code,
      city = EXCLUDED.city,
      levels = EXCLUDED.levels,
      fields = EXCLUDED.fields,
      funding_type = EXCLUDED.funding_type,
      amount = EXCLUDED.amount,
      currency = EXCLUDED.currency,
      tuition_covered = EXCLUDED.tuition_covered,
      accommodation_covered = EXCLUDED.accommodation_covered,
      travel_covered = EXCLUDED.travel_covered,
      stipend_covered = EXCLUDED.stipend_covered,
      description = EXCLUDED.description,
      deadline = EXCLUDED.deadline,
      application_url = EXCLUDED.application_url,
      source_url = EXCLUDED.source_url,
      source_name = EXCLUDED.source_name,
      image_url = COALESCE(
        scholarships.image_url,
        EXCLUDED.image_url
      ),
      status = EXCLUDED.status,
      last_verified_at = EXCLUDED.last_verified_at,
      updated_at = NOW()

    RETURNING id, created_at, updated_at
    `,
    [
      fp,

      s.title,
      s.provider || null,
      s.university || null,

      s.country || null,
      s.countryCode || null,
      s.city || null,

      Array.isArray(s.levels) ? s.levels : [],
      Array.isArray(s.fields) ? s.fields : [],

      s.fundingType || null,

      s.amount ?? null,
      s.currency || null,

      Boolean(s.tuitionCovered),
      Boolean(s.accommodationCovered),
      Boolean(s.travelCovered),
      Boolean(s.stipendCovered),

      s.description || null,

      s.deadline || null,

      s.applicationUrl || s.sourceUrl,

      s.sourceUrl,
      s.sourceName,

      s.imageUrl || null,

      s.status || 'unknown',

      s.lastVerifiedAt || new Date().toISOString(),
    ]
  )

  return rows[0]
}

async function closeExpiredScholarships() {
  const { rowCount } = await db.query(`
    UPDATE scholarships
       SET status = 'closed',
           updated_at = NOW()
     WHERE deadline IS NOT NULL
       AND deadline < NOW()
       AND status = 'open'
  `)

  return rowCount
}

module.exports = {
  fingerprint,
  saveScholarship,
  closeExpiredScholarships,
}
