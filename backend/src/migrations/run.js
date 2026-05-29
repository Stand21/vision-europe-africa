require('dotenv').config()
const fs = require('fs')
const path = require('path')
const db = require('../config/database')
const logger = require('../config/logger')

async function runMigrations() {
  const migDir = path.join(__dirname, '../../migrations')
  const files = fs.readdirSync(migDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migDir, file), 'utf8')
    logger.info(`Running migration: ${file}`)
    try {
      await db.query(sql)
      logger.info(`✅ Migration complete: ${file}`)
    } catch (err) {
      logger.error(`❌ Migration failed: ${file}`, err.message)
      process.exit(1)
    }
  }
  process.exit(0)
}

runMigrations()
