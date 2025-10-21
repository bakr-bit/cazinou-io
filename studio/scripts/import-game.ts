// studio/scripts/import-game.ts
// CLI script to import a game from SlotsLaunch API into Sanity
// Usage: npm run import-game -- --slug="book-of-ra" or --id=12345

import {getCliClient} from 'sanity/cli'

const API_BASE = 'https://slotslaunch.com/api'
const token = process.env.SLOTSLAUNCH_TOKEN
const origin = process.env.SLOTSLAUNCH_ORIGIN || 'cazinou.io'

type SlotGame = {
  id: number
  name: string
  slug: string
  description: string | null
  url: string
  thumb: string
  provider_id: number
  provider: string
  provider_slug: string
  type_id: number
  type: string
  type_slug: string
  rtp: string
  volatility: string
  release: string
  published: number
}

type GamesResponse = {
  data: SlotGame[]
}

function buildUrl(path: string, params: Record<string, string | number> = {}) {
  if (!token) {
    throw new Error('SLOTSLAUNCH_TOKEN environment variable is not set')
  }

  const url = new URL(`${API_BASE}/${path}`)
  url.searchParams.set('token', token)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
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

async function fetchGameBySlug(slug: string): Promise<SlotGame | null> {
  console.log(`🔍 Searching for game with slug: ${slug}`)

  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      buildUrl('games', {
        page,
        per_page: 100,
        order: 'asc',
        order_by: 'name',
      }),
      {
        headers: getHeaders(),
        signal: AbortSignal.timeout(30000),
      }
    )

    if (!res.ok) {
      throw new Error(`SlotsLaunch API returned ${res.status}`)
    }

    const data: GamesResponse = await res.json()
    const game = data.data.find((g) => g.slug === slug)

    if (game) {
      return game
    }

    if (data.data.length < 100) {
      break
    }

    console.log(`   Searched page ${page}, continuing...`)
  }

  return null
}

async function fetchGameById(id: number): Promise<SlotGame | null> {
  console.log(`🔍 Fetching game with ID: ${id}`)

  const res = await fetch(buildUrl('games', {id}), {
    headers: getHeaders(),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    throw new Error(`SlotsLaunch API returned ${res.status}`)
  }

  const data: GamesResponse = await res.json()
  return data.data[0] || null
}

async function findOrCreateProvider(client: any, providerName: string, providerSlug: string) {
  // Check if provider already exists
  const existingProvider = await client.fetch(
    `*[_type == "provider" && slug.current == $slug][0]`,
    {slug: providerSlug}
  )

  if (existingProvider) {
    console.log(`✅ Found existing provider: ${providerName}`)
    return existingProvider._id
  }

  // Create new provider
  console.log(`📝 Creating new provider: ${providerName}`)
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

async function importGame(gameSlugOrId: string) {
  const client = getCliClient()

  let game: SlotGame | null = null

  // Detect if input is a number (ID) or string (slug)
  const gameId = parseInt(gameSlugOrId)
  if (!isNaN(gameId)) {
    game = await fetchGameById(gameId)
  } else {
    game = await fetchGameBySlug(gameSlugOrId)
  }

  if (!game) {
    console.error(`❌ Game not found: ${gameSlugOrId}`)
    process.exit(1)
  }

  console.log(`\n✅ Found game:`)
  console.log(`   Name: ${game.name}`)
  console.log(`   ID: ${game.id}`)
  console.log(`   Slug: ${game.slug}`)
  console.log(`   Provider: ${game.provider}`)
  console.log(`   Thumbnail: ${game.thumb}`)
  console.log('')

  // Check if game already exists in Sanity
  const existingGame = await client.fetch(
    `*[_type == "game" && (slotsLaunchId == $id || slotsLaunchSlug == $slug)][0]`,
    {id: game.id, slug: game.slug}
  )

  if (existingGame) {
    console.log(`⚠️  Game already exists in Sanity: ${existingGame._id}`)
    console.log(`   Updating existing document...`)

    // Update existing
    await client
      .patch(existingGame._id)
      .set({
        name: game.name,
        slotsLaunchId: game.id,
        slotsLaunchSlug: game.slug,
        slotsLaunchThumb: game.thumb,
      })
      .commit()

    console.log(`✅ Updated game: ${existingGame._id}`)
    return
  }

  // Find or create provider
  const providerId = await findOrCreateProvider(client, game.provider, game.provider_slug)

  // Create new game document
  console.log(`📝 Creating new game document...`)

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
    rating: 4.0, // Default rating, can be customized later
  })

  console.log(`\n✅ Successfully imported game!`)
  console.log(`   Sanity ID: ${newGame._id}`)
  console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${newGame._id}`)
}

// Parse command line arguments
const args = process.argv.slice(2)
const slugArg = args.find((arg) => arg.startsWith('--slug='))
const idArg = args.find((arg) => arg.startsWith('--id='))

const gameInput = slugArg?.replace('--slug=', '') || idArg?.replace('--id=', '')

if (!gameInput) {
  console.error('Usage: sanity exec scripts/import-game.ts --with-user-token -- --slug="book-of-ra"')
  console.error('   or: sanity exec scripts/import-game.ts --with-user-token -- --id=12345')
  process.exit(1)
}

importGame(gameInput).catch((error) => {
  console.error('❌ Import failed:', error.message)
  process.exit(1)
})
