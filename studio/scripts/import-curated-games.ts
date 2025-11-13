// studio/scripts/import-curated-games.ts
// Import the 40 curated games into Sanity
// Usage: cd studio && npx sanity exec scripts/import-curated-games.ts --with-user-token

import {getCliClient} from 'sanity/cli'
import {CURATED_GAME_IDS} from '../../frontend/lib/curated-games'

const API_BASE = 'https://slotslaunch.com/api'
const token = process.env.SLOTSLAUNCH_TOKEN
const origin = process.env.SLOTSLAUNCH_ORIGIN || 'cazinou.io'

type Theme = {
  id: number
  name: string
  slug: string
}

type SlotGame = {
  id: number
  name: string
  slug: string
  provider: string
  provider_slug: string
  thumb: string
  type: string
  type_slug: string
  themes: Theme[]
  rtp: string
  volatility: string
  release: string
}

type GamesResponse = {
  data: SlotGame[]
}

function buildUrl(path: string, params: Record<string, string | number | number[]> = {}) {
  if (!token) {
    throw new Error('SLOTSLAUNCH_TOKEN environment variable is not set')
  }

  const url = new URL(`${API_BASE}/${path}`)
  url.searchParams.set('token', token)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return

    // Handle array parameters (e.g., id[])
    if (Array.isArray(value)) {
      value.forEach((item) => {
        url.searchParams.append(`${key}[]`, String(item))
      })
    } else {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Origin: origin,
  }
}

/**
 * Fetch specific games by their IDs
 * This is much more efficient than fetching all games
 */
async function fetchGamesByIds(ids: number[]): Promise<SlotGame[]> {
  console.log(`🔍 Fetching ${ids.length} games by ID from SlotsLaunch API...`)

  const BATCH_SIZE = 100 // API typically limits to 100 per request
  const games: SlotGame[] = []

  // Process in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(ids.length / BATCH_SIZE)

    console.log(`   Fetching batch ${batchNum}/${totalBatches} (${batch.length} games)...`)

    const res = await fetch(
      buildUrl('games', {
        id: batch,
        per_page: BATCH_SIZE,
      }),
      {
        headers: getHeaders(),
        signal: AbortSignal.timeout(45000),
      }
    )

    if (!res.ok) {
      console.error(`   ❌ API returned ${res.status} for batch ${batchNum}`)
      throw new Error(`SlotsLaunch API returned ${res.status}`)
    }

    const data: GamesResponse = await res.json()

    if (data.data && data.data.length > 0) {
      games.push(...data.data)
      console.log(`   ✅ Fetched ${data.data.length} games from batch ${batchNum}`)
    }

    // Small delay between batches to be nice to the API
    if (i + BATCH_SIZE < ids.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log(`✅ Successfully fetched ${games.length}/${ids.length} games\n`)
  return games
}

async function findOrCreateProvider(client: any, providerName: string, providerSlug: string) {
  const existingProvider = await client.fetch(
    `*[_type == "provider" && slug.current == $slug][0]`,
    {slug: providerSlug}
  )

  if (existingProvider) {
    console.log(`   ✅ Found existing provider: ${providerName}`)
    return existingProvider._id
  }

  console.log(`   📝 Creating new provider: ${providerName}`)
  const newProvider = await client.create({
    _type: 'provider',
    name: providerName,
    slug: {
      _type: 'slug',
      current: providerSlug,
    },
  })

  return newProvider._id
}

async function importGameById(client: any, game: SlotGame) {
  console.log(`\n📦 Importing: ${game.name}`)
  console.log(`   ID: ${game.id}`)
  console.log(`   Slug: ${game.slug}`)
  console.log(`   Provider: ${game.provider}`)

  // Check if game already exists
  const existingGame = await client.fetch(
    `*[_type == "game" && (slotsLaunchId == $id || slotsLaunchSlug == $slug)][0]`,
    {id: game.id, slug: game.slug}
  )

  if (existingGame) {
    console.log(`   ⚠️  Game already exists in Sanity: ${existingGame._id}`)
    console.log(`   Updating existing document...`)

    await client
      .patch(existingGame._id)
      .set({
        name: game.name,
        slotsLaunchId: game.id,
        slotsLaunchSlug: game.slug,
        slotsLaunchThumb: game.thumb,
        gameType: game.type || null,
        gameTypeSlug: game.type_slug || null,
        themes: game.themes?.map(t => t.name) || [],
        rtp: game.rtp || null,
        volatility: game.volatility || null,
        releaseDate: game.release || null,
      })
      .commit()

    console.log(`   ✅ Updated game: ${existingGame._id}`)
    console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${existingGame._id}`)
    return
  }

  // Create provider if needed
  const providerId = await findOrCreateProvider(client, game.provider, game.provider_slug)

  // Create game
  console.log(`   📝 Creating new game document...`)
  const newGame = await client.create({
    _type: 'game',
    name: game.name,
    slug: {
      _type: 'slug',
      current: game.slug,
    },
    slotsLaunchId: game.id,
    slotsLaunchSlug: game.slug,
    slotsLaunchThumb: game.thumb,
    provider: {
      _type: 'reference',
      _ref: providerId,
    },
    rating: 4.0, // Default rating, can be edited in Sanity Studio
    gameType: game.type || null,
    gameTypeSlug: game.type_slug || null,
    themes: game.themes?.map(t => t.name) || [],
    rtp: game.rtp || null,
    volatility: game.volatility || null,
    releaseDate: game.release || null,
  })

  console.log(`   ✅ Successfully imported game!`)
  console.log(`   Sanity ID: ${newGame._id}`)
  console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${newGame._id}`)
}

async function run() {
  try {
    console.log('\n🎰 Importing 40 Curated Games to Sanity\n')
    console.log(`📋 Game IDs: ${CURATED_GAME_IDS.length} total\n`)

    const client = getCliClient()

    // Fetch games by their IDs (much faster than fetching all 30k+ games)
    const games = await fetchGamesByIds([...CURATED_GAME_IDS])

    if (games.length === 0) {
      console.log('❌ No games found! Check your API credentials.')
      process.exit(1)
    }

    // Import each game
    console.log(`📥 Importing ${games.length} games to Sanity...\n`)
    let successCount = 0
    let updateCount = 0
    let failCount = 0

    for (const game of games) {
      try {
        const existingGame = await client.fetch(
          `*[_type == "game" && (slotsLaunchId == $id || slotsLaunchSlug == $slug)][0]`,
          {id: game.id, slug: game.slug}
        )

        await importGameById(client, game)

        if (existingGame) {
          updateCount++
        } else {
          successCount++
        }
      } catch (error) {
        console.error(`   ❌ Failed to import ${game.name}:`, error instanceof Error ? error.message : error)
        failCount++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Import Summary:')
    console.log(`   ✅ New games created: ${successCount}`)
    console.log(`   🔄 Existing games updated: ${updateCount}`)
    if (failCount > 0) {
      console.log(`   ❌ Failed: ${failCount}`)
    }
    console.log(`   📦 Total processed: ${successCount + updateCount + failCount}/${CURATED_GAME_IDS.length}`)
    console.log('='.repeat(60))

    console.log('\n✅ Import completed!')
    console.log('\n💡 Next steps:')
    console.log('   1. Open Sanity Studio: https://cazinou.sanity.studio')
    console.log('   2. Navigate to Games section')
    console.log('   3. Review and edit ratings, add reviews, upload custom images, etc.')
  } catch (error) {
    console.error('\n❌ Import failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

run()
