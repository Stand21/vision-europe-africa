const {
  fetchHtml,
  cleanText,
  findDate,
  statusFromDeadline,
} = require('./utils')

const SOURCE_URL =
  'https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program'

async function fetchFrance() {
  console.log('🇫🇷 France : Campus France / Eiffel...')

  const html = await fetchHtml(SOURCE_URL)
  const text = cleanText(html)

  if (!/Eiffel/i.test(text)) {
    throw new Error('Contenu Campus France inattendu')
  }

  const deadline = findDate(text)

  return [{
    title: 'France Excellence Eiffel Scholarship Program',
    provider: 'French Ministry for Europe and Foreign Affairs',
    university: null,

    country: 'France',
    countryCode: 'FR',
    city: null,

    levels: ['master', 'doctorat'],

    fields: [
      'Biologie et santé',
      'Transition écologique',
      'Mathématiques et numérique',
      "Sciences de l'ingénieur",
      'Histoire et civilisation française',
      'Droit et science politique',
      'Économie et gestion',
    ],

    fundingType: 'full',

    amount: null,
    currency: 'EUR',

    tuitionCovered: false,
    accommodationCovered: true,
    travelCovered: true,
    stipendCovered: true,

    description:
      'Programme France Excellence Eiffel destiné aux étudiants internationaux de haut niveau en master et doctorat.',

    deadline,

    applicationUrl: SOURCE_URL,
    sourceUrl: SOURCE_URL,
    sourceName: 'Campus France — Official',

    imageUrl: null,
    status: statusFromDeadline(deadline),
    lastVerifiedAt: new Date().toISOString(),
  }]
}

module.exports = { fetchFrance }
