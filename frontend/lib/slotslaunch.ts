// lib/slotslaunch.ts
import {unstable_cache} from 'next/cache'

export type Theme = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  created_at: string
  updated_at: string
}

export type SlotGame = {
  id: number
  name: string
  slug: string
  description: string | null
  url: string // iframe URL: https://slotslaunch.com/iframe/{id}
  thumb: string
  provider_id: number
  provider: string
  provider_slug: string
  type_id: number
  type: string
  type_slug: string
  themes: Theme[]
  megaways: number
  bonus_buy: number
  progressive: number
  featured: number
  release: string
  reels: string
  payline: string
  rtp: string
  volatility: string
  currencies: string
  languages: string
  land_based: string | number
  markets: string | any[]
  cluster_slot: string
  max_exposure: string
  min_bet: string | number
  max_bet: string | number
  max_win_per_spin: string | number
  autoplay: string | number
  quickspin: string | number
  tumbling_reels: string | number
  increasing_multipliers: string | number
  orientation: string
  restrictions: string
  created_at: string
  updated_at: string
  published: number
}

export type GamesResponse = {
  data: SlotGame[]
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

const API_BASE = 'https://slotslaunch.com/api'
const token = process.env.SLOTSLAUNCH_TOKEN!
const origin = process.env.SLOTSLAUNCH_ORIGIN!

// Verify env vars are loaded
if (!token || !origin) {
  console.error('❌ SlotsLaunch API credentials missing!')
  console.error('SLOTSLAUNCH_TOKEN:', token ? 'SET' : 'MISSING')
  console.error('SLOTSLAUNCH_ORIGIN:', origin ? 'SET' : 'MISSING')
}

function buildUrl(
  path: string,
  params: Record<
    string,
    string | number | boolean | number[] | undefined
  > = {},
) {
  const url = new URL(`${API_BASE}/${path}`)
  url.searchParams.set('token', token)

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return

    // Handle array parameters (e.g., id[], provider[], type[], theme[])
    if (Array.isArray(value)) {
      value.forEach((item) => {
        url.searchParams.append(`${key}[]`, String(item))
      })
    } else {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': origin,
  }
}

/**
 * Retry a fetch operation with exponential backoff
 */
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    operation?: string
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    operation = 'API call'
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn()
    } catch (error) {
      lastError = error as Error

      const isLastAttempt = attempt === maxRetries - 1
      if (isLastAttempt) break

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)

      console.warn(
        `⚠️ ${operation} failed (attempt ${attempt + 1}/${maxRetries}):`,
        error instanceof Error ? error.message : 'Unknown error'
      )
      console.warn(`   Retrying in ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // All retries failed
  console.error(`❌ ${operation} failed after ${maxRetries} attempts`)
  throw lastError || new Error(`${operation} failed`)
}

// Internal uncached version
async function fetchGamesUncached({
  id,
  provider,
  type,
  theme,
  updated_at,
  order = 'asc',
  order_by = 'name',
  page = 1,
  per_page = 100,
  published,
  pluck,
}: {
  id?: number[]
  provider?: number[]
  type?: number[]
  theme?: number[]
  updated_at?: string
  order?: 'asc' | 'desc'
  order_by?: 'name' | 'id' | 'updated_at'
  page?: number
  per_page?: number
  published?: boolean
  pluck?: boolean
} = {}): Promise<GamesResponse> {
  const url = buildUrl('games', {
    id,
    provider,
    type,
    theme,
    updated_at,
    order,
    order_by,
    page,
    per_page,
    published,
    pluck,
  })

  return fetchWithRetry(
    async () => {
      const res = await fetch(url, {
        headers: getHeaders(),
        next: {revalidate: 300}, // ISR: refresh every 5 minutes
        signal: AbortSignal.timeout(45000), // Increased to 45 second timeout
      })

      if (!res.ok) {
        const errorBody = await res.text().catch(() => 'Unable to read response')
        console.error(`SlotsLaunch API Error:`, {
          status: res.status,
          statusText: res.statusText,
          url: url.replace(/token=[^&]+/, 'token=***'), // Hide token in logs
          body: errorBody.substring(0, 500), // First 500 chars
        })
        throw new Error(`SlotsLaunch API returned ${res.status}: ${res.statusText}`)
      }

      return res.json()
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      operation: `Fetch games page ${page}`,
    }
  )
}

// Exported cached version
export async function fetchGames(params: {
  id?: number[]
  provider?: number[]
  type?: number[]
  theme?: number[]
  updated_at?: string
  order?: 'asc' | 'desc'
  order_by?: 'name' | 'id' | 'updated_at'
  page?: number
  per_page?: number
  published?: boolean
  pluck?: boolean
} = {}): Promise<GamesResponse> {
  // Create cache key from params (exclude undefined values)
  const cacheKey = JSON.stringify({
    id: params.id?.sort(),
    provider: params.provider?.sort(),
    type: params.type?.sort(),
    theme: params.theme?.sort(),
    updated_at: params.updated_at,
    order: params.order || 'asc',
    order_by: params.order_by || 'name',
    page: params.page || 1,
    per_page: params.per_page || 100,
    published: params.published,
    pluck: params.pluck,
  })

  const cachedFetch = unstable_cache(
    () => fetchGamesUncached(params),
    ['slotslaunch-games', cacheKey],
    {
      revalidate: 86400, // 24 hours
      tags: ['slotslaunch', 'games'],
    }
  )

  return cachedFetch()
}

export async function fetchGameBySlug(
  slug: string,
): Promise<SlotGame | null> {
  // Slots Launch API doesn't support direct slug lookup
  // Strategy: Fetch games in batches and search for matching slug
  // This is cached via ISR, so performance impact is minimal

  let page = 1
  const maxPages = 10 // Search up to 1500 games (150 per page)

  while (page <= maxPages) {
    const response = await fetchGames({
      per_page: 150,
      page,
      published: true,
    })

    // Search for game with matching slug
    const game = response.data.find((g) => g.slug === slug)
    if (game) {
      return game
    }

    // If we got fewer games than requested, we've reached the end
    if (response.data.length < 150) {
      break
    }

    page++
  }

  // Game not found
  return null
}

export async function fetchGameById(
  gameId: number | string,
): Promise<SlotGame | null> {
  // Slots Launch API doesn't have a dedicated single game endpoint
  // Use /api/games with id[] parameter which returns {data: [game]} array
  const url = buildUrl('games', {id: [Number(gameId)]})

  return fetchWithRetry(
    async () => {
      const res = await fetch(url, {
        headers: getHeaders(),
        next: {revalidate: 300},
        signal: AbortSignal.timeout(45000),
      })

      if (!res.ok) {
        console.error(`SlotsLaunch API Error (game by ID):`, {
          status: res.status,
          gameId,
          url: url.replace(/token=[^&]+/, 'token=***'),
        })
        throw new Error(`Failed to fetch game ${gameId}: ${res.status}`)
      }

      const data: GamesResponse = await res.json()

      // Validate response structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error(`Invalid API response for game ID ${gameId}:`, data)
        return null
      }

      // Return first game from array, or null if not found
      return data.data[0] ?? null
    },
    {
      maxRetries: 3,
      operation: `Fetch game by ID ${gameId}`,
    }
  )
}

/**
 * Fetch multiple games by their slugs (batch fetching)
 * This is more efficient than fetching one by one
 */
export async function fetchGamesBySlugs(
  slugs: string[],
  options: {
    batchSize?: number
    delayBetweenBatches?: number
  } = {}
): Promise<SlotGame[]> {
  const { batchSize = 10, delayBetweenBatches = 500 } = options
  const games: SlotGame[] = []

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize)

    // Fetch all games in this batch concurrently
    const batchPromises = batch.map(slug =>
      fetchGameBySlug(slug).catch(err => {
        console.warn(`Failed to fetch game "${slug}":`, err.message)
        return null
      })
    )

    const batchResults = await Promise.all(batchPromises)
    const validGames = batchResults.filter((game): game is SlotGame => game !== null)
    games.push(...validGames)

    // Add delay between batches to be nice to the API
    if (i + batchSize < slugs.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  return games
}

// Provider, Type, Theme types and responses
export type Provider = {
  id: number
  name: string
  slug: string
  bio: string | null
  markets: any[]
  thumb: string
  created_at: string | null
  updated_at: string
}

export type GameType = {
  id: number
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export type ProvidersResponse = {
  data: Provider[]
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

export type TypesResponse = {
  data: GameType[]
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

export type ThemesResponse = {
  data: Theme[]
  meta: {
    current_page: number
    from: number
    last_page: number
    path: string
    per_page: number
    to: number
    total: number
  }
}

// Internal uncached version
async function fetchProvidersUncached({
  provider,
  updated_at,
  order = 'asc',
  order_by = 'name',
  page = 1,
  per_page = 100,
  pluck,
}: {
  provider?: number[]
  updated_at?: string
  order?: 'asc' | 'desc'
  order_by?: 'name' | 'id' | 'updated_at'
  page?: number
  per_page?: number
  pluck?: boolean
} = {}): Promise<ProvidersResponse> {
  const url = buildUrl('providers', {
    provider,
    updated_at,
    order,
    order_by,
    page,
    per_page,
    pluck,
  })

  return fetchWithRetry(
    async () => {
      const res = await fetch(url, {
        headers: getHeaders(),
        next: {revalidate: 3600}, // Cache for 1 hour
        signal: AbortSignal.timeout(45000),
      })

      if (!res.ok) {
        const errorBody = await res.text().catch(() => 'Unable to read response')
        console.error(`SlotsLaunch API Error (providers):`, {
          status: res.status,
          statusText: res.statusText,
          url: url.replace(/token=[^&]+/, 'token=***'),
        })
        throw new Error(`SlotsLaunch API returned ${res.status}: ${res.statusText}`)
      }

      return res.json()
    },
    {
      maxRetries: 3,
      operation: `Fetch providers page ${page}`,
    }
  )
}

// Cached version with unstable_cache for better dev/preview performance
export const fetchProviders = unstable_cache(
  fetchProvidersUncached,
  ['slotslaunch-providers'],
  {
    revalidate: 86400, // 24 hours
    tags: ['slotslaunch', 'providers'],
  }
)

// Internal uncached version
async function fetchTypesUncached({
  type,
  updated_at,
  order = 'asc',
  order_by = 'name',
  page = 1,
  per_page = 100,
  pluck,
}: {
  type?: number[]
  updated_at?: string
  order?: 'asc' | 'desc'
  order_by?: 'name' | 'id' | 'updated_at'
  page?: number
  per_page?: number
  pluck?: boolean
} = {}): Promise<TypesResponse> {
  const url = buildUrl('types', {
    type,
    updated_at,
    order,
    order_by,
    page,
    per_page,
    pluck,
  })

  return fetchWithRetry(
    async () => {
      const res = await fetch(url, {
        headers: getHeaders(),
        next: {revalidate: 3600}, // Cache for 1 hour
        signal: AbortSignal.timeout(45000),
      })

      if (!res.ok) {
        const errorBody = await res.text().catch(() => 'Unable to read response')
        console.error(`SlotsLaunch API Error (types):`, {
          status: res.status,
          statusText: res.statusText,
          url: url.replace(/token=[^&]+/, 'token=***'),
        })
        throw new Error(`SlotsLaunch API returned ${res.status}: ${res.statusText}`)
      }

      return res.json()
    },
    {
      maxRetries: 3,
      operation: `Fetch types page ${page}`,
    }
  )
}

// Cached version with unstable_cache for better dev/preview performance
export const fetchTypes = unstable_cache(
  fetchTypesUncached,
  ['slotslaunch-types'],
  {
    revalidate: 86400, // 24 hours
    tags: ['slotslaunch', 'types'],
  }
)

// Internal uncached version
async function fetchThemesUncached({
  theme,
  updated_at,
  order = 'asc',
  order_by = 'name',
  page = 1,
  per_page = 100,
  pluck,
}: {
  theme?: number[]
  updated_at?: string
  order?: 'asc' | 'desc'
  order_by?: 'name' | 'id' | 'updated_at'
  page?: number
  per_page?: number
  pluck?: boolean
} = {}): Promise<ThemesResponse> {
  const url = buildUrl('themes', {
    theme,
    updated_at,
    order,
    order_by,
    page,
    per_page,
    pluck,
  })

  return fetchWithRetry(
    async () => {
      const res = await fetch(url, {
        headers: getHeaders(),
        next: {revalidate: 3600}, // Cache for 1 hour
        signal: AbortSignal.timeout(45000),
      })

      if (!res.ok) {
        const errorBody = await res.text().catch(() => 'Unable to read response')
        console.error(`SlotsLaunch API Error (themes):`, {
          status: res.status,
          statusText: res.statusText,
          url: url.replace(/token=[^&]+/, 'token=***'),
        })
        throw new Error(`SlotsLaunch API returned ${res.status}: ${res.statusText}`)
      }

      return res.json()
    },
    {
      maxRetries: 3,
      operation: `Fetch themes page ${page}`,
    }
  )
}

// Cached version with unstable_cache for better dev/preview performance
export const fetchThemes = unstable_cache(
  fetchThemesUncached,
  ['slotslaunch-themes'],
  {
    revalidate: 86400, // 24 hours
    tags: ['slotslaunch', 'themes'],
  }
)
