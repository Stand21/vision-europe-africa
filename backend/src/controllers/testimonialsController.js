const { v4: uuidv4 } = require('uuid')
const db = require('../config/database')
const logger = require('../config/logger')

const FIELDS = 'id, name, country, destination, role, rating, text, photo_url as "photoUrl", video_url as "videoUrl", is_active as "isActive", sort_order as "sortOrder", created_at as "createdAt"'

// ── Public: active testimonials only ───────────────────────────────────────────
exports.listPublic = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT ${FIELDS} FROM testimonials WHERE is_active = true ORDER BY sort_order, created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    logger.error('List testimonials error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: all testimonials ────────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT ${FIELDS} FROM testimonials ORDER BY sort_order, created_at DESC`)
    res.json({ testimonials: rows })
  } catch (err) {
    logger.error('List testimonials (admin) error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: create ──────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  const { name, country, destination, role, rating = 5, text, photoUrl, videoUrl, isActive = true, sortOrder = 0 } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const id = uuidv4()
  try {
    await db.query(
      `INSERT INTO testimonials (id, name, country, destination, role, rating, text, photo_url, video_url, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, name, country || null, destination || null, role || null, rating, text || null, photoUrl || null, videoUrl || null, isActive, sortOrder]
    )
    res.status(201).json({ success: true, id })
  } catch (err) {
    logger.error('Create testimonial error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: update ──────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  const { id } = req.params
  const { name, country, destination, role, rating, text, photoUrl, videoUrl, isActive, sortOrder } = req.body

  try {
    const { rowCount } = await db.query(
      `UPDATE testimonials SET
        name        = COALESCE($2, name),
        country     = COALESCE($3, country),
        destination = COALESCE($4, destination),
        role        = COALESCE($5, role),
        rating      = COALESCE($6, rating),
        text        = COALESCE($7, text),
        photo_url   = COALESCE($8, photo_url),
        video_url   = COALESCE($9, video_url),
        is_active   = COALESCE($10, is_active),
        sort_order  = COALESCE($11, sort_order),
        updated_at  = NOW()
       WHERE id = $1`,
      [id, name ?? null, country ?? null, destination ?? null, role ?? null, rating ?? null,
       text ?? null, photoUrl ?? null, videoUrl ?? null, isActive ?? null, sortOrder ?? null]
    )
    if (!rowCount) return res.status(404).json({ error: 'Testimonial not found' })
    res.json({ success: true })
  } catch (err) {
    logger.error('Update testimonial error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: delete ──────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  const { id } = req.params
  try {
    const { rowCount } = await db.query('DELETE FROM testimonials WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Testimonial not found' })
    res.json({ success: true })
  } catch (err) {
    logger.error('Delete testimonial error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
