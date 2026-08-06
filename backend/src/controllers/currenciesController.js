const db = require('../config/database')
const logger = require('../config/logger')

// ── Public: active currencies only ────────────────────────────────────────────
exports.listPublic = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT code, symbol, label FROM currencies WHERE is_active = true ORDER BY sort_order, code'
    )
    res.json(rows)
  } catch (err) {
    logger.error('List currencies error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: all currencies ──────────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT code, symbol, label, is_active, sort_order FROM currencies ORDER BY sort_order, code'
    )
    res.json({ currencies: rows })
  } catch (err) {
    logger.error('List currencies (admin) error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: create ──────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  const { code, symbol, label, is_active = true, sort_order = 0 } = req.body
  if (!code || !symbol || !label) {
    return res.status(400).json({ error: 'code, symbol and label are required' })
  }

  try {
    await db.query(
      'INSERT INTO currencies (code, symbol, label, is_active, sort_order) VALUES ($1, $2, $3, $4, $5)',
      [code.trim().toUpperCase(), symbol.trim(), label.trim(), is_active, sort_order]
    )
    res.status(201).json({ success: true })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Currency code already exists' })
    }
    logger.error('Create currency error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: update ──────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  const { code } = req.params
  const { symbol, label, is_active, sort_order } = req.body

  try {
    const { rowCount } = await db.query(
      `UPDATE currencies SET
        symbol    = COALESCE($2, symbol),
        label     = COALESCE($3, label),
        is_active = COALESCE($4, is_active),
        sort_order = COALESCE($5, sort_order)
       WHERE code = $1`,
      [code.toUpperCase(), symbol ?? null, label ?? null, is_active ?? null, sort_order ?? null]
    )
    if (!rowCount) return res.status(404).json({ error: 'Currency not found' })
    res.json({ success: true })
  } catch (err) {
    logger.error('Update currency error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Admin: delete ──────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  const { code } = req.params
  try {
    const { rowCount } = await db.query('DELETE FROM currencies WHERE code = $1', [code.toUpperCase()])
    if (!rowCount) return res.status(404).json({ error: 'Currency not found' })
    res.json({ success: true })
  } catch (err) {
    logger.error('Delete currency error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
