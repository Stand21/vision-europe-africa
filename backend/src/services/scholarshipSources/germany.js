const {
  cleanText,
  fetchHtml,
  statusFromDeadline,
} = require('./utils')

const LIST_URL =
  'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?back=1&daad=1&page=1&type=print'

function parseDate(value) {
  const m = String(value || '').match(/(\d{2})\.(\d{2})\.(\d{4})/)
  if (!m) return null

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

async function fetchGermany() {
  console.log('🇩🇪 Allemagne : DAAD Scholarship Database...')

  const html = await fetchHtml(LIST_URL)
  const text = cleanText(html)

  const marker = /(?=(?:Study Scholarships|Research Grants|University Winter Courses|Doctoral Programmes|Bi-nationally Supervised|Study Visits))/gi

  const chunks = text.split(marker)

  const results = []

  for (const chunk of chunks) {
    if (chunk.length < 80) continue

    const titleMatch = chunk.match(
      /^(.*?)(?:\s+•\s+DAAD|\s+ImageStatus:|\s+Status:)/
    )

    if (!titleMatch) continue

    const title = titleMatch[1]
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || title.length < 8) continue

    const deadlineMatch = chunk.match(
      /Application deadline:[\s\S]{0,700}?(\d{2}\.\d{2}\.\d{4})/i
    )

    const deadline = deadlineMatch
      ? parseDate(deadlineMatch[1])
      : null

    const levels = []

    if (/Undergraduates?/i.test(chunk)) levels.push('bachelor')
    if (/Graduates?/i.test(chunk)) levels.push('master')
    if (/Doctoral candidates|PhD/i.test(chunk)) levels.push('doctorat')
    if (/Postdoctoral/i.test(chunk)) levels.push('postdoctorat')

    results.push({
      title,
      provider: 'DAAD',
      university: null,
      country: 'Allemagne',
      countryCode: 'DE',
      city: null,

      levels: [...new Set(levels)],
      fields: [],

      fundingType: 'varies',
      amount: null,
      currency: 'EUR',

      tuitionCovered: /tuition|study fees/i.test(chunk),
      accommodationCovered: /accommodation/i.test(chunk),
      travelCovered: /travel allowance/i.test(chunk),
      stipendCovered: /monthly payment|monthly scholarship|monthly allowance/i.test(chunk),

      description: chunk.slice(0, 900),

      deadline,

      applicationUrl: LIST_URL,
      sourceUrl: LIST_URL,
      sourceName: 'DAAD Scholarship Database — Official',

      imageUrl: null,
      status: statusFromDeadline(deadline),
      lastVerifiedAt: new Date().toISOString(),
    })
  }

  const unique = new Map()

  for (const item of results) {
    const key = `${item.title}|${item.deadline || ''}`
    if (!unique.has(key)) unique.set(key, item)
  }

  console.log(`   DAAD brut : ${results.length} résultat(s)`)
  console.log(`   DAAD uniques : ${unique.size}`)

  return [...unique.values()].slice(0, 100)
}

module.exports = { fetchGermany }
