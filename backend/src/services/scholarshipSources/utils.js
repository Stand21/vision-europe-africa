function cleanText(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'VisionEuropeAfrica-ScholarshipBot/1.0 (+https://vea-frontend-1d07.onrender.com)',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en,fr;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })

  if (!response.ok) {
    throw new Error(`${url} → HTTP ${response.status}`)
  }

  return response.text()
}

function absoluteUrl(base, href) {
  try {
    return new URL(href, base).href
  } catch {
    return null
  }
}

function uniqueBy(items, getter) {
  const map = new Map()

  for (const item of items) {
    const key = getter(item)
    if (key && !map.has(key)) map.set(key, item)
  }

  return [...map.values()]
}

function findDate(text) {
  const normalized = String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')

  const months = {
    january: 0, february: 1, march: 2, april: 3,
    may: 4, june: 5, july: 6, august: 7,
    september: 8, october: 9, november: 10, december: 11,

    janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3,
    mai: 4, juin: 5, juillet: 6, août: 7, aout: 7,
    septembre: 8, octobre: 9, novembre: 10,
    décembre: 11, decembre: 11,
  }

  let m

  // June 9, 2026 / March 31, 2026
  m = normalized.match(
    /(?:deadline|application deadline|closing date|date limite)[^A-Za-z0-9]{0,40}([A-Za-zÀ-ÿ]+)\s+(\d{1,2}),?\s+(\d{4})/i
  )

  if (m) {
    const month = months[m[1].toLowerCase()]
    if (month != null) {
      return new Date(
        Date.UTC(Number(m[3]), month, Number(m[2]), 23, 59, 59)
      ).toISOString()
    }
  }

  // 31 March 2026
  m = normalized.match(
    /(?:deadline|application deadline|closing date|date limite)[^0-9]{0,50}(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/i
  )

  if (!m) {
    m = normalized.match(
      /(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})[^.]{0,80}(?:deadline|application|closing|date limite)/i
    )
  }

  if (m) {
    const month = months[m[2].toLowerCase()]
    if (month != null) {
      return new Date(
        Date.UTC(Number(m[3]), month, Number(m[1]), 23, 59, 59)
      ).toISOString()
    }
  }

  // 30.10.2026
  m = normalized.match(
    /(?:deadline|application deadline|closing date|date limite)[\s\S]{0,150}?(\d{2})\.(\d{2})\.(\d{4})/i
  )

  if (m) {
    return new Date(
      Date.UTC(
        Number(m[3]),
        Number(m[2]) - 1,
        Number(m[1]),
        23,
        59,
        59
      )
    ).toISOString()
  }

  // 2026-10-30
  m = normalized.match(
    /(?:deadline|application deadline|closing date|date limite)[^0-9]{0,80}(\d{4})-(\d{2})-(\d{2})/i
  )

  if (m) {
    return new Date(
      Date.UTC(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        23,
        59,
        59
      )
    ).toISOString()
  }

  return null
}

function statusFromDeadline(deadline) {
  if (!deadline) return 'unknown'

  return new Date(deadline).getTime() >= Date.now()
    ? 'open'
    : 'closed'
}

module.exports = {
  cleanText,
  fetchHtml,
  absoluteUrl,
  uniqueBy,
  findDate,
  statusFromDeadline,
}
