const {
  cleanText,
  fetchHtml,
  absoluteUrl,
  uniqueBy,
  findDate,
  statusFromDeadline,
} = require('./utils')

const LIST_URL = 'https://www.studyinbelgium.be/en/scholarships'

async function fetchBelgium() {
  console.log('🇧🇪 Belgique : Wallonie-Bruxelles Campus...')

  const html = await fetchHtml(LIST_URL)

  const links = []

  const regex = /<a[^>]+href=["']([^"']*\/en\/scholarships\/[^"'?#]+)["'][^>]*>([\s\S]*?)<\/a>/gi

  let match

  while ((match = regex.exec(html))) {
    const url = absoluteUrl(LIST_URL, match[1])
    const title = cleanText(match[2])

    if (!url || !title || title.length < 5) continue

    links.push({ url, title })
  }

  const unique = uniqueBy(links, x => x.url).slice(0, 30)

  const scholarships = []

  for (const item of unique) {
    try {
      const detailHtml = await fetchHtml(item.url)
      const text = cleanText(detailHtml)

      const deadline = findDate(text)

      let levels = []

      if (/bachelor/i.test(text)) levels.push('bachelor')
      if (/master/i.test(text)) levels.push('master')
      if (/doctoral|doctorat|phd/i.test(text)) levels.push('doctorat')
      if (/postdoctoral|post-doc/i.test(text)) levels.push('postdoctorat')

      const cleanTitle = item.title
        .replace(/^For all international students\s*/i, '')
        .trim()

      scholarships.push({
        title: cleanTitle,
        provider: /WBI|Wallonia-Brussels International/i.test(text)
          ? 'Wallonie-Bruxelles International'
          : 'Wallonie-Bruxelles Campus',

        university: null,

        country: 'Belgique',
        countryCode: 'BE',
        city: null,

        levels: [...new Set(levels)],
        fields: [],

        fundingType: 'varies',

        amount: null,
        currency: 'EUR',

        tuitionCovered: /tuition|registration fees|frais d'inscription/i.test(text),
        accommodationCovered: /accommodation|housing|logement/i.test(text),
        travelCovered: /travel expenses|travel allowance|frais de voyage/i.test(text),
        stipendCovered: /monthly|allocation mensuelle|monthly amount|stipend/i.test(text),

        description:
          text.slice(0, 900),

        deadline,

        applicationUrl: item.url,
        sourceUrl: item.url,
        sourceName: 'Wallonie-Bruxelles Campus — Official',

        imageUrl: null,

        status: statusFromDeadline(deadline),

        lastVerifiedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.warn(`   ⚠️ Belgique ${item.title}: ${error.message}`)
    }
  }

  return scholarships
}

module.exports = { fetchBelgium }
