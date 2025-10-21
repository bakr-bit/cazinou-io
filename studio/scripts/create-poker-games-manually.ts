import {getCliClient} from 'sanity/cli'

// Game data extracted from the HTML
const POKER_GAMES = [
  {
    name: 'Video Poker',
    slug: 'video-poker',
    provider: {
      name: 'Orbital Gaming',
      slug: 'orbital-gaming',
    },
    slotsLaunchId: 15795,
    slotsLaunchThumb: 'https://slotslaunch.nyc3.digitaloceanspaces.com/19705/video-poker.jpg',
  },
  {
    name: 'Double Joker – Power Poker',
    slug: 'double-joker-power-poker',
    provider: {
      name: 'Flip Five Gaming',
      slug: 'flip-five-gaming',
    },
    slotsLaunchId: 11279,
    slotsLaunchThumb: 'https://assets.slotslaunch.com/27390/double-joker-power-poker.jpg',
  },
  {
    name: 'Deuces & Joker – Power Poker',
    slug: 'deuces-joker-power-poker',
    provider: {
      name: 'Flip Five Gaming',
      slug: 'flip-five-gaming',
    },
    slotsLaunchId: 11276,
    slotsLaunchThumb: 'https://assets.slotslaunch.com/27393/deuces-and-joker-power-poker.jpg',
  },
  {
    name: 'Joker Poker',
    slug: 'joker-poker',
    provider: {
      name: 'iSoftBet',
      slug: 'isoftbet',
    },
    slotsLaunchId: 10667,
    slotsLaunchThumb: 'https://slotslaunch.nyc3.digitaloceanspaces.com/13383/joker-poker1.jpg',
  },
]

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

async function createGame(client: any, gameData: typeof POKER_GAMES[0]) {
  console.log(`\n📦 Creating: ${gameData.name}`)
  console.log(`   Slug: ${gameData.slug}`)
  console.log(`   Provider: ${gameData.provider.name}`)
  console.log(`   SlotsLaunch ID: ${gameData.slotsLaunchId}`)

  // Check if game already exists
  const existingGame = await client.fetch(
    `*[_type == "game" && (slotsLaunchId == $id || slug.current == $slug)][0]`,
    {id: gameData.slotsLaunchId, slug: gameData.slug}
  )

  if (existingGame) {
    console.log(`   ⚠️  Game already exists in Sanity: ${existingGame._id}`)
    console.log(`   Updating existing document...`)

    await client
      .patch(existingGame._id)
      .set({
        name: gameData.name,
        slotsLaunchId: gameData.slotsLaunchId,
        slotsLaunchSlug: gameData.slug,
        slotsLaunchThumb: gameData.slotsLaunchThumb,
      })
      .commit()

    console.log(`   ✅ Updated game: ${existingGame._id}`)
    console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${existingGame._id}`)
    return
  }

  // Create or find provider
  const providerId = await findOrCreateProvider(
    client,
    gameData.provider.name,
    gameData.provider.slug
  )

  // Create game
  console.log(`   📝 Creating new game document...`)
  const newGame = await client.create({
    _type: 'game',
    name: gameData.name,
    slug: {
      _type: 'slug',
      current: gameData.slug,
    },
    slotsLaunchId: gameData.slotsLaunchId,
    slotsLaunchSlug: gameData.slug,
    slotsLaunchThumb: gameData.slotsLaunchThumb,
    provider: {
      _type: 'reference',
      _ref: providerId,
    },
    rating: 4.0,
  })

  console.log(`   ✅ Successfully created game!`)
  console.log(`   Sanity ID: ${newGame._id}`)
  console.log(`   Edit: https://cazinou.sanity.studio/desk/game;${newGame._id}`)
}

async function run() {
  try {
    const client = getCliClient()

    console.log(`📋 Creating ${POKER_GAMES.length} poker games manually...\n`)

    for (const gameData of POKER_GAMES) {
      await createGame(client, gameData)
    }

    console.log('\n\n✅ All games created successfully!')
  } catch (error) {
    console.error('\n❌ Creation failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

run()
