const crypto = require('crypto')

// Priorité : image admin (appliquée par-dessus, voir scholarshipService) >
// image officielle de la source (row.image_url) > image du provider > image
// du pays > repli générique. Ce module ne gère que les deux derniers niveaux —
// les chemins pointent vers des visuels locaux servis par le frontend
// (frontend/public/images/scholarships/…), pas par ce backend.

const PROVIDER_IMAGES = {
  mext: ['providers/mext.svg'],
  gks: ['providers/gks.svg'],
  opendoors: ['providers/open-doors.svg'],
  campusfrance: ['providers/campus-france.svg'],
  educanada: ['providers/educanada.svg'],
  wbi: ['providers/wbi.svg'],
}

const COUNTRY_IMAGES = {
  FR: ['countries/france-01.svg', 'countries/france-02.svg'],
  RU: ['countries/russie-01.svg'],
  CA: ['countries/canada-01.svg', 'countries/canada-02.svg'],
  JP: ['countries/japon-01.svg'],
  KR: ['countries/coree-du-sud-01.svg'],
  BE: ['countries/belgique-01.svg', 'countries/belgique-02.svg'],
}

const FALLBACK_IMAGES = ['fallback/scholarship-01.svg', 'fallback/scholarship-02.svg']

function matchProviderKey(provider, sourceName) {
  const s = `${provider || ''} ${sourceName || ''}`.toLowerCase()

  if (s.includes('mext')) return 'mext'
  if (s.includes('gks') || s.includes('niied') || s.includes('study in korea')) return 'gks'
  if (s.includes('open doors')) return 'opendoors'
  if (s.includes('campus france')) return 'campusfrance'
  if (s.includes('educanada') || s.includes('global affairs canada')) return 'educanada'
  if (s.includes('wallonie') || s.includes('wallonia') || s.includes('wbi')) return 'wbi'

  return null
}

/** Choisit toujours la même image pour une même bourse (hash du fingerprint). */
function pick(seed, list) {
  const hash = crypto.createHash('sha256').update(String(seed)).digest()
  return list[hash[0] % list.length]
}

function resolve({ countryCode, provider, sourceName, fingerprint }) {
  const seed = fingerprint || `${provider || ''}|${countryCode || ''}`

  const providerKey = matchProviderKey(provider, sourceName)
  if (providerKey && PROVIDER_IMAGES[providerKey]) {
    return `/images/scholarships/${pick(seed, PROVIDER_IMAGES[providerKey])}`
  }

  const cc = (countryCode || '').toUpperCase()
  if (COUNTRY_IMAGES[cc]) {
    return `/images/scholarships/${pick(seed, COUNTRY_IMAGES[cc])}`
  }

  return `/images/scholarships/${pick(seed, FALLBACK_IMAGES)}`
}

module.exports = { resolve }
