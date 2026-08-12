const SOURCE_URL = 'https://od.globaluni.ru/'

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
}

function parseEnglishDate(value) {
  const match = String(value || '').match(
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
  )

  if (!match) return null

  const day = Number(match[1])
  const month = MONTHS[match[2].toLowerCase()]
  const year = Number(match[3])

  return new Date(Date.UTC(year, month, day, 23, 59, 59)).toISOString()
}

function findDeadline(text) {
  const patterns = [
    /(\d{1,2}\s+\w+\s+\d{4}).{0,100}Deadline for portfolio submission/i,
    /(\d{1,2}\s+\w+\s+\d{4}).{0,100}registration deadline/i,
    /registration.{0,60}?(\d{1,2}\s+\w+\s+\d{4})/i,
    /portfolio submission.{0,60}?(\d{1,2}\s+\w+\s+\d{4})/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const parsed = parseEnglishDate(match[1])
      if (parsed) return parsed
    }
  }

  return null
}

function findSubjectAreas(text) {
  const known = [
    'Applied Mathematics and Artificial Intelligence',
    'Biology and Biotechnology',
    'Business and Management',
    'Chemistry and Materials Science',
    'Clinical Medicine and Public Health',
    'Computer and Data Science',
    'Earth and Environmental Sciences for Sustainability',
    'Economics and Econometrics',
    'Education and Psychology',
    'Engineering and Technology',
    'Physical Sciences and Technology',
    'Politics and International Studies',
    'Russian Language and Culture',
    'Urbanism and Civil Engineering',
  ]

  return known.filter(field =>
    text.toLowerCase().includes(field.toLowerCase())
  )
}

async function fetchOpenDoors() {
  console.log('🇷🇺 Open Doors : lecture de la source officielle...')

  const response = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent':
        'VisionEuropeAfrica-ScholarshipBot/1.0 (+https://vea-frontend-1d07.onrender.com)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Open Doors HTTP ${response.status}`)
  }

  const html = await response.text()
  const text = htmlToText(html)

  if (
    !text.toLowerCase().includes('open doors') ||
    !text.toLowerCase().includes('russian')
  ) {
    throw new Error('Le contenu Open Doors reçu ne correspond pas au site attendu')
  }

  const deadline = findDeadline(text)
  const fields = findSubjectAreas(text)

  const now = new Date()
  const deadlineDate = deadline ? new Date(deadline) : null

  const status =
    deadlineDate && deadlineDate.getTime() < now.getTime()
      ? 'closed'
      : deadlineDate
        ? 'open'
        : 'unknown'

  return [
    {
      title: 'Open Doors Russian Scholarship Project',
      provider: 'Association Global Universities',
      university: null,

      country: 'Russie',
      countryCode: 'RU',
      city: null,

      levels: [
        'bachelor',
        'master',
        'doctorat',
        'postdoctorat',
      ],

      fields,

      fundingType: 'full',

      amount: null,
      currency: null,

      tuitionCovered: true,
      accommodationCovered: false,
      travelCovered: false,
      stipendCovered: false,

      description:
        'Programme international Open Doors permettant aux lauréats d’accéder à des programmes universitaires russes financés. Les informations affichées sont synchronisées depuis la source officielle.',

      deadline,

      applicationUrl: SOURCE_URL,
      sourceUrl: SOURCE_URL,
      sourceName: 'Open Doors — Official',

      imageUrl: null,

      status,

      lastVerifiedAt: new Date().toISOString(),
    },
  ]
}

module.exports = {
  fetchOpenDoors,
}
