const express = require('express')
const router = express.Router()
const currenciesController = require('../controllers/currenciesController')
const testimonialsController = require('../controllers/testimonialsController')
const destinationsController = require('../controllers/destinationsController')

router.get('/destinations', destinationsController.listPublic)

router.get('/currencies', currenciesController.listPublic)
router.get('/testimonials', testimonialsController.listPublic)

module.exports = router
