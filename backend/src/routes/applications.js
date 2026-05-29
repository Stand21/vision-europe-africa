const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { submitApplication, validateApplication, getApplicationStatus } = require('../controllers/applicationController')

// POST /api/applications — Submit new application
router.post('/', upload.array('documents', 5), validateApplication, submitApplication)

// GET /api/applications/:id — Check application status (public)
router.get('/:id', getApplicationStatus)

module.exports = router
