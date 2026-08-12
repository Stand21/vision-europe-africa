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

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Nom imprévisible : évite d'écraser un fichier ou de deviner une URL
    const unique = crypto.randomBytes(12).toString('hex')
    const ext = EXTENSIONS[file.mimetype] || path.extname(file.originalname).toLowerCase() || '.bin'
    cb(null, `${Date.now()}_${unique}${ext}`)
  },
})

const imageUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true)
    cb(new Error(`Format non accepté : ${file.mimetype}`), false)
  },
})

module.exports = { imageUpload, ALLOWED_TYPES, MAX_FILE_SIZE }
