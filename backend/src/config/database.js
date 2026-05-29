const { Pool } = require('pg')
const logger = require('./logger')

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'vision_europe_africa',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

pool.on('error', (err) => {
  logger.error('PostgreSQL pool error:', err)
})

module.exports = {
  connect: async () => {
    const client = await pool.connect()
    client.release()
    return true
  },
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
}
