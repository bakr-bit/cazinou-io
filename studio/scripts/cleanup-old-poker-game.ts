import {getCliClient} from 'sanity/cli'

async function run() {
  const client = getCliClient()

  console.log('🔍 Looking for old game with wrong slug...')

  const oldGame = await client.fetch(
    `*[_type == "game" && slug.current == "deuces-joker-power-poker"][0]`
  )

  if (oldGame) {
    console.log(`\n⚠️  Found old game with wrong slug:`)
    console.log(`   ID: ${oldGame._id}`)
    console.log(`   Name: ${oldGame.name}`)
    console.log(`   Slug: ${oldGame.slug.current}`)
    console.log(`   SlotsLaunch ID: ${oldGame.slotsLaunchId}`)

    console.log(`\n🗑️  Deleting old game...`)
    await client.delete(oldGame._id)
    console.log(`✅ Deleted old game`)
  } else {
    console.log('✅ No old game found with slug "deuces-joker-power-poker"')
  }
}

run().catch(console.error)
