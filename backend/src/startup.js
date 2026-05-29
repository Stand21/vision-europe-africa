/**
 * Startup script — runs DB migrations automatically on Render deploy.
 */
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const db = require('./config/database')

async function runMigrationsAndStart() {
  // Wait for DB to be ready (Render cold-start can be slow)
  let retries = 10
  while (retries > 0) {
    try {
      await db.connect()
      console.log('✅ Database connected')
      break
    } catch (err) {
      retries--
      if (retries === 0) throw err
      console.log(`⏳ Waiting for database... (${retries} retries left)`)
      await new Promise(r => setTimeout(r, 3000))
    }
  }

  // Run migrations
  const migDir = path.join(__dirname, '../migrations')
  if (fs.existsSync(migDir)) {
    const files = fs.readdirSync(migDir).filter(f => f.endsWith('.sql')).sort()
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migDir, file), 'utf8')
      try {
        await db.query(sql)
        console.log(`✅ Migration OK: ${file}`)
      } catch (err) {
        // Ignore "already exists" errors — idempotent migrations
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.error(`⚠️  Migration warning (${file}):`, err.message)
        }
      }
    }
  }

  // Start the actual server
  require('./index')
}

runMigrationsAndStart().catch(err => {
  console.error('❌ Startup failed:', err)
  process.exit(1)
})
