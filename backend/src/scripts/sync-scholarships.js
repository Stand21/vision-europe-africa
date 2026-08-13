#!/usr/bin/env node

require('dotenv').config()

const db = require('../config/database')

const {
  saveScholarship,
  closeExpiredScholarships,
} = require('../services/scholarshipSyncService')

const {
  fetchOpenDoors,
} = require('../services/scholarshipSources/openDoors')

const {
  fetchBelgium,
} = require('../services/scholarshipSources/belgium')

const {
  fetchCanada,
} = require('../services/scholarshipSources/canada')


const { fetchFrance } =
  require('../services/scholarshipSources/france')

const { fetchJapan } =
  require('../services/scholarshipSources/japan')

const { fetchSouthKorea } =
  require('../services/scholarshipSources/southKorea')

async function syncSource(name, loader) {
  console.log('')
  console.log(`━━ ${name} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

  try {
    const scholarships = await loader()

    console.log(
      `   ${scholarships.length} programme(s) trouvé(s)`
    )

    let saved = 0

    for (const scholarship of scholarships) {
      try {
        await saveScholarship(scholarship)

        console.log(`   ✅ ${scholarship.title}`)

        if (scholarship.deadline) {
          console.log(
            `      Deadline : ${scholarship.deadline}`
          )
        }

        saved++
      } catch (error) {
        console.error(
          `   ❌ ${scholarship.title}: ${error.message}`
        )
      }
    }

    return {
      source: name,
      found: scholarships.length,
      saved,
      success: true,
    }
  } catch (error) {
    console.error(`   ❌ ${error.message}`)

    return {
      source: name,
      found: 0,
      saved: 0,
      success: false,
      error: error.message,
    }
  }
}

async function runSync() {
  console.log('')
  console.log('╭────────────────────────────────────────────╮')
  console.log('│ Vision Europe Africa                       │')
  console.log('│ Synchronisation des bourses                │')
  console.log('╰────────────────────────────────────────────╯')

  const results = []

  results.push(
    await syncSource(
      '🇷🇺 Open Doors — Russie',
      fetchOpenDoors
    )
  )

results.push(

  await syncSource(

    '🇧🇪 Belgique — Wallonie-Bruxelles Campus',

    fetchBelgium

 	 )

)
results.push(

  await syncSource(

    '🇨🇦 Canada — EduCanada',

    fetchCanada

  )

)

  results.push(
    await syncSource(
      '🇫🇷 France — Campus France',
      fetchFrance
    )
  )

  results.push(
    await syncSource(
      '🇯🇵 Japon — MEXT / JASSO',
      fetchJapan
    )
  )

  results.push(
    await syncSource(
      '🇰🇷 Corée du Sud — GKS',
      fetchSouthKorea
    )
  )


  const expired = await closeExpiredScholarships()

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Bourses expirées fermées : ${expired}`)
  console.log('')

  for (const result of results) {
    console.log(
      `${result.success ? '✅' : '❌'} ${result.source}: ` +
      `${result.saved}/${result.found}`
    )
  }

  console.log('')
  console.log('✅ Synchronisation terminée')

  return results
}

module.exports = { runSync }

if (require.main === module) {
  runSync()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('')
      console.error('❌ Synchronisation interrompue')
      console.error(error)
      process.exit(1)
    })
}
