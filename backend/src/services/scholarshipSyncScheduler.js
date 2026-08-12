const logger = require('../config/logger')
const scholarships = require('./scholarshipService')

let timer = null

/**
 * Rafraîchit périodiquement la table `scholarships` depuis les sources
 * officielles. Désactivé par défaut : activer avec ENABLE_SCHOLARSHIP_SYNC=true.
 * Intervalle réglable via SCHOLARSHIP_SYNC_INTERVAL_HOURS (défaut 6h).
 */
function scheduleScholarshipSync() {
  if (timer) return timer

  const hours = Number(process.env.SCHOLARSHIP_SYNC_INTERVAL_HOURS || 6)
  const intervalMs = hours * 60 * 60 * 1000

  const run = async () => {
    try {
      const { runSync } = require('../scripts/sync-scholarships')
      await runSync()
      scholarships.clearCache()
    } catch (err) {
      logger.error('Scholarship sync failed:', err)
    }
  }

  logger.info(`🔄 Scholarship sync scheduled every ${hours}h`)
  run()
  timer = setInterval(run, intervalMs)
  return timer
}

module.exports = { scheduleScholarshipSync }
