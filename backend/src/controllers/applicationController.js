const { v4: uuidv4 } = require('uuid')
const { body, validationResult } = require('express-validator')
const db = require('../config/database')
const telegramService = require('../services/telegramService')
const emailService = require('../services/emailService')
const logger = require('../config/logger')

// ── Validation Rules ───────────────────────────────────────────────────────────
exports.validateApplication = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 150 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('whatsapp').trim().notEmpty().withMessage('WhatsApp is required'),
  body('profile').isIn(['student', 'worker', 'visitor']).withMessage('Invalid profile'),
  body('destination').isIn(['germany', 'portugal', 'multiple']).withMessage('Invalid destination'),
  body('budget').optional().trim(),
]

// ── Submit Application ─────────────────────────────────────────────────────────
exports.submitApplication = async (req, res) => {
  // Validate
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: 'Validation failed', details: errors.array() })
  }

  const {
    fullName, email, phone, whatsapp, profile, destination,
    budget, field, profession, category, educationLevel,
    targetDegree, country, city, experience, workHours,
    expectedSalary, idNumber, motivationLetter, purpose, duration,
    signature,
  } = req.body

  // Collect uploaded file paths
  const documents = req.files ? req.files.map(f => ({
    filename: f.filename,
    originalname: f.originalname,
    path: f.path,
    size: f.size,
    mimetype: f.mimetype,
  })) : []

  const id = uuidv4()
  const now = new Date()

  try {
    await db.query(
      `INSERT INTO applications (
        id, full_name, email, phone, whatsapp, profile, destination,
        budget, field, profession, category, education_level, target_degree,
        country, city, experience, work_hours, expected_salary, id_number,
        motivation_letter, purpose, duration, signature, documents,
        status, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,
        'pending', $25, $25
      )`,
      [
        id, fullName, email, phone, whatsapp, profile, destination,
        budget, field || null, profession || null, category || null,
        educationLevel || null, targetDegree || null,
        country || null, city || null,
        experience ? parseInt(experience) : null,
        workHours || null, expectedSalary || null, idNumber || null,
        motivationLetter || null, purpose || null, duration || null,
        signature || null,
        JSON.stringify(documents),
        now,
      ]
    )

    // Fire-and-forget Telegram notification
    const application = {
      id, fullName, email, phone, whatsapp, profile, destination,
      budget, field, profession, category, idNumber,
      createdAt: now.toISOString(),
    }

    const dashboardUrl = process.env.DASHBOARD_URL || 'https://visioneuropeafrica.com'
    telegramService.sendApplicationNotification({ ...application, documentsCount: documents.length }, dashboardUrl).catch(err => {
      logger.error('Telegram notification error:', err)
    })

    // Auto confirmation email
    emailService.sendConfirmationEmail({ fullName, email, profile, destination, applicationId: id }).catch(err => {
      logger.error('Confirmation email error:', err)
    })

    // Activity log
    await db.query(
      'INSERT INTO activity_logs (action, entity, entity_id, metadata) VALUES ($1, $2, $3, $4)',
      ['application_submitted', 'application', id, JSON.stringify({ profile, destination, email })]
    ).catch(() => {}) // non-critical

    logger.info(`Application submitted: ${id} — ${fullName} (${profile}, ${destination})`)

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Our team will contact you within 48 hours.',
      applicationId: id,
    })
  } catch (err) {
    logger.error('Application submission error:', err)
    return res.status(500).json({ error: 'Failed to submit application. Please try again.' })
  }
}

// ── Get Application (user) ─────────────────────────────────────────────────────
exports.getApplicationStatus = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await db.query(
      'SELECT id, full_name, email, profile, destination, status, created_at FROM applications WHERE id = $1',
      [id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Application not found' })
    res.json(rows[0])
  } catch (err) {
    logger.error('Get application error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}
