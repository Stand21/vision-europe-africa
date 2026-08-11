const express = require('express')
const router = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const adminController = require('../controllers/adminController')
const currenciesController = require('../controllers/currenciesController')
const testimonialsController = require('../controllers/testimonialsController')
const destinationsController = require('../controllers/destinationsController')

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

// ── Testimonials management ────────────────────────────────────────────────────
router.get('/testimonials', testimonialsController.list)
router.post('/testimonials', testimonialsController.create)
router.patch('/testimonials/:id', testimonialsController.update)
router.delete('/testimonials/:id', testimonialsController.remove)

// ── Destinations management ────────────────────────────────────────────────────
router.get('/destinations', destinationsController.list)
router.post('/destinations', destinationsController.create)
router.patch('/destinations/:id', destinationsController.update)
router.delete('/destinations/:id', destinationsController.remove)

module.exports = router
