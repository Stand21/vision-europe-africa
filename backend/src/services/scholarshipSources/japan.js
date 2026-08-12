const {
  fetchHtml,
  cleanText,
} = require('./utils')

const MEXT_URL =
  'https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/'

const JASSO_URL =
  'https://www.studyinjapan.go.jp/en/planning/scholarships/jasso-scholarships/'

async function fetchJapan() {
  console.log('🇯🇵 Japon : Study in Japan / MEXT + JASSO...')

  const [mextHtml, jassoHtml] = await Promise.all([
    fetchHtml(MEXT_URL),
    fetchHtml(JASSO_URL),
  ])

  const mextText = cleanText(mextHtml)
  const jassoText = cleanText(jassoHtml)

  const now = new Date().toISOString()

  const results = []

  if (/MEXT|Monbukagakusho/i.test(mextText)) {
    results.push({
      title: 'Japanese Government (MEXT) Scholarship',
      provider: 'Ministry of Education, Culture, Sports, Science and Technology (MEXT)',
      university: null,

      country: 'Japon',
      countryCode: 'JP',
      city: null,

      levels: [
        'bachelor',
        'master',
        'doctorat',
        'research',
      ],

      fields: ['tous domaines'],

      fundingType: 'full',

      amount: null,
      currency: 'JPY',

      tuitionCovered: true,
      accommodationCovered: false,
      travelCovered: true,
      stipendCovered: true,

      description:
        'Bourse du gouvernement japonais accessible notamment par recommandation d’ambassade ou d’université.',

      deadline: null,

      applicationUrl: MEXT_URL,
      sourceUrl: MEXT_URL,
      sourceName: 'Study in Japan / MEXT — Official',

      imageUrl: null,
      status: 'unknown',
      lastVerifiedAt: now,
    })
  }

  if (/JASSO|Japan Student Services Organization/i.test(jassoText)) {
    results.push({
      title: 'JASSO Scholarships for International Students',
      provider: 'Japan Student Services Organization (JASSO)',
      university: null,

      country: 'Japon',
      countryCode: 'JP',
      city: null,

      levels: [
        'bachelor',
        'master',
        'doctorat',
        'exchange',
      ],

      fields: ['tous domaines'],

      fundingType: 'partial',

      amount: null,
      currency: 'JPY',

      tuitionCovered: false,
      accommodationCovered: false,
      travelCovered: false,
      stipendCovered: true,

      description:
        'Programmes JASSO destinés aux étudiants internationaux inscrits au Japon ou participant à certains programmes d’échange.',

      deadline: null,

      applicationUrl: JASSO_URL,
      sourceUrl: JASSO_URL,
      sourceName: 'Study in Japan / JASSO — Official',

      imageUrl: null,
      status: 'unknown',
      lastVerifiedAt: now,
    })
  }

  return results
}

module.exports = { fetchJapan }
