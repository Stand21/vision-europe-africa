#!/usr/bin/env node
/**
 * Jeu de bourses de démonstration pour le développement local.
 *
 * L'API « Ma Bourse d'Études » démarre avec une table vide : ses sources RSS
 * ne sont pas encore renseignées et la clé du fournisseur externe est
 * optionnelle. Sans données, la section Bourses s'afficherait vide et donnerait
 * l'impression d'un bug.
 *
 * Ce script insère quelques bourses réelles et connues, uniquement si la table
 * est vide. Il ne touche jamais à des données existantes.
 *
 *   DATABASE_URL=postgresql://user@localhost:5432/ma_bourse node seed-demo-scholarships.js
 */
const crypto = require('crypto')
const { Client } = require('pg')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL manquant')
  process.exit(1)
}

const inDays = n => new Date(Date.now() + n * 86_400_000).toISOString()

const DEMO = [
  {
    title: 'Bourse Chevening — Royaume-Uni',
    provider: 'Gouvernement du Royaume-Uni',
    country: 'Royaume-Uni', countryCode: 'GB', city: 'Londres',
    levels: ['master'], fields: ['tous domaines'],
    fundingType: 'full', amount: 34000, currency: 'GBP',
    tuition: true, accommodation: false, travel: true, stipend: true,
    description: "Bourse entièrement financée du gouvernement britannique : frais de scolarité, allocation mensuelle et voyage aller-retour.",
    deadline: inDays(55),
    url: 'https://www.chevening.org/scholarships/',
  },
  {
    title: "Université de Pise — Bourses d'études et réductions de frais",
    provider: 'Università di Pisa',
    country: 'Italie', countryCode: 'IT', city: 'Pise',
    levels: ['licence', 'master', 'doctorat'], fields: ['tous domaines'],
    fundingType: 'partial', amount: 6000, currency: 'EUR',
    tuition: true, accommodation: false, travel: false, stipend: false,
    description: "Exonération partielle ou totale des frais et bourses au mérite pour les étudiants internationaux.",
    deadline: inDays(49),
    url: 'https://www.unipi.it/index.php/english/itemlist/category/1049',
  },
  {
    title: 'Bourse Open Doors — Russie',
    provider: 'Association Global Universities',
    country: 'Russie', countryCode: 'RU', city: 'Moscou',
    levels: ['master', 'doctorat'], fields: ['sciences', 'ingénierie', 'économie'],
    fundingType: 'full', amount: null, currency: null,
    tuition: true, accommodation: true, travel: false, stipend: true,
    description: "Olympiade internationale donnant accès à une place financée dans une université russe.",
    deadline: inDays(5),
    url: 'https://od.globaluni.ru/en/',
  },
  {
    title: 'DAAD EPOS — Allemagne',
    provider: 'Office allemand d\'échanges universitaires (DAAD)',
    country: 'Allemagne', countryCode: 'DE', city: 'Bonn',
    levels: ['master', 'doctorat'], fields: ['développement', 'santé', 'ingénierie'],
    fundingType: 'full', amount: 11700, currency: 'EUR',
    tuition: true, accommodation: false, travel: true, stipend: true,
    description: "Bourses destinées aux professionnels des pays en développement pour des programmes liés au développement.",
    deadline: inDays(120),
    url: 'https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
  },
  {
    title: 'Bourse Eiffel — France',
    provider: 'Ministère de l\'Europe et des Affaires étrangères',
    country: 'France', countryCode: 'FR', city: 'Paris',
    levels: ['master', 'doctorat'], fields: ['sciences', 'droit', 'économie'],
    fundingType: 'full', amount: 15000, currency: 'EUR',
    tuition: false, accommodation: false, travel: true, stipend: true,
    description: "Allocation mensuelle, voyage international et couverture sociale pour étudiants étrangers d'excellence.",
    deadline: inDays(72),
    url: 'https://www.campusfrance.org/fr/eiffel-bourse-excellence-etudiants-etrangers',
  },
  {
    title: 'Erasmus Mundus — Masters conjoints',
    provider: 'Commission européenne',
    country: 'Union européenne', countryCode: 'EU', city: null,
    levels: ['master'], fields: ['tous domaines'],
    fundingType: 'full', amount: 25000, currency: 'EUR',
    tuition: true, accommodation: false, travel: true, stipend: true,
    description: "Masters conjoints dans plusieurs universités européennes, entièrement financés, voyage et allocation compris.",
    deadline: inDays(28),
    url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
  },
]

const fingerprint = s =>
  crypto.createHash('sha256').update(`${s.title}|${s.provider}|${s.country}`).digest('hex')

;(async () => {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()

  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM scholarships')
  if (rows[0].n > 0) {
    console.log(`↪️  ${rows[0].n} bourse(s) déjà en base — jeu de démonstration non inséré`)
    await client.end()
    return
  }

  for (const s of DEMO) {
    await client.query(
      `INSERT INTO scholarships
        (fingerprint, title, provider, country, country_code, city, levels, fields,
         funding_type, amount, currency, tuition_covered, accommodation_covered,
         travel_covered, stipend_covered, description, deadline, application_url,
         source_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$18,'open')
       ON CONFLICT (fingerprint) DO NOTHING`,
      [fingerprint(s), s.title, s.provider, s.country, s.countryCode, s.city,
       s.levels, s.fields, s.fundingType, s.amount, s.currency,
       s.tuition, s.accommodation, s.travel, s.stipend,
       s.description, s.deadline, s.url]
    )
  }

  console.log(`✅ ${DEMO.length} bourses de démonstration insérées`)
  await client.end()
})().catch(err => {
  console.error('Échec du jeu de démonstration :', err.message)
  process.exit(1)
})
