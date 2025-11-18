import {getCliClient} from 'sanity/cli'

// Game data extracted from markdown files and live site
const GAMES_DATA = [
  {id: 11115, slug: '20-golden-coins', name: '20 Golden Coins', provider: 'Amusnet'},
  {id: 11142, slug: 'amazons-battle', name: "Amazons' Battle", provider: 'Amusnet'},
  {id: 13371, slug: 'faust', name: 'Faust', provider: 'Novomatic'},
  {id: 5394, slug: 'fruit-party', name: 'Fruit Party', provider: 'Pragmatic Play'},
  {id: 5399, slug: 'gems-bonanza', name: 'Gems Bonanza', provider: 'Pragmatic Play'},
  {id: 5405, slug: 'great-rhino', name: 'Great Rhino', provider: 'Pragmatic Play'},
  {id: 5420, slug: 'john-hunter-and-the-book-of-tut', name: 'John Hunter and the Book of Tut', provider: 'Pragmatic Play'},
  {id: 13534, slug: 'just-jewels-deluxe', name: 'Just Jewels Deluxe', provider: 'Novomatic'},
  {id: 19516, slug: 'katana', name: 'Katana', provider: 'Novomatic'},
  {id: 13376, slug: 'lord-of-the-ocean', name: 'Lord of the Ocean', provider: 'Novomatic'},
  {id: 11203, slug: 'majestic-forest', name: 'Majestic Forest', provider: 'Amusnet'},
  {id: 25632, slug: 'mines', name: 'Mines', provider: 'Spribe'},
  {id: 17180, slug: 'neon-shapes-tetris-gratis', name: 'Neon Shapes', provider: 'BGaming'},
  {id: 11214, slug: 'penguin-style', name: 'Penguin Style', provider: 'Amusnet'},
  {id: 11222, slug: 'rise-of-ra', name: 'Rise of Ra', provider: 'Amusnet'},
  {id: 13386, slug: 'roaring-forties', name: 'Roaring Forties', provider: 'Novomatic'},
  {id: 2860, slug: 'san-quentin', name: 'San Quentin', provider: 'Nolimit City'},
  {id: 5478, slug: 'starlight-princess', name: 'Starlight Princess', provider: 'Pragmatic Play'},
  {id: 11232, slug: 'supreme-hot', name: 'Supreme Hot', provider: 'Amusnet'},
  {id: 3328, slug: 'the-dog-house-megaways', name: 'The Dog House Megaways', provider: 'Pragmatic Play'},
  {id: 11244, slug: 'vampire-night', name: 'Vampire Night', provider: 'Amusnet'},
  {id: 10110, slug: 'wild-north', name: 'Wild North', provider: 'Play n Go'},
]

async function findOrCreateProvider(client: any, providerName: string) {
  // Generate slug from provider name
  const providerSlug = providerName
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

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

async function importGame(client: any, gameData: typeof GAMES_DATA[0]) {
  console.log(`\n📦 Importing: ${gameData.name}`)
  console.log(`   ID: ${gameData.id}`)
  console.log(`   Slug: ${gameData.slug}`)
  console.log(`   Provider: ${gameData.provider}`)

  // Check if game already exists
  const existingGame = await client.fetch(
    `*[_type == "game" && (slotsLaunchId == $id || slotsLaunchSlug == $slug || slug.current == $slug)][0]`,
    {id: gameData.id, slug: gameData.slug}
  )

  if (existingGame) {
    console.log(`   ⚠️  Game already exists in Sanity: ${existingGame._id}`)
    console.log(`   Updating existing document...`)

    await client
      .patch(existingGame._id)
      .set({
        name: gameData.name,
        slotsLaunchId: gameData.id,
        slotsLaunchSlug: gameData.slug,
        slotsLaunchThumb: `https://assets.slotslaunch.com/${gameData.id}/${gameData.slug}.jpg`,
      })
      .commit()

    console.log(`   ✅ Updated game: ${existingGame._id}`)
    return 'updated'
  }

  // Create provider if needed
  const providerId = await findOrCreateProvider(client, gameData.provider)

  // Create game
  console.log(`   📝 Creating new game document...`)
  const newGame = await client.create({
    _type: 'game',
    name: gameData.name,
    slug: {
      _type: 'slug',
      current: gameData.slug,
    },
    slotsLaunchId: gameData.id,
    slotsLaunchSlug: gameData.slug,
    slotsLaunchThumb: `https://assets.slotslaunch.com/${gameData.id}/${gameData.slug}.jpg`,
    provider: {
      _type: 'reference',
      _ref: providerId,
    },
    rating: 4.0,
  })

  console.log(`   ✅ Successfully created game!`)
  console.log(`   Sanity ID: ${newGame._id}`)
  return 'created'
}

async function run() {
  try {
    const client = getCliClient()

    console.log('🎰 Importing 22 Missing Games to Sanity (Manual Import)\n')
    console.log('='.repeat(70))

    let created = 0
    let updated = 0
    let errors = 0

    for (const gameData of GAMES_DATA) {
      try {
        const result = await importGame(client, gameData)
        if (result === 'created') created++
        if (result === 'updated') updated++
      } catch (error) {
        console.log(`   ❌ Error: ${(error as Error).message}`)
        errors++
      }
    }

    console.log('\n\n' + '='.repeat(70))
    console.log('📊 Import Summary:\n')
    console.log(`   Total games: ${GAMES_DATA.length}`)
    console.log(`   ✅ Newly created: ${created}`)
    console.log(`   🔄 Updated: ${updated}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log('='.repeat(70))
    console.log('\n✅ All imports completed!')
    console.log('\n📝 Next step: Run import-game-content.ts to add markdown content')
  } catch (error) {
    console.error('\n❌ Import failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

run()
