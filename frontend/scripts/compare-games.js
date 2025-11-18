const {createClient} = require('@sanity/client')
const fs = require('fs')
const path = require('path')

const client = createClient({
  projectId: '78bidtls',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk89tPZ2QFJGhsaCKiEAIsmQg8Qehe1kzxVwZ0M5xnk7uNkKd6TPhYTntOyyNOcmNrKp1Jzb64debWYPdDaoPqPjOXT5en0uOj97gNynaLfN9tp16GfeDJgEazi8ZmcvZZdxEsAwZmQt6uKb0Rm5e4pLdFE7SLXGchGpmuAtfZsTvuiKV2Vw',
})

async function compareGames() {
  try {
    // Fetch all games from Sanity
    const sanityGames = await client.fetch(`
      *[_type == "game"] {
        name,
        "slug": slug.current
      } | order(name asc)
    `)

    console.log(`\n📊 Found ${sanityGames.length} games in Sanity\n`)

    // Get markdown files
    const mdDir = '/Users/simon/cazino-all/cazinou-io/md content/pacanele-improved(additional content for demos)'
    const mdFiles = fs.readdirSync(mdDir)

    // Extract slugs from markdown filenames
    const mdGameSlugs = mdFiles.map(file => {
      // Remove -demo-improved.md or -improved.md suffix
      return file
        .replace('-demo-improved.md', '')
        .replace('-improved.md', '')
    })

    console.log(`📄 Found ${mdGameSlugs.length} markdown files\n`)

    // Get Sanity game slugs
    const sanityGameSlugs = sanityGames.map(g => g.slug)

    // Find missing games (in markdown but not in Sanity)
    const missingGames = mdGameSlugs.filter(mdSlug => {
      return !sanityGameSlugs.includes(mdSlug)
    })

    console.log(`\n🔍 MISSING GAMES IN SANITY (${missingGames.length}):\n`)
    console.log('='*60)

    if (missingGames.length === 0) {
      console.log('✅ All markdown games exist in Sanity!')
    } else {
      missingGames.forEach((slug, index) => {
        console.log(`${index + 1}. ${slug}`)
      })
    }

    // Also show games that are in Sanity but not in markdown
    const extraGamesInSanity = sanityGameSlugs.filter(sanitySlug => {
      return !mdGameSlugs.includes(sanitySlug)
    })

    console.log(`\n\n📋 GAMES IN SANITY BUT NOT IN MARKDOWN (${extraGamesInSanity.length}):\n`)
    console.log('='*60)

    if (extraGamesInSanity.length === 0) {
      console.log('(None)')
    } else {
      extraGamesInSanity.forEach((slug, index) => {
        const game = sanityGames.find(g => g.slug === slug)
        console.log(`${index + 1}. ${game.name} (${slug})`)
      })
    }

    // Summary
    console.log(`\n\n📈 SUMMARY:\n`)
    console.log('='*60)
    console.log(`Total markdown files: ${mdGameSlugs.length}`)
    console.log(`Total Sanity games: ${sanityGames.length}`)
    console.log(`Missing in Sanity: ${missingGames.length}`)
    console.log(`Extra in Sanity: ${extraGamesInSanity.length}`)

  } catch (error) {
    console.error('Error:', error)
  }
}

compareGames()
