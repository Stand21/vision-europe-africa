const express = require('express')
const router = express.Router()
const currenciesController = require('../controllers/currenciesController')
const testimonialsController = require('../controllers/testimonialsController')
const destinationsController = require('../controllers/destinationsController')
const exchangeRates = require('../services/exchangeRateService')

router.get('/destinations', destinationsController.listPublic)

router.get('/currencies', currenciesController.listPublic)

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
