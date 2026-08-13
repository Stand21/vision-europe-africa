const {
  fetchHtml,
  cleanText,
} = require('./utils')

const GKS_URL =
  'https://www.studyinkorea.go.kr/en/plan/scholarship.do?tab=gks-tab4'

const GKS_GRADUATE_2026 =
  'https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4420'

async function fetchSouthKorea() {
  console.log('🇰🇷 Corée du Sud : Study in Korea / GKS...')

  const [mainHtml, graduateHtml] = await Promise.all([
    fetchHtml(GKS_URL),
    fetchHtml(GKS_GRADUATE_2026),
  ])

  const mainText = cleanText(mainHtml)
  const graduateText = cleanText(graduateHtml)

  if (!/Global Korea Scholarship|GKS/i.test(mainText + graduateText)) {
    throw new Error('Contenu GKS inattendu')
  }

  const now = new Date().toISOString()

  return [
    {
      title: 'Global Korea Scholarship — Graduate Degree Program',
      provider: 'National Institute for International Education (NIIED)',
      university: null,

      country: 'Corée du Sud',
      countryCode: 'KR',
      city: null,

      levels: ['master', 'doctorat'],

      fields: ['tous domaines'],

      fundingType: 'full',

      amount: null,
      currency: 'KRW',

      tuitionCovered: true,
      accommodationCovered: false,
      travelCovered: true,
      stipendCovered: true,

      description:
        'Programme GKS du gouvernement coréen pour les étudiants internationaux souhaitant suivre des études supérieures en Corée du Sud.',

      deadline: null,

      applicationUrl: GKS_GRADUATE_2026,
      sourceUrl: GKS_GRADUATE_2026,
      sourceName: 'Study in Korea / GKS — Official',

      imageUrl: null,
      status: 'unknown',
      lastVerifiedAt: now,
    },
  ]
}

module.exports = { fetchSouthKorea }
