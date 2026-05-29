const { Pool } = require('pg')
const logger = require('./logger')

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'vision_europe_africa',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }

const pool = new Pool(poolConfig)

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
