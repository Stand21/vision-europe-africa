#!/usr/bin/env node
/**
 * Génère les visuels de repli locaux pour les cartes de bourses
 * (frontend/public/images/scholarships/…), utilisés quand aucune image
 * officielle ni override admin n'est disponible — voir
 * backend/src/services/scholarshipImageService.js pour la logique de choix.
 *
 * Vectoriel (SVG) : léger, net à toute résolution, aucune dépendance binaire.
 * Relancer ce script régénère tout à l'identique ; ajouter une entrée dans
 * COUNTRIES / PROVIDERS suffit pour couvrir une nouvelle source.
 */
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'scholarships')

const CAP_PATH =
  'M100 0 L200 45 L100 90 L0 45 Z M40 62 V95 Q100 118 160 95 V62 L100 85 Z'

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function svgTemplate({ id, from, via, to, label, sublabel }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="55%" stop-color="${via}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <pattern id="dots-${id}" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg-${id})"/>
  <rect width="1200" height="630" fill="url(#dots-${id})"/>
  <g transform="translate(940,90) scale(1.7)" fill="#ffffff" opacity="0.10">
    <path d="${CAP_PATH}"/>
  </g>
  <g transform="translate(80,110) scale(0.62)" fill="#ffffff" opacity="0.85">
    <path d="${CAP_PATH}"/>
  </g>
  <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${escapeXml(label)}</text>
  <text x="80" y="378" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="500" fill="#ffffff" opacity="0.75">${escapeXml(sublabel)}</text>
</svg>
`
}

// Dégradé violet/marine de la charte du site (#0a2540 → #635bff), avec un
// accent différent par entrée pour distinguer visuellement les visuels.
const COUNTRIES = [
  { file: 'countries/france-01.svg', label: 'France', accent: '#4f46e5' },
  { file: 'countries/france-02.svg', label: 'France', accent: '#635bff' },
  { file: 'countries/russie-01.svg', label: 'Russie', accent: '#7c3aed' },
  { file: 'countries/canada-01.svg', label: 'Canada', accent: '#635bff' },
  { file: 'countries/canada-02.svg', label: 'Canada', accent: '#5b21b6' },
  { file: 'countries/japon-01.svg', label: 'Japon', accent: '#8b5cf6' },
  { file: 'countries/coree-du-sud-01.svg', label: 'Corée du Sud', accent: '#6d28d9' },
  { file: 'countries/belgique-01.svg', label: 'Belgique', accent: '#635bff' },
  { file: 'countries/belgique-02.svg', label: 'Belgique', accent: '#4338ca' },
]

const PROVIDERS = [
  { file: 'providers/mext.svg', label: 'MEXT', sublabel: 'Gouvernement du Japon', accent: '#8b5cf6' },
  { file: 'providers/gks.svg', label: 'GKS', sublabel: 'Global Korea Scholarship', accent: '#6d28d9' },
  { file: 'providers/open-doors.svg', label: 'Open Doors', sublabel: 'Association Global Universities', accent: '#7c3aed' },
  { file: 'providers/campus-france.svg', label: 'Campus France', sublabel: 'Ministère de l’Europe et des Affaires étrangères', accent: '#4f46e5' },
  { file: 'providers/educanada.svg', label: 'EduCanada', sublabel: 'Affaires mondiales Canada', accent: '#635bff' },
  { file: 'providers/wbi.svg', label: 'Wallonie-Bruxelles', sublabel: 'International', accent: '#4338ca' },
]

const FALLBACK = [
  { file: 'fallback/scholarship-01.svg', label: 'Bourse d’études', sublabel: 'Vision Europe Africa', accent: '#635bff' },
  { file: 'fallback/scholarship-02.svg', label: 'Bourse d’études', sublabel: 'Vision Europe Africa', accent: '#4f46e5' },
]

function write(entry, sublabelDefault) {
  const id = entry.file.replace(/[^a-z0-9]/gi, '')
  const svg = svgTemplate({
    id,
    from: '#0a2540',
    via: entry.accent,
    to: '#0a2540',
    label: entry.label,
    sublabel: entry.sublabel || sublabelDefault,
  })
  const dest = path.join(OUT_DIR, entry.file)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, svg)
  console.log('  ✔', entry.file)
}

console.log('Génération des visuels de repli…')
COUNTRIES.forEach(e => write(e, 'Bourse d’études'))
PROVIDERS.forEach(e => write(e))
FALLBACK.forEach(e => write(e))
console.log('Terminé.')
