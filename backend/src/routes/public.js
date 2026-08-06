const express = require('express')
const router = express.Router()
const currenciesController = require('../controllers/currenciesController')
const testimonialsController = require('../controllers/testimonialsController')

router.get('/destinations', (req, res) => {
  res.json([
    {
      code: 'DE', name: 'Germany', flag: '🇩🇪',
      tagline: 'Excellence & Opportunity',
      highlights: ['Avg. salary €45,000/yr', 'Free/low-cost universities', 'Opportunity Card', 'Strong job market'],
      programs: ['Work Visa', 'Student Visa', 'Opportunity Card', 'EU Blue Card'],
    },
    {
      code: 'PT', name: 'Portugal', flag: '🇵🇹',
      tagline: 'Your First Step Into Europe',
      highlights: ['Affordable living', 'D7 Visa', 'Student friendly', 'EU citizenship path'],
      programs: ['D7 Visa', 'Student Visa', 'Job Seeker Visa', 'Startup Visa'],
    },
  ])
})

router.get('/currencies', currenciesController.listPublic)
router.get('/testimonials', testimonialsController.listPublic)

module.exports = router
