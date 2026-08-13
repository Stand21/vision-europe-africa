const {
  cleanText,
  fetchHtml,
  absoluteUrl,
  uniqueBy,
  findDate,
  statusFromDeadline,
} = require('./utils')

const LIST_URL =
  'https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng'

async function fetchCanada() {
  console.log('🇨🇦 Canada : EduCanada...')

  const html = await fetchHtml(LIST_URL)

  const links = []

  const regex =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

  let match

  while ((match = regex.exec(html))) {
    const title = cleanText(match[2])

    if (
      !title ||
      title.length < 8 ||
      !/scholar|award|fellow|fund|application/i.test(title)
    ) continue

    const url = absoluteUrl(LIST_URL, match[1])

    if (!url || !url.includes('educanada.ca')) continue

    links.push({ title, url })
  }

  const unique = uniqueBy(links, x => x.url).slice(0, 30)

  const scholarships = []

  for (const item of unique) {
    try {
      const detailHtml = await fetchHtml(item.url)
      const text = cleanText(detailHtml)

      if (!/scholar|award|fund/i.test(text)) continue

      const deadline = findDate(text)

      const levels = []

      if (/college|undergraduate/i.test(text)) levels.push('bachelor')
      if (/graduate|master/i.test(text)) levels.push('master')
      if (/doctoral|phd/i.test(text)) levels.push('doctorat')
      if (/postdoctoral/i.test(text)) levels.push('postdoctorat')

      scholarships.push({
        title: item.title,

        provider: 'Global Affairs Canada',

        university: null,

        country: 'Canada',
        countryCode: 'CA',
        city: null,

        levels: [...new Set(levels)],
        fields: [],

        fundingType: 'varies',

        amount: null,
        currency: 'CAD',

        tuitionCovered: /tuition/i.test(text),
        accommodationCovered: /accommodation|living expenses/i.test(text),
        travelCovered: /airfare|travel/i.test(text),
        stipendCovered: /stipend|living expenses/i.test(text),

        description: text.slice(0, 900),

        deadline,

        applicationUrl: item.url,
        sourceUrl: item.url,
        sourceName: 'EduCanada / Global Affairs Canada — Official',

        imageUrl: null,

        status: statusFromDeadline(deadline),

        lastVerifiedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.warn(`   ⚠️ Canada ${item.title}: ${error.message}`)
    }
  }

  return scholarships
}

module.exports = { fetchCanada }
