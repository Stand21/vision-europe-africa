require('dotenv').config()
const fs = require('fs')
const path = require('path')
const db = require('../config/database')
const logger = require('../config/logger')

async function runMigrations() {
  const migDir = path.join(__dirname, '../../migrations')
  const files = fs.readdirSync(migDir).filter(f => f.endsWith('.sql')).sort()

  // Fail fast with a readable message rather than a cryptic query error.
  try {
    await db.connect()
  } catch (err) {
    logger.error('❌ Impossible de se connecter à PostgreSQL')
    console.error(`
   Détail   : ${err.message}
   Code     : ${err.code || 'n/a'}
   Cible    : ${process.env.DATABASE_URL
      ? 'DATABASE_URL'
      : `${process.env.DB_USER || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'vision_europe_africa'}`}
`)
    process.exit(1)
  }

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migDir, file), 'utf8')
    logger.info(`Running migration: ${file}`)
    try {
      await db.query(sql)
      logger.info(`✅ Migration complete: ${file}`)
    } catch (err) {
      // Ignore "already exists" / "duplicate" errors — migrations are idempotent.
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        logger.info(`↪️  Already applied (skipped): ${file}`)
        continue
      }
      logger.error(`❌ Migration failed: ${file}`)
      // winston swallows extra args — print the real cause on stderr.
      console.error(`
   Message  : ${err.message}
   Code     : ${err.code || 'n/a'}${err.detail ? `\n   Détail   : ${err.detail}` : ''}${err.hint ? `\n   Piste    : ${err.hint}` : ''}${err.position ? `\n   Position : caractère ${err.position}` : ''}
`)
      process.exit(1)
    }
  }
  process.exit(0)
}

runMigrations()
