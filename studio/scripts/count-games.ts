import {getCliClient} from 'sanity/cli'

const client = getCliClient()

async function countGames() {
  const games = await client.fetch('*[_type == "game"]{ _id, name, slotsLaunchSlug, rating } | order(rating desc, name asc)')

  console.log(`\n📊 Total games in Sanity: ${games.length}\n`)
  console.log('Top games by rating:')
  games.slice(0, 15).forEach((g: any) => {
    const rating = g.rating ? ` (${g.rating}⭐)` : ''
    console.log(`  - ${g.name}${rating}`)
  })
  if (games.length > 15) {
    console.log(`  ... and ${games.length - 15} more`)
  }
}

countGames()
