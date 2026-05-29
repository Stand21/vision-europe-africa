const TelegramBot = require('node-telegram-bot-api')
const logger = require('../config/logger')

let bot = null

function getBot() {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
  }
  return bot
}

const PROFILE_EMOJI = { student: '🎓', worker: '👷', visitor: '✈️' }
const DEST_EMOJI = { germany: '🇩🇪', portugal: '🇵🇹', multiple: '🌍' }

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
    destination, budget, field, profession, category,
    idNumber, createdAt,
  } = application

  const profileEmoji = PROFILE_EMOJI[profile] || '📋'
  const destEmoji = DEST_EMOJI[destination] || '🌍'

  const message = `
${profileEmoji} *NEW APPLICATION — Vision Europe Africa*
━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${fullName}
📧 *Email:* ${email}
📞 *Phone:* ${phone}
💬 *WhatsApp:* wa.me/${whatsapp?.replace(/[^0-9]/g, '')}

${profileEmoji} *Profile:* ${profile?.toUpperCase()}
${destEmoji} *Destination:* ${destination?.toUpperCase()}
${field ? `📚 *Field:* ${field}` : ''}${profession ? `\n💼 *Profession:* ${profession}` : ''}${category ? `\n🏷️ *Category:* ${category}` : ''}
💰 *Budget:* €${budget}
🪪 *ID Number:* ${idNumber || 'N/A'}

📅 *Submitted:* ${new Date(createdAt).toLocaleString('fr-FR')}
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
 */
function setupCallbackHandler(updateStatusFn) {
  const instance = getBot()
  if (!instance) return

  // For webhook-based bots use setWebHook instead of polling
  // instance.on('callback_query', async (query) => {
  //   const [action, appId] = query.data.split('_')
  //   if (action === 'approve' || action === 'reject') {
  //     await updateStatusFn(appId, action === 'approve' ? 'approved' : 'rejected')
  //     await instance.answerCallbackQuery(query.id, { text: `Application ${action}d!` })
  //   }
  // })
}

module.exports = {
  sendApplicationNotification,
  sendStatusUpdate,
  setupCallbackHandler,
}
