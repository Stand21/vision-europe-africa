const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const adminController = require('../controllers/adminController')
const currenciesController = require('../controllers/currenciesController')
const testimonialsController = require('../controllers/testimonialsController')
const destinationsController = require('../controllers/destinationsController')
const { imageUpload } = require('../middleware/imageUpload')
const scholarships = require('../services/scholarshipService')

// POST /api/admin/login
router.post('/login', adminController.login)

// All below require authentication
router.use(authenticate)

// GET /api/admin/stats
router.get('/stats', adminController.getStats)

// GET /api/admin/applications
router.get('/applications', adminController.getApplications)

// PATCH /api/admin/applications/:id/status
router.patch('/applications/:id/status', adminController.updateStatus)

// DELETE /api/admin/applications/:id
router.delete('/applications/:id', requireRole('superadmin'), async (req, res) => {
  const db = require('../config/database')
  try {
    await db.query('DELETE FROM applications WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' })
  }
})

// ── Currencies management ──────────────────────────────────────────────────────
router.get('/currencies', currenciesController.list)
router.post('/currencies', currenciesController.create)
router.patch('/currencies/:code', currenciesController.update)
router.delete('/currencies/:code', currenciesController.remove)

// ── Bourses : personnalisation ─────────────────────────────────────────────────
// Les bourses viennent d'une API externe en lecture seule. On expose ici la
// liste enrichie des personnalisations locales, et de quoi les modifier.
router.get('/scholarships', async (req, res) => {
  const db = require('../config/database')
  try {
    const list = await scholarships.list({ ...req.query, status: req.query.status || 'all', limit: req.query.limit || 100 })
    const { rows } = await db.query(
      'SELECT scholarship_ref, image_url, is_featured, is_hidden, sort_order FROM scholarship_overrides'
    )
    const map = new Map(rows.map(r => [String(r.scholarship_ref), r]))
    res.json({
      ...list,
      data: list.data.map(s => ({
        ...s,
        override: map.get(String(s.id)) || null,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/scholarships/:ref', async (req, res) => {
  const db = require('../config/database')
  const { ref } = req.params
  const { image_url, is_featured, is_hidden, sort_order, title_snapshot } = req.body

  try {
    await db.query(
      `INSERT INTO scholarship_overrides
         (scholarship_ref, title_snapshot, image_url, is_featured, is_hidden, sort_order)
       VALUES ($1, $2, $3, COALESCE($4,false), COALESCE($5,false), COALESCE($6,0))
       ON CONFLICT (scholarship_ref) DO UPDATE SET
         title_snapshot = COALESCE($2, scholarship_overrides.title_snapshot),
         image_url      = CASE WHEN $3::text IS NULL THEN scholarship_overrides.image_url
                               WHEN $3::text = ''   THEN NULL
                               ELSE $3::text END,
         is_featured    = COALESCE($4, scholarship_overrides.is_featured),
         is_hidden      = COALESCE($5, scholarship_overrides.is_hidden),
         sort_order     = COALESCE($6, scholarship_overrides.sort_order),
         updated_at     = NOW()`,
      [ref, title_snapshot ?? null, image_url ?? null,
       is_featured ?? null, is_hidden ?? null, sort_order ?? null]
    )
    scholarships.clearCache()   // le site public doit voir le changement tout de suite
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Téléversement d'images ─────────────────────────────────────────────────────
// Renvoie l'URL publique du fichier, à coller dans le champ image d'une
// destination ou d'une bourse.
router.post('/uploads/image', (req, res) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })

    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`
    res.status(201).json({
      url: `${base}/uploads/media/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
    })
  })
})

// ── Réglages du site ───────────────────────────────────────────────────────────
router.get('/settings', async (req, res) => {
  const db = require('../config/database')
  try {
    const { rows } = await db.query('SELECT key, value, description FROM settings ORDER BY key')
    res.json({ settings: rows })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/settings', async (req, res) => {
  const db = require('../config/database')
  const entries = Object.entries(req.body || {})
  if (!entries.length) return res.status(400).json({ error: 'No settings provided' })

  try {
    for (const [key, value] of entries) {
      await db.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value ?? '')]
      )
    }
    res.json({ success: true, updated: entries.length })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Destinations management ────────────────────────────────────────────────────
router.get('/destinations', destinationsController.list)
router.post('/destinations', destinationsController.create)
router.patch('/destinations/:id', destinationsController.update)
router.delete('/destinations/:id', destinationsController.remove)
// Bulk-delete every destination whose availability period has ended
router.post('/destinations/purge-expired', requireRole('superadmin'), destinationsController.purgeExpired)

// ── Testimonials management ────────────────────────────────────────────────────
router.get('/testimonials', testimonialsController.list)
router.post('/testimonials', testimonialsController.create)
router.patch('/testimonials/:id', testimonialsController.update)
router.delete('/testimonials/:id', testimonialsController.remove)

module.exports = router
