import {getCliClient} from 'sanity/cli'

// Featured game slugs from FeaturedSlotsGrid component
const FEATURED_SLUGS = [
  'shining-crown-demo',
  'burning-hot-demo',
  'sizzling-hot-deluxe',
  'book-of-ra-deluxe',
  'dice-roll',
  'lucky-wild',
  'sweet-bonanza-demo',
  'gates-of-olympus-demo',
  'big-bass-bonanza',
  'the-dog-house',
  'madame-destiny-megaways',
  'fruit-party',
]

async function checkFeaturedGames() {
  const client = getCliClient()

  console.log('🔍 Checking which featured games are in Sanity...\n')

  const existingGames = await client.fetch(
    `*[_type == "game" && slotsLaunchSlug in $slugs]{
      _id,
      name,
      slotsLaunchId,
      slotsLaunchSlug
    }`,
    {slugs: FEATURED_SLUGS}
  )

  const existingSlugs = new Set(existingGames.map((g: any) => g.slotsLaunchSlug))
  const missingSlugs = FEATURED_SLUGS.filter(slug => !existingSlugs.has(slug))

  console.log(`✅ Found ${existingGames.length} games in Sanity:`)
  existingGames.forEach((game: any) => {
    console.log(`   - ${game.name} (${game.slotsLaunchSlug})`)
  })

  if (missingSlugs.length > 0) {
    console.log(`\n❌ Missing ${missingSlugs.length} games:`)
    missingSlugs.forEach(slug => {
      console.log(`   - ${slug}`)
    })
    console.log('\n📝 These slugs need to be imported from SlotsLaunch API')
  } else {
    console.log('\n🎉 All featured games are already in Sanity!')
  }
}

checkFeaturedGames().catch(console.error)
