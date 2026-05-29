require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const path = require('path')

const logger = require('./config/logger')
const db = require('./config/database')

// Route imports
const authRoutes = require('./routes/auth')
const applicationRoutes = require('./routes/applications')
const adminRoutes = require('./routes/admin')
const publicRoutes = require('./routes/public')

const app = express()
const PORT = process.env.PORT || 5000

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts.' },
})

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many applications submitted. Please wait.' },
})

app.use(globalLimiter)
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static files (uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff')
    res.set('Content-Disposition', 'attachment')
  }
}))

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes)
app.use('/api/applications', submitLimiter, applicationRoutes)
app.use('/api/admin',        adminRoutes)
app.use('/api',              publicRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Vision Europe Africa API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ── Error Handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err.stack)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// ── Start ──────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await db.connect()
    logger.info('✅ Database connected')

    app.listen(PORT, () => {
      logger.info(`🚀 Vision Europe Africa API running on port ${PORT}`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (err) {
    logger.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

start()

module.exports = app
