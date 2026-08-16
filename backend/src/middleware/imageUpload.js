const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

/**
 * Téléversement d'images depuis l'administration (visuels de bourses,
 * photos de destinations).
 *
 * Volontairement distinct du téléversement des candidatures : ici seules les
 * images sont acceptées, jamais de PDF, et les fichiers vont dans un dossier
 * public séparé des documents personnels des candidats.
 */

const UPLOAD_DIR = path.join(__dirname, '../../uploads/media')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// Formats servis dans les pages (bourses, destinations) : uniquement ceux que
// tous les navigateurs peuvent afficher dans une balise <img>. AVIF/BMP/ICO en
// plus du classique JPG/PNG/WEBP/GIF/SVG.
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/avif', 'image/bmp', 'image/x-icon',
  'image/vnd.microsoft.icon', 'image/tiff',
])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
  'image/bmp': '.bmp',
  'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico',
  'image/tiff': '.tiff',
}

// Certains navigateurs ou fichiers déclarent un mimetype générique
// (application/octet-stream) malgré une vraie image : on se rabat sur
// l'extension du fichier pour l'identifier plutôt que de rejeter.
const EXT_BY_NAME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.jpe': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.bmp': 'image/bmp',
  '.ico': 'image/x-icon', '.tif': 'image/tiff', '.tiff': 'image/tiff',
}

function detectType(file) {
  if (ALLOWED_TYPES.has(file.mimetype)) return file.mimetype
  const ext = path.extname(file.originalname || '').toLowerCase()
  return EXT_BY_NAME[ext] || null
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Nom imprévisible : évite d'écraser un fichier ou de deviner une URL
    const unique = crypto.randomBytes(12).toString('hex')
    const type = detectType(file)
    const ext = (type && EXTENSIONS[type]) || path.extname(file.originalname || '').toLowerCase() || '.bin'
    cb(null, `${Date.now()}_${unique}${ext}`)
  },
})

const imageUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (detectType(file)) return cb(null, true)
    cb(new Error(`Format non accepté : ${file.mimetype || file.originalname}`), false)
  },
})

module.exports = { imageUpload, ALLOWED_TYPES, MAX_FILE_SIZE }
