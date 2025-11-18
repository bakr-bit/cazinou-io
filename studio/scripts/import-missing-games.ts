import {getCliClient} from 'sanity/cli'

const API_BASE = 'https://slotslaunch.com/api'
const token = process.env.SANITY_STUDIO_SLOTSLAUNCH_TOKEN || process.env.SLOTSLAUNCH_TOKEN
const origin = process.env.SANITY_STUDIO_SLOTSLAUNCH_ORIGIN || process.env.SLOTSLAUNCH_ORIGIN || 'cazinou.io'

// Missing game IDs from the analysis
const GAME_IDS = [
  11115, // 20-golden-coins
  11142, // amazons-battle
  13371, // faust
  5394,  // fruit-party
  5399,  // gems-bonanza
  5405,  // great-rhino
  5420,  // john-hunter-and-the-book-of-tut
  13534, // just-jewels-deluxe
  19516, // katana
  13376, // lord-of-the-ocean
  11203, // majestic-forest
  25632, // mines
  17180, // neon-shapes-tetris-gratis
  11214, // penguin-style
  11222, // rise-of-ra
  13386, // roaring-forties
  2860,  // san-quentin
  5478,  // starlight-princess
  11232, // supreme-hot
  3328,  // the-dog-house-megaways
  11244, // vampire-night
  10110, // wild-north
]

type SlotGame = {
  id: number
  name: string
  slug: string
  provider: string
  provider_slug: string
  thumb: string
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

async function fetchAllGames(): Promise<SlotGame[]> {
  console.log('🔍 Fetching all games from SlotsLaunch API...')
  const allGames: SlotGame[] = []

  for (let page = 1; page <= 100; page++) {
    process.stdout.write(`\r   Fetching page ${page}/100...`)

    const res = await fetch(
      buildUrl('games', {
        page,
        per_page: 100,
        order: 'asc',
        order_by: 'name',
      }),
      {
        headers: getHeaders(),
        signal: AbortSignal.timeout(45000),
      }
    )

    if (!res.ok) {
      throw new Error(`SlotsLaunch API returned ${res.status}`)
    }

    const data: GamesResponse = await res.json()

    if (!data.data || data.data.length === 0) {
      console.log(`\n✅ Reached end of catalog at page ${page}`)
      break
    }

    allGames.push(...data.data)

    if (data.data.length < 100) {
      console.log(`\n✅ Fetched all games (${allGames.length} total)`)
      break
    }
  }

  return allGames
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
    rating: 4.0,
  })

  console.log(`   ✅ Successfully imported game!`)
  console.log(`   Sanity ID: ${newGame._id}`)
  console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${newGame._id}`)
}

async function run() {
  try {
    const client = getCliClient()

    console.log('🎰 Importing 22 Missing Games to Sanity\n')
    console.log('='.repeat(70))

    // Fetch all games
    const allGames = await fetchAllGames()

    console.log(`\n📋 Searching for ${GAME_IDS.length} games by ID...\n`)

    let imported = 0
    let updated = 0
    let notFound = 0

    for (const gameId of GAME_IDS) {
      const game = allGames.find((g) => g.id === gameId)

      if (!game) {
        console.log(`\n❌ Game with ID ${gameId} not found in catalog`)
        notFound++
        continue
      }

      const existingGame = await client.fetch(
        `*[_type == "game" && (slotsLaunchId == $id || slotsLaunchSlug == $slug)][0]`,
        {id: game.id, slug: game.slug}
      )

      await importGameById(client, game)

      if (existingGame) {
        updated++
      } else {
        imported++
      }
    }

    console.log('\n\n' + '='.repeat(70))
    console.log('📊 Import Summary:\n')
    console.log(`   Total games: ${GAME_IDS.length}`)
    console.log(`   ✅ Newly imported: ${imported}`)
    console.log(`   🔄 Updated: ${updated}`)
    console.log(`   ❌ Not found: ${notFound}`)
    console.log('='.repeat(70))
    console.log('\n✅ All imports completed!')
    console.log('\n📝 Next step: Run import-game-content.ts to add markdown content')
  } catch (error) {
    console.error('\n❌ Import failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

run()
