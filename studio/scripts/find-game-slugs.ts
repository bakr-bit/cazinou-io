// studio/scripts/find-game-slugs.ts
// Script to find SlotsLaunch slugs and IDs for curated game list
// Usage: npx sanity exec scripts/find-game-slugs.ts --with-user-token

import * as fs from 'fs'
import * as path from 'path'

const SLOTSLAUNCH_TOKEN = process.env.SLOTSLAUNCH_TOKEN
const SLOTSLAUNCH_ORIGIN = process.env.SLOTSLAUNCH_ORIGIN || 'https://cazinou.io'

// Your 50 curated games with provider names
const CURATED_GAMES = [
  {name: '88 Coins', provider: 'Geco Gaming'},
  {name: 'Aloha! Cluster Pays', provider: 'NetEnt'},
  {name: 'Aviator', provider: 'Spribe'},
  {name: 'Beach Life', provider: 'Playtech'},
  {name: 'Big Bass Bonanza', provider: 'Pragmatic Play'},
  {name: 'Blood Suckers', provider: 'NetEnt'},
  {name: 'Blood Suckers Megaways', provider: 'Red Tiger'},
  {name: 'Bonanza Megaways', provider: 'Big Time Gaming'},
  {name: 'Book of 99', provider: 'Relax Gaming'},
  {name: 'Book of Dead', provider: "Play'n GO"},
  {name: 'Buffalo Blitz', provider: 'Playtech'},
  {name: 'Butterfly Staxx', provider: 'NetEnt'},
  {name: 'Cleopatra Gold', provider: 'IGT'},
  {name: 'Dead or Alive', provider: 'NetEnt'},
  {name: 'Divine Fortune Megaways', provider: 'NetEnt'},
  {name: "Finn's Golden Tavern", provider: 'NetEnt'},
  {name: "Fishin' Frenzy", provider: 'Blueprint Gaming'},
  {name: 'Fruit Shop', provider: 'NetEnt'},
  {name: 'Gates of Olympus', provider: 'Pragmatic Play'},
  {name: 'Gates of Olympus 1000', provider: 'Pragmatic Play'},
  {name: "Gonzo's Quest", provider: 'NetEnt'},
  {name: "Guns N' Roses", provider: 'NetEnt'},
  {name: 'Jackpot Giant', provider: 'Playtech'},
  {name: 'Jimi Hendrix', provider: 'NetEnt'},
  {name: 'Major Millions', provider: 'Microgaming'},
  {name: 'Medusa Megaways', provider: 'NextGen Gaming'},
  {name: 'Mega Joker', provider: 'NetEnt'},
  {name: 'Mega Moolah', provider: 'Microgaming'},
  {name: 'Money Train', provider: 'Relax Gaming'},
  {name: 'Money Train 2', provider: 'Relax Gaming'},
  {name: 'Money Train 3', provider: 'Relax Gaming'},
  {name: 'Piggy Riches', provider: 'NetEnt'},
  {name: 'Pirots 2', provider: 'ELK Studios'},
  {name: 'Pirots 3', provider: 'ELK Studios'},
  {name: 'Razor Shark', provider: 'Push Gaming'},
  {name: 'Reactoonz', provider: "Play'n GO"},
  {name: 'Starburst', provider: 'NetEnt'},
  {name: 'Starburst XXXtreme', provider: 'NetEnt'},
  {name: 'Starmania', provider: 'NextGen Gaming'},
  {name: 'Sugar Rush 1000', provider: 'Pragmatic Play'},
  {name: 'Sweet Bonanza', provider: 'Pragmatic Play'},
  {name: 'Sweet Bonanza 1000', provider: 'Pragmatic Play'},
  {name: 'Thunderstruck', provider: 'Games Global'},
  {name: 'Thunderstruck II', provider: 'Microgaming'},
  {name: 'Tombstone R.I.P.', provider: 'Nolimit City'},
  {name: 'Valley of the Gods', provider: 'Yggdrasil'},
  {name: 'Vikings Go Berzerk', provider: 'Yggdrasil'},
  {name: 'Wheel of Fortune: Triple Extreme Spin', provider: 'IGT'},
  {name: 'White Rabbit Megaways', provider: 'Big Time Gaming'},
  {name: 'WOW Pot', provider: 'Microgaming'},
]

type Game = {
  id: number
  name: string
  slug: string
  provider: string
  provider_id?: number
  thumbnail?: string
}

type Provider = {
  id: number
  name: string
  slug: string
}

type MatchResult = {
  searchName: string
  searchProvider: string
  found: boolean
  game?: {
    id: number
    name: string
    slug: string
    provider: string
    providerId?: number
  }
  alternatives?: Array<{
    name: string
    slug: string
    provider: string
  }>
}

/**
 * Normalize string for comparison (remove special chars, lowercase, trim)
 */
function normalize(str: string | undefined | null): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/[''']/g, '') // Remove apostrophes
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Check if provider names match (handles variations like "Microgaming" vs "Games Global")
 */
function providerMatches(searchProvider: string, apiProvider: string): boolean {
  const normalized1 = normalize(searchProvider)
  const normalized2 = normalize(apiProvider)

  // Exact match
  if (normalized1 === normalized2) return true

  // Handle common variations
  const variations: Record<string, string[]> = {
    microgaming: ['microgaming', 'games global'],
    'games global': ['microgaming', 'games global'],
    playngo: ['playn go', 'play n go', 'playngo'],
  }

  for (const [key, alts] of Object.entries(variations)) {
    if (alts.includes(normalized1) && alts.includes(normalized2)) {
      return true
    }
  }

  // Partial match (one contains the other)
  return normalized1.includes(normalized2) || normalized2.includes(normalized1)
}

/**
 * Fetch games from SlotsLaunch API
 */
async function fetchGames(page: number = 1, perPage: number = 150): Promise<Game[]> {
  if (!SLOTSLAUNCH_TOKEN) {
    throw new Error('SLOTSLAUNCH_TOKEN environment variable is required')
  }

  const url = new URL('https://slotslaunch.com/api/games')
  url.searchParams.set('token', SLOTSLAUNCH_TOKEN)
  url.searchParams.set('page', page.toString())
  url.searchParams.set('per_page', perPage.toString())
  url.searchParams.set('order', 'asc')
  url.searchParams.set('order_by', 'name')

  console.log(`  Fetching page ${page}...`)

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Origin: SLOTSLAUNCH_ORIGIN,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Fetch all providers
 */
async function fetchProviders(): Promise<Provider[]> {
  if (!SLOTSLAUNCH_TOKEN) {
    throw new Error('SLOTSLAUNCH_TOKEN environment variable is required')
  }

  const url = new URL('https://slotslaunch.com/api/providers')
  url.searchParams.set('token', SLOTSLAUNCH_TOKEN)
  url.searchParams.set('per_page', '200')

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      Origin: SLOTSLAUNCH_ORIGIN,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Search for a game by name and provider
 */
function findGame(
  searchName: string,
  searchProvider: string,
  allGames: Game[]
): MatchResult {
  const normalizedSearchName = normalize(searchName)
  const results: MatchResult = {
    searchName,
    searchProvider,
    found: false,
    alternatives: [],
  }

  // Try to find exact match first
  for (const game of allGames) {
    const normalizedGameName = normalize(game.name)

    if (normalizedGameName === normalizedSearchName) {
      if (providerMatches(searchProvider, game.provider)) {
        results.found = true
        results.game = {
          id: game.id,
          name: game.name,
          slug: game.slug,
          provider: game.provider,
          providerId: game.provider_id,
        }
        return results
      }
    }
  }

  // If no exact match, find close matches
  for (const game of allGames) {
    const normalizedGameName = normalize(game.name)

    // Check if game name is very similar (contains or is contained)
    if (
      normalizedGameName.includes(normalizedSearchName) ||
      normalizedSearchName.includes(normalizedGameName)
    ) {
      if (results.alternatives!.length < 3) {
        results.alternatives!.push({
          name: game.name,
          slug: game.slug,
          provider: game.provider || 'Unknown',
        })
      }
    }
  }

  return results
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🎰 Finding Game Slugs for Curated List\n')

  // Step 1: Fetch ALL games from API (no page limit)
  console.log('📥 Fetching ALL games from API...')
  console.log('   This may take 5-10 minutes...\n')
  const allGames: Game[] = []
  const PER_PAGE = 100 // API seems to limit to 100 per page
  let page = 1
  let hasMore = true

  while (hasMore) {
    const games = await fetchGames(page, PER_PAGE)
    allGames.push(...games)

    if (games.length < PER_PAGE) {
      console.log(`\n  ✅ Reached end of games at page ${page}`)
      hasMore = false
    } else {
      // Progress indicator every 10 pages
      if (page % 10 === 0) {
        console.log(`  Progress: ${page} pages fetched (${allGames.length} games)...`)
      }
    }

    page++

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  console.log(`  Total games fetched: ${allGames.length}\n`)

  // Step 2: Search for each curated game
  console.log('🔍 Searching for curated games...\n')

  const results: MatchResult[] = []
  const foundGames: MatchResult['game'][] = []
  const notFound: MatchResult[] = []

  for (const curatedGame of CURATED_GAMES) {
    const result = findGame(curatedGame.name, curatedGame.provider, allGames)
    results.push(result)

    if (result.found && result.game) {
      foundGames.push(result.game)
      console.log(`  ✅ ${curatedGame.name} → ${result.game.slug}`)
    } else {
      notFound.push(result)
      console.log(`  ❌ ${curatedGame.name} (${curatedGame.provider}) - NOT FOUND`)
      if (result.alternatives && result.alternatives.length > 0) {
        console.log(`     Alternatives:`)
        result.alternatives.forEach((alt) => {
          console.log(`       - ${alt.name} (${alt.provider}) → ${alt.slug}`)
        })
      }
    }
  }

  // Step 3: Generate output files
  console.log('\n📝 Generating output files...\n')

  // TypeScript config file
  const tsContent = `// frontend/lib/curated-games.ts
// Auto-generated curated game list
// Generated on ${new Date().toISOString()}

export const CURATED_GAME_SLUGS = [
${foundGames.map((game) => `  '${game!.slug}', // ${game!.name} (${game!.provider})`).join('\n')}
] as const

export const CURATED_GAME_IDS = [
${foundGames.map((game) => `  ${game!.id}, // ${game!.name} (${game!.provider})`).join('\n')}
] as const

export type CuratedGameSlug = typeof CURATED_GAME_SLUGS[number]
`

  const tsPath = path.resolve(__dirname, '../../frontend/lib/curated-games.ts')
  fs.writeFileSync(tsPath, tsContent, 'utf-8')
  console.log(`  ✅ Created ${tsPath}`)

  // JSON results for review
  const jsonPath = path.resolve(__dirname, '../../frontend/lib/curated-games-results.json')
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        found: foundGames.length,
        notFound: notFound.length,
        total: CURATED_GAMES.length,
        results: results,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf-8'
  )
  console.log(`  ✅ Created ${jsonPath}`)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   Total games searched: ${CURATED_GAMES.length}`)
  console.log(`   Found: ${foundGames.length}`)
  console.log(`   Not found: ${notFound.length}`)
  console.log('='.repeat(60) + '\n')

  if (notFound.length > 0) {
    console.log('⚠️  Some games were not found. Please review alternatives above.')
    console.log('   You may need to manually add or adjust game names.\n')
  } else {
    console.log('✅ All games found! You can now use the generated curated-games.ts file.\n')
  }
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Script failed:', error)
  process.exit(1)
})
