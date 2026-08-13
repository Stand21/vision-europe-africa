/**
 * Détection du pays du visiteur, sans service tiers ni adresse IP.
 *
 * On s'appuie sur deux signaux déjà présents dans le navigateur :
 *   1. le fuseau horaire (Africa/Kinshasa → RD Congo), le plus fiable ;
 *   2. la région de la langue (fr-CD → CD), en secours.
 *
 * Aucune donnée ne quitte le navigateur. C'est imprécis si le visiteur voyage
 * ou utilise un VPN — d'où le sélecteur de devise qui reste toujours accessible.
 */

/** Fuseau horaire → code pays ISO. Afrique en priorité, puis Europe. */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // ── Afrique de l'Ouest ──
  'Africa/Abidjan': 'CI', 'Africa/Accra': 'GH', 'Africa/Bamako': 'ML',
  'Africa/Banjul': 'GM', 'Africa/Bissau': 'GW', 'Africa/Conakry': 'GN',
  'Africa/Dakar': 'SN', 'Africa/Freetown': 'SL', 'Africa/Lome': 'TG',
  'Africa/Monrovia': 'LR', 'Africa/Niamey': 'NE', 'Africa/Nouakchott': 'MR',
  'Africa/Ouagadougou': 'BF', 'Africa/Porto-Novo': 'BJ', 'Africa/Lagos': 'NG',
  'Atlantic/Cape_Verde': 'CV',
  // ── Afrique centrale ──
  'Africa/Bangui': 'CF', 'Africa/Brazzaville': 'CG', 'Africa/Douala': 'CM',
  'Africa/Kinshasa': 'CD', 'Africa/Lubumbashi': 'CD', 'Africa/Libreville': 'GA',
  'Africa/Luanda': 'AO', 'Africa/Malabo': 'GQ', 'Africa/Ndjamena': 'TD',
  // ── Afrique de l'Est ──
  'Africa/Addis_Ababa': 'ET', 'Africa/Asmara': 'ER', 'Africa/Bujumbura': 'BI',
  'Africa/Dar_es_Salaam': 'TZ', 'Africa/Djibouti': 'DJ', 'Africa/Kampala': 'UG',
  'Africa/Kigali': 'RW', 'Africa/Mogadishu': 'SO', 'Africa/Nairobi': 'KE',
  'Indian/Antananarivo': 'MG', 'Indian/Mauritius': 'MU',
  // ── Afrique australe ──
  'Africa/Blantyre': 'MW', 'Africa/Gaborone': 'BW', 'Africa/Harare': 'ZW',
  'Africa/Johannesburg': 'ZA', 'Africa/Lusaka': 'ZM', 'Africa/Maputo': 'MZ',
  'Africa/Maseru': 'LS', 'Africa/Mbabane': 'SZ', 'Africa/Windhoek': 'NA',
  // ── Afrique du Nord ──
  'Africa/Algiers': 'DZ', 'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA',
  'Africa/Khartoum': 'SD', 'Africa/Tripoli': 'LY', 'Africa/Tunis': 'TN',
  'Africa/El_Aaiun': 'MA', 'Africa/Juba': 'SS',
  // ── Europe (destinations) ──
  'Europe/Berlin': 'DE', 'Europe/Lisbon': 'PT', 'Europe/Paris': 'FR',
  'Europe/Brussels': 'BE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL', 'Europe/Warsaw': 'PL', 'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH', 'Europe/London': 'GB', 'Europe/Dublin': 'IE',
  'Europe/Prague': 'CZ', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Athens': 'GR',
  // ── Amérique du Nord ──
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Toronto': 'CA', 'America/Montreal': 'CA',
}

/** Code pays → devise officielle. */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Zone franc CFA — Afrique de l'Ouest (BCEAO)
  BJ: 'XOF', BF: 'XOF', CI: 'XOF', GW: 'XOF', ML: 'XOF',
  NE: 'XOF', SN: 'XOF', TG: 'XOF',
  // Zone franc CFA — Afrique centrale (BEAC)
  CM: 'XAF', CF: 'XAF', TD: 'XAF', CG: 'XAF', GQ: 'XAF', GA: 'XAF',
  // Autres pays africains
  CD: 'CDF', NG: 'NGN', GH: 'GHS', GN: 'GNF', KE: 'KES', TZ: 'TZS',
  UG: 'UGX', RW: 'RWF', BI: 'BIF', ET: 'ETB', ZA: 'ZAR', ZM: 'ZMW',
  MZ: 'MZN', AO: 'AOA', MW: 'MWK', CV: 'CVE', GM: 'GMD', LR: 'LRD',
  SL: 'SLE', MU: 'MUR', SO: 'SOS', SD: 'SDG', MA: 'MAD', DZ: 'DZD',
  EG: 'EGP', TN: 'TND', LY: 'LYD',
  // Zone euro et Europe
  DE: 'EUR', PT: 'EUR', FR: 'EUR', BE: 'EUR', ES: 'EUR', IT: 'EUR',
  NL: 'EUR', AT: 'EUR', IE: 'EUR', GR: 'EUR', FI: 'EUR',
  PL: 'PLN', CZ: 'CZK', SE: 'SEK', NO: 'NOK', DK: 'DKK',
  CH: 'CHF', GB: 'GBP',
  // Amérique du Nord
  US: 'USD', CA: 'CAD',
}

/** Code pays → langue du site la plus probable. */
const COUNTRY_TO_LANGUAGE: Record<string, 'fr' | 'en' | 'pt' | 'de'> = {
  // Francophones
  BJ: 'fr', BF: 'fr', CI: 'fr', ML: 'fr', NE: 'fr', SN: 'fr', TG: 'fr',
  CM: 'fr', CF: 'fr', TD: 'fr', CG: 'fr', GA: 'fr', CD: 'fr', GN: 'fr',
  RW: 'fr', BI: 'fr', DJ: 'fr', MG: 'fr', MR: 'fr', MA: 'fr', DZ: 'fr',
  TN: 'fr', FR: 'fr', BE: 'fr',
  // Lusophones
  AO: 'pt', CV: 'pt', GW: 'pt', MZ: 'pt', ST: 'pt', PT: 'pt',
  // Germanophones
  DE: 'de', AT: 'de', CH: 'de',
  // Anglophones (le reste retombe sur l'anglais)
  NG: 'en', GH: 'en', KE: 'en', TZ: 'en', UG: 'en', ZA: 'en', ZM: 'en',
  MW: 'en', GM: 'en', LR: 'en', SL: 'en', MU: 'en', ET: 'en', SO: 'en',
  SD: 'en', GB: 'en', IE: 'en', US: 'en', CA: 'en', NL: 'en', PL: 'en',
}

/** Devises sans décimales : afficher « 29 518 065 CFA », pas « 29 518 065,00 ». */
export const ZERO_DECIMAL_CURRENCIES = new Set([
  'XOF', 'XAF', 'CDF', 'GNF', 'UGX', 'RWF', 'BIF', 'MGA', 'KMF', 'VND', 'JPY', 'KRW',
])

export interface DetectedLocale {
  country: string | null
  currency: string
  language: 'fr' | 'en' | 'pt' | 'de'
  /** Comment le pays a été trouvé — utile pour expliquer le choix au visiteur */
  source: 'timezone' | 'language' | 'default'
}

/** Pays déduit du fuseau horaire du navigateur. */
export function countryFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return TIMEZONE_TO_COUNTRY[tz] || null
  } catch {
    return null
  }
}

/** Pays déduit de la région de la langue du navigateur (fr-CD → CD). */
export function countryFromLanguage(): string | null {
  if (typeof navigator === 'undefined') return null
  for (const tag of navigator.languages || [navigator.language]) {
    const region = String(tag).split('-')[1]
    if (region && /^[A-Z]{2}$/i.test(region)) return region.toUpperCase()
  }
  return null
}

/**
 * Détecte pays, devise et langue. Retombe sur l'euro et le français, qui sont
 * les repères historiques du site.
 */
export function detectLocale(): DetectedLocale {
  const fromTz = countryFromTimezone()
  if (fromTz) {
    return {
      country: fromTz,
      currency: COUNTRY_TO_CURRENCY[fromTz] || 'EUR',
      language: COUNTRY_TO_LANGUAGE[fromTz] || 'en',
      source: 'timezone',
    }
  }

  const fromLang = countryFromLanguage()
  if (fromLang && COUNTRY_TO_CURRENCY[fromLang]) {
    return {
      country: fromLang,
      currency: COUNTRY_TO_CURRENCY[fromLang],
      language: COUNTRY_TO_LANGUAGE[fromLang] || 'en',
      source: 'language',
    }
  }

  return { country: null, currency: 'EUR', language: 'fr', source: 'default' }
}

export { COUNTRY_TO_CURRENCY, COUNTRY_TO_LANGUAGE, TIMEZONE_TO_COUNTRY }
