import {getCliClient} from 'sanity/cli'

const API_BASE = 'https://slotslaunch.com/api'
const token = process.env.SLOTSLAUNCH_TOKEN
const origin = process.env.SLOTSLAUNCH_ORIGIN || 'cazinou.io'

// Correct SlotsLaunch IDs from iframe URLs
const CORRECT_GAME_IDS = [
  19576, // Video Poker (Orbital Gaming)
  30214, // Double Joker - Power Poker (Flip Five Gaming)
  30217, // Deuces & Joker - Power Poker (Flip Five Gaming)
  13824, // Joker Poker (iSoftBet)
]

type SlotGame = {
  id: number
  name: string
  slug: string
  provider: string
  provider_slug: string
  thumb: string
  rtp: string
  volatility: string
  release: string
}

type GamesResponse = {
  data: SlotGame[]
}

function buildUrl(path: string, params: Record<string, any> = {}) {
  if (!token) {
    throw new Error('SLOTSLAUNCH_TOKEN environment variable is not set')
  }

  const url = new URL(`${API_BASE}/${path}`)
  url.searchParams.set('token', token)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return

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

async function fetchGamesByIds(ids: number[]): Promise<SlotGame[]> {
  console.log(`🔍 Fetching ${ids.length} games by ID from SlotsLaunch API...`)

  const url = buildUrl('games', {id: ids})

  const res = await fetch(url, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(45000),
  })

  if (!res.ok) {
    throw new Error(`SlotsLaunch API returned ${res.status}`)
  }

  const data: GamesResponse = await res.json()
  return data.data
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

async function importOrUpdateGame(client: any, game: SlotGame) {
  console.log(`\n📦 Processing: ${game.name}`)
  console.log(`   ID: ${game.id}`)
  console.log(`   Slug: ${game.slug}`)
  console.log(`   Provider: ${game.provider}`)

  // Check if game already exists by slug or ID
  const existingGame = await client.fetch(
    `*[_type == "game" && (slotsLaunchId == $id || slug.current == $slug)][0]`,
    {id: game.id, slug: game.slug}
  )

  // Create or find provider
  const providerId = await findOrCreateProvider(client, game.provider, game.provider_slug)

  if (existingGame) {
    console.log(`   ⚠️  Game already exists: ${existingGame._id}`)
    console.log(`   📝 Updating with correct SlotsLaunch data...`)

    await client
      .patch(existingGame._id)
      .set({
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
      })
      .commit()

    console.log(`   ✅ Updated game: ${existingGame._id}`)
    console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${existingGame._id}`)
    return
  }

  // Create new game
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
    rating: 4.0,
  })

  console.log(`   ✅ Created game: ${newGame._id}`)
  console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${newGame._id}`)
}

async function run() {
  try {
    const client = getCliClient()

    // Fetch all games by their correct IDs
    const games = await fetchGamesByIds(CORRECT_GAME_IDS)

    console.log(`\n✅ Fetched ${games.length} games from API\n`)

    if (games.length !== CORRECT_GAME_IDS.length) {
      console.warn(`⚠️  Warning: Expected ${CORRECT_GAME_IDS.length} games but got ${games.length}`)
    }

    // Import or update each game
    for (const game of games) {
      await importOrUpdateGame(client, game)
    }

    console.log('\n\n✅ All poker games imported/updated successfully!')
    console.log('\n📋 Summary:')
    games.forEach((game) => {
      console.log(`   ${game.name} (ID: ${game.id})`)
    })
  } catch (error) {
    console.error('\n❌ Import failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

run()
