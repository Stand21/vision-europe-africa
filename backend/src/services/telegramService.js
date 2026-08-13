const TelegramBot = require('node-telegram-bot-api')
const logger = require('../config/logger')

let bot = null

function getBot() {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    // Polling mode lets the bot receive the inline Approve/Reject button callbacks.
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })
    // Without a listener, an unhandled 'polling_error' (e.g. two instances
    // polling the same token — a 409 conflict) crashes the whole process.
    bot.on('polling_error', err => {
      logger.error('Telegram polling error (bot notifications disabled until it clears):', err.message)
    })
  }
  return bot
}

const PROFILE_EMOJI = { student: '🎓', worker: '👷', visitor: '✈️' }
const DEST_EMOJI = { germany: '🇩🇪', portugal: '🇵🇹', multiple: '🌍' }

const CURRENCY_SYMBOLS = {
  EUR: '€', USD: '$', GBP: '£', CHF: 'Fr',
  XOF: 'CFA', XAF: 'CFA', NGN: '₦', GHS: '₵',
  KES: 'KSh', TZS: 'TSh', UGX: 'USh', ZAR: 'R',
  CDF: 'FC', MAD: 'DH', DZD: 'DA', EGP: 'E£',
}

/**
 * Send a new application notification to the Telegram admin group.
 */
async function sendApplicationNotification(application, dashboardUrl) {
  const instance = getBot()
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!instance || !chatId) {
    logger.warn('Telegram not configured — skipping notification')
    return
  }

  const {
    id, fullName, profile, email, phone, whatsapp,
    destination, budget, currency, field, profession, category,
    idNumber, createdAt, documentsCount,
  } = application

  const profileEmoji = PROFILE_EMOJI[profile] || '📋'
  const destEmoji = DEST_EMOJI[destination] || '🌍'
  const budgetLabel = budget ? `${CURRENCY_SYMBOLS[currency] || (currency ? `${currency} ` : '€')}${budget}` : 'N/A'

  const message = `
${profileEmoji} *NOUVEAU DOSSIER — Vision Europe Africa*
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Nom:* ${fullName}
📧 *Email:* ${email}
📞 *Téléphone:* ${phone}
💬 *WhatsApp:* wa.me/${whatsapp?.replace(/[^0-9]/g, '')}

${profileEmoji} *Profil:* ${profile?.toUpperCase()}
${destEmoji} *Destination:* ${destination?.toUpperCase()}
${field ? `📚 *Filière:* ${field}` : ''}${profession ? `\n💼 *Métier:* ${profession}` : ''}${category ? `\n🏷️ *Catégorie:* ${category}` : ''}
💰 *Budget:* ${budgetLabel}
🪪 *N° pièce d'identité:* ${idNumber || 'N/A'}
📎 *Documents joints:* ${documentsCount || 0} fichier(s)

📅 *Soumis le:* ${new Date(createdAt).toLocaleString('fr-FR')}
🔗 *Dashboard:* ${dashboardUrl}/admin
━━━━━━━━━━━━━━━━━━━━━━━━
`

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `approve_${id}` },
        { text: '❌ Reject',  callback_data: `reject_${id}` },
      ],
      [
        { text: '💬 Contact on WhatsApp', url: `https://wa.me/${whatsapp?.replace(/[^0-9]/g, '')}` },
        { text: '📋 View Dashboard', url: `${dashboardUrl}/admin` },
      ],
    ],
  }

  try {
    await instance.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    })
    logger.info(`Telegram notification sent for application ${id}`)
  } catch (err) {
    logger.error('Telegram notification failed:', err.message)
  }
}

/**
 * Send a status update notification.
 */
async function sendStatusUpdate(application, newStatus) {
  const instance = getBot()
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!instance || !chatId) return

  const emoji = newStatus === 'approved' ? '✅' : newStatus === 'rejected' ? '❌' : '🔄'

  const message = `${emoji} *Status Updated*\n\n👤 ${application.fullName}\n📧 ${application.email}\n🔄 Status: *${newStatus.toUpperCase()}*`

  try {
    await instance.sendMessage(chatId, message, { parse_mode: 'Markdown' })
  } catch (err) {
    logger.error('Telegram status update failed:', err.message)
  }
}

/**
 * Handle callback queries (approve/reject buttons).
 *
 * `updateStatusFn(id, status)` must update the application status in the DB
 * and is wired to the admin controller in src/index.js.
 */
function setupCallbackHandler(updateStatusFn) {
  const instance = getBot()
  if (!instance) return

  instance.on('callback_query', async (query) => {
    const [action, appId] = String(query.data || '').split('_')
    if (action !== 'approve' && action !== 'reject') return

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    try {
      const ok = await updateStatusFn(appId, newStatus)
      await instance.answerCallbackQuery(query.id, {
        text: ok ? `Application ${action}d ✅` : 'Application not found',
      })
      if (ok) {
        const safeName = query.message?.chat?.id
          ? await (async () => {
              const db = require('../config/database')
              const { rows } = await db.query('SELECT full_name FROM applications WHERE id = $1', [appId])
              return rows.length ? rows[0].full_name : null
            })()
          : null
        await instance.sendMessage(
          query.message?.chat?.id,
          `${action === 'approve' ? '✅' : '❌'} ${safeName ? `Dossier de *${safeName}* ` : ''}${newStatus.toUpperCase()} depuis le bot.`,
          { parse_mode: 'Markdown' }
        )
      }
    } catch (err) {
      logger.error('Telegram callback error:', err.message)
    }
  })
}

module.exports = {
  sendApplicationNotification,
  sendStatusUpdate,
  setupCallbackHandler,
}
