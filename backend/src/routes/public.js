const express = require('express')
const router = express.Router()
const currenciesController = require('../controllers/currenciesController')
const testimonialsController = require('../controllers/testimonialsController')
const destinationsController = require('../controllers/destinationsController')
const exchangeRates = require('../services/exchangeRateService')
const scholarships = require('../services/scholarshipService')

router.get('/destinations', destinationsController.listPublic)

router.get('/currencies', currenciesController.listPublic)

// ── Bourses d'études (relais vers l'API Ma Bourse d'Études) ───────────────────
router.get('/scholarships', async (req, res) => {
  const payload = await scholarships.list(req.query)
  res.set('Cache-Control', 'public, max-age=300')
  res.json(payload)
})

router.get('/scholarships/countries', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600')
  res.json(await scholarships.countries())
})

router.get('/scholarships/:id', async (req, res) => {
  const item = await scholarships.getById(req.params.id)
  if (!item) return res.status(404).json({ error: 'Bourse introuvable' })
  res.set('Cache-Control', 'public, max-age=300')
  res.json(item)
})

// Réglages publics affichés sur le site (numéro WhatsApp…)
router.get('/settings', async (req, res) => {
  const db = require('../config/database')
  try {
    const { rows } = await db.query(
      `SELECT key, value FROM settings WHERE key IN ('whatsapp_number', 'site_name', 'response_time_hours')`
    )
    const out = {}
    for (const r of rows) out[r.key] = r.value
    res.set('Cache-Control', 'public, max-age=300')
    res.json(out)
  } catch {
    res.json({})
  }
})

// Taux de change, base EUR — rafraîchis au plus une fois par jour
router.get('/rates', async (req, res) => {
  try {
    const payload = await exchangeRates.getRates()
    res.set('Cache-Control', 'public, max-age=3600')
    res.json(payload)
  } catch (err) {
    res.status(500).json({ error: 'Rates unavailable' })
  }
})
router.get('/testimonials', testimonialsController.listPublic)

module.exports = router
