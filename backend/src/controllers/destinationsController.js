const { v4: uuidv4 } = require('uuid')
const db = require('../config/database')
const logger = require('../config/logger')

const FIELDS = `id, code, name, flag, tagline, description,
  highlights, programs,
  stat_label as "statLabel", stat_sub as "statSub", image,
  is_active as "isActive", sort_order as "sortOrder", created_at as "createdAt"`

// ── Public: active destinations only ───────────────────────────────────────────
exports.listPublic = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT ${FIELDS} FROM destinations WHERE is_active = true ORDER BY sort_order, name`
    )
    res.json(rows)
  } catch (err) {
    logger.error('List destinations error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: all destinations ─────────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT ${FIELDS} FROM destinations ORDER BY sort_order, name`)
    res.json({ destinations: rows })
  } catch (err) {
    logger.error('List destinations (admin) error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: create ───────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  const {
    code, name, flag, tagline, description,
    highlights = [], programs = [],
    statLabel, statSub, image, isActive = true, sortOrder = 0,
  } = req.body
  if (!code || !name) return res.status(400).json({ error: 'code and name are required' })

  const id = uuidv4()
  try {
    await db.query(
      `INSERT INTO destinations (id, code, name, flag, tagline, description, highlights, programs,
        stat_label, stat_sub, image, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, code.trim().toUpperCase(), name.trim(), flag || null, tagline || null, description || null,
       JSON.stringify(highlights), JSON.stringify(programs),
       statLabel || null, statSub || null, image || null, isActive, sortOrder]
    )
    res.status(201).json({ success: true, id })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Destination code already exists' })
    }
    logger.error('Create destination error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: update ───────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  const { id } = req.params
  const {
    code, name, flag, tagline, description,
    highlights, programs, statLabel, statSub, image, isActive, sortOrder,
  } = req.body

  try {
    const { rowCount } = await db.query(
      `UPDATE destinations SET
        code        = COALESCE($2, code),
        name        = COALESCE($3, name),
        flag        = COALESCE($4, flag),
        tagline     = COALESCE($5, tagline),
        description = COALESCE($6, description),
        highlights  = COALESCE($7, highlights),
        programs    = COALESCE($8, programs),
        stat_label  = COALESCE($9, stat_label),
        stat_sub    = COALESCE($10, stat_sub),
        image       = COALESCE($11, image),
        is_active   = COALESCE($12, is_active),
        sort_order  = COALESCE($13, sort_order),
        updated_at  = NOW()
       WHERE id = $1`,
      [id, code ?? null, name ?? null, flag ?? null, tagline ?? null, description ?? null,
       highlights ? JSON.stringify(highlights) : null,
       programs ? JSON.stringify(programs) : null,
       statLabel ?? null, statSub ?? null, image ?? null, isActive ?? null, sortOrder ?? null]
    )
    if (!rowCount) return res.status(404).json({ error: 'Destination not found' })
    res.json({ success: true })
  } catch (err) {
    logger.error('Update destination error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: delete ───────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  const { id } = req.params
  try {
    const { rowCount } = await db.query('DELETE FROM destinations WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Destination not found' })
    res.json({ success: true })
  } catch (err) {
    logger.error('Delete destination error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}