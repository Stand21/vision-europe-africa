const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/database')
const telegramService = require('../services/telegramService')
const emailService = require('../services/emailService')
const logger = require('../config/logger')

const JWT_SECRET = process.env.JWT_SECRET || 'vea_secret_change_me'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h'

// ── Admin Login ────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
      [email.trim().toLowerCase()]
    )

    if (!rows.length) {
      logger.warn(`Failed admin login attempt: ${email}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const admin = rows[0]
    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) {
      logger.warn(`Failed admin password for: ${email}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, name: admin.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    // Update last login
    await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id])

    // Activity log
    await db.query(
      'INSERT INTO activity_logs (action, entity, entity_id, metadata) VALUES ($1, $2, $3, $4)',
      ['admin_login', 'admin', admin.id, JSON.stringify({ ip: req.ip })]
    ).catch(() => {})

    logger.info(`Admin login: ${admin.email}`)

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (err) {
    logger.error('Admin login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Get All Applications ───────────────────────────────────────────────────────
exports.getApplications = async (req, res) => {
  const { status, profile, destination, search, page = 1, limit = 20 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = `SELECT id, full_name as "fullName", email, phone, whatsapp,
    profile, destination, budget, field, profession, category,
    education_level as "educationLevel", target_degree as "targetDegree",
    country, city, experience, work_hours as "workHours", expected_salary as "expectedSalary",
    id_number as "idNumber", motivation_letter as "motivationLetter",
    purpose, duration, documents, admin_notes as "adminNotes",
    status, created_at as "createdAt", updated_at as "updatedAt"
    FROM applications WHERE 1=1`
  const params = []
  let i = 1

  if (status && status !== 'all') { query += ` AND status = $${i++}`; params.push(status) }
  if (profile && profile !== 'all') { query += ` AND profile = $${i++}`; params.push(profile) }
  if (destination && destination !== 'all') { query += ` AND destination = $${i++}`; params.push(destination) }
  if (search) {
    query += ` AND (LOWER(full_name) LIKE $${i} OR LOWER(email) LIKE $${i})`
    params.push(`%${search.toLowerCase()}%`); i++
  }

  const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM')
  query += ` ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`
  params.push(parseInt(limit), offset)

  try {
    const [{ rows }, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params.slice(0, -2)),
    ])

    res.json({
      applications: rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
    })
  } catch (err) {
    logger.error('Get applications error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Update Application Status ──────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  const { id } = req.params
  const { status, notes } = req.body

  const validStatuses = ['pending', 'reviewing', 'approved', 'rejected']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  try {
    const { rows } = await db.query(
      `UPDATE applications SET status = $1, admin_notes = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, notes || null, id]
    )

    if (!rows.length) return res.status(404).json({ error: 'Application not found' })

    // Notify via Telegram + Email
    const app = rows[0]
    telegramService.sendStatusUpdate(app, status).catch(() => {})
    emailService.sendStatusUpdateEmail(
      { fullName: app.full_name, email: app.email },
      status,
      notes
    ).catch(() => {})

    // Activity log
    await db.query(
      'INSERT INTO activity_logs (action, entity, entity_id, metadata) VALUES ($1, $2, $3, $4)',
      ['status_updated', 'application', id, JSON.stringify({ status, by: req.admin.email })]
    ).catch(() => {})

    logger.info(`Application ${id} status updated to ${status} by ${req.admin.email}`)

    res.json({ success: true, application: rows[0] })
  } catch (err) {
    logger.error('Update status error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── Dashboard Stats ────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [totals, byProfile, byDest, monthly] = await Promise.all([
      db.query(`SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
        COUNT(*) FILTER (WHERE status = 'approved')::int as approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected
        FROM applications`),
      db.query(`SELECT profile as name, COUNT(*)::int as value FROM applications GROUP BY profile`),
      db.query(`SELECT destination as name, COUNT(*)::int as value FROM applications GROUP BY destination`),
      db.query(`SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
        COUNT(*)::int as applications,
        COUNT(*) FILTER (WHERE status = 'approved')::int as approved
        FROM applications
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)`),
    ])

    res.json({
      ...totals.rows[0],
      byProfile: byProfile.rows,
      byDestination: byDest.rows,
      monthly: monthly.rows,
    })
  } catch (err) {
    logger.error('Stats error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
