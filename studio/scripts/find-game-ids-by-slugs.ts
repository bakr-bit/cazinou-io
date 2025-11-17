const API_BASE = 'https://slotslaunch.com/api'
const token = process.env.SANITY_STUDIO_SLOTSLAUNCH_TOKEN || process.env.SLOTSLAUNCH_TOKEN
const origin = process.env.SANITY_STUDIO_SLOTSLAUNCH_ORIGIN || process.env.SLOTSLAUNCH_ORIGIN || 'cazinou.io'

const MISSING_SLUGS = [
  'shining-crown',
  'burning-hot',
  'sizzling-hot-deluxe',
  'dice-roll',
  'lucky-wild',
  'sweet-bonanza',
  'gates-of-olympus',
  'the-dog-house',
  'madame-destiny-megaways',
  'fruit-party',
]

type SlotGame = {
  id: number
  name: string
  slug: string
  provider: string
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

async function findGameIdsBySlugs() {
  try {
    const allGames = await fetchAllGames()

    console.log(`\n\n📋 Searching for ${MISSING_SLUGS.length} game slugs...\n`)

    const foundGames: {slug: string; id: number; name: string}[] = []
    const notFoundSlugs: string[] = []

    for (const slug of MISSING_SLUGS) {
      const game = allGames.find((g) => g.slug === slug)

      if (game) {
        foundGames.push({slug: game.slug, id: game.id, name: game.name})
        console.log(`✅ Found: ${game.name} (ID: ${game.id}, Slug: ${slug})`)
      } else {
        notFoundSlugs.push(slug)
        console.log(`❌ Not found: ${slug}`)
      }
    }

    if (foundGames.length > 0) {
      const ids = foundGames.map(g => g.id)
      console.log(`\n\n📝 Game IDs to import:`)
      console.log(`const GAME_IDS = [${ids.join(', ')}]`)
    }

    if (notFoundSlugs.length > 0) {
      console.log(`\n\n⚠️  ${notFoundSlugs.length} slugs not found in catalog:`)
      notFoundSlugs.forEach(slug => console.log(`   - ${slug}`))
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

findGameIdsBySlugs()
