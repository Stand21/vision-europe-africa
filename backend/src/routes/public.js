const express = require('express')
const router = express.Router()

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

router.get('/testimonials', (req, res) => {
  res.json([
    { name: 'Amara Diallo', country: 'Kinshasa, DRC', destination: 'Germany', role: 'Software Engineer', rating: 5, text: 'Vision Europe Africa changed my life. I now work in Berlin!' },
    { name: 'Marie-Claire', country: 'Cameroon', destination: 'Portugal', role: 'Student', rating: 5, text: 'Obtained my student visa for Lisbon in 3 months. Excellent service!' },
  ])
})

module.exports = router
