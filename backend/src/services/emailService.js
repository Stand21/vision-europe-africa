const nodemailer = require('nodemailer')
const logger = require('../config/logger')

function getTransporter() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const PROFILE_LABELS = { student: 'Étudiant(e)', worker: 'Travailleur/se', visitor: 'Visiteur/se' }
const DEST_LABELS = { germany: '🇩🇪 Allemagne', portugal: '🇵🇹 Portugal', multiple: '🌍 Allemagne & Portugal' }

async function sendConfirmationEmail(application) {
  const transporter = getTransporter()
  if (!transporter) {
    logger.warn('SMTP not configured — skipping confirmation email')
    return
  }

  const { fullName, email, profile, destination, applicationId } = application
  const profileLabel = PROFILE_LABELS[profile] || profile
  const destLabel = DEST_LABELS[destination] || destination

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a56db,#1e40af);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">🌍</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Vision Europe Africa</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Votre passerelle vers l'Europe</p>
    </div>

    <!-- Body -->
    <div style="background:#111827;border-radius:0 0 16px 16px;padding:40px;">
      <h2 style="color:#fff;font-size:20px;margin:0 0 16px;">Bonjour ${fullName} 👋</h2>
      <p style="color:#d1d5db;line-height:1.6;margin:0 0 24px;">
        Nous avons bien reçu votre dossier de candidature. Notre équipe va l'examiner et vous contactera dans les <strong style="color:#fbbf24;">48 heures</strong>.
      </p>

      <!-- Details Card -->
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
        <h3 style="color:#c9a227;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Résumé de votre dossier</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#9ca3af;padding:6px 0;font-size:14px;width:40%;">Référence</td>
            <td style="color:#fff;padding:6px 0;font-size:14px;font-family:monospace;">${applicationId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="color:#9ca3af;padding:6px 0;font-size:14px;">Profil</td>
            <td style="color:#fff;padding:6px 0;font-size:14px;">${profileLabel}</td>
          </tr>
          <tr>
            <td style="color:#9ca3af;padding:6px 0;font-size:14px;">Destination</td>
            <td style="color:#fff;padding:6px 0;font-size:14px;">${destLabel}</td>
          </tr>
          <tr>
            <td style="color:#9ca3af;padding:6px 0;font-size:14px;">Statut</td>
            <td style="color:#fbbf24;padding:6px 0;font-size:14px;font-weight:600;">⏳ En cours d'examen</td>
          </tr>
        </table>
      </div>

      <!-- Steps -->
      <div style="margin-bottom:24px;">
        <h3 style="color:#c9a227;margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.1em;">Prochaines étapes</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <div style="background:#1a56db;border-radius:50%;width:28px;height:28px;min-width:28px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">1</div>
            <div><p style="color:#d1d5db;margin:0;font-size:14px;line-height:1.5;padding-top:4px;">Examen de votre dossier par notre équipe (<strong style="color:#fff;">48h</strong>)</p></div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <div style="background:#1a56db;border-radius:50%;width:28px;height:28px;min-width:28px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">2</div>
            <div><p style="color:#d1d5db;margin:0;font-size:14px;line-height:1.5;padding-top:4px;">Entretien téléphonique ou WhatsApp avec un conseiller</p></div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <div style="background:#1a56db;border-radius:50%;width:28px;height:28px;min-width:28px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">3</div>
            <div><p style="color:#d1d5db;margin:0;font-size:14px;line-height:1.5;padding-top:4px;">Démarrage des démarches d'immigration</p></div>
          </div>
        </div>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;margin:0;">
        Pour toute question, répondez à cet email ou contactez-nous sur WhatsApp.<br>
        L'équipe <strong style="color:#c9a227;">Vision Europe Africa</strong>
      </p>
    </div>
  </div>
</body>
</html>
`

  try {
    await transporter.sendMail({
      from: `"Vision Europe Africa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `✅ Dossier reçu — Vision Europe Africa | Réf. ${applicationId}`,
      html,
    })
    logger.info(`Confirmation email sent to ${email}`)
  } catch (err) {
    logger.error('Email confirmation failed:', err.message)
  }
}

async function sendStatusUpdateEmail(application, newStatus, adminNote) {
  const transporter = getTransporter()
  if (!transporter) return

  const { fullName, email } = application

  const statusConfig = {
    approved: { emoji: '🎉', label: 'APPROUVÉ', color: '#22c55e', message: 'Félicitations ! Votre dossier a été approuvé. Notre équipe va vous contacter très prochainement pour les prochaines étapes.' },
    rejected: { emoji: '❌', label: 'NON RETENU', color: '#ef4444', message: 'Après examen, nous ne pouvons pas donner suite à votre dossier pour le moment. N\'hésitez pas à nous recontacter dans 3 mois.' },
    reviewing: { emoji: '🔍', label: 'EN RÉVISION', color: '#3b82f6', message: 'Votre dossier est en cours d\'examen approfondi par notre équipe.' },
  }

  const config = statusConfig[newStatus] || { emoji: '📋', label: newStatus.toUpperCase(), color: '#6b7280', message: 'Le statut de votre dossier a été mis à jour.' }

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#0a0f1e;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1a56db,#1e40af);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">${config.emoji}</div>
      <h1 style="color:#fff;margin:0;font-size:20px;">Mise à jour de votre dossier</h1>
    </div>
    <div style="background:#111827;border-radius:0 0 16px 16px;padding:40px;">
      <h2 style="color:#fff;margin:0 0 16px;">Bonjour ${fullName},</h2>
      <div style="background:rgba(255,255,255,0.05);border-left:4px solid ${config.color};border-radius:0 8px 8px 0;padding:16px;margin-bottom:24px;">
        <p style="color:${config.color};font-weight:700;margin:0 0 8px;font-size:16px;">Statut : ${config.label}</p>
        <p style="color:#d1d5db;margin:0;font-size:14px;line-height:1.6;">${config.message}</p>
      </div>
      ${adminNote ? `<div style="background:rgba(201,162,39,0.1);border:1px solid rgba(201,162,39,0.3);border-radius:8px;padding:16px;margin-bottom:24px;"><p style="color:#fbbf24;margin:0 0 4px;font-size:12px;font-weight:600;">NOTE DE NOTRE ÉQUIPE</p><p style="color:#d1d5db;margin:0;font-size:14px;">${adminNote}</p></div>` : ''}
      <p style="color:#6b7280;font-size:13px;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;margin:0;">
        L'équipe <strong style="color:#c9a227;">Vision Europe Africa</strong>
      </p>
    </div>
  </div>
</body>
</html>
`

  try {
    await transporter.sendMail({
      from: `"Vision Europe Africa" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${config.emoji} Dossier ${config.label} — Vision Europe Africa`,
      html,
    })
    logger.info(`Status email sent to ${email} — ${newStatus}`)
  } catch (err) {
    logger.error('Status email failed:', err.message)
  }
}

module.exports = { sendConfirmationEmail, sendStatusUpdateEmail }
