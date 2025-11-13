// lib/sanity-games.ts
// Transform Sanity game data to SlotsLaunch API format for filtering

import type {SlotGame, Theme, Provider, GameType} from '@/lib/slotslaunch'

// Sanity game type from query
export type SanityGame = {
  _id: string
  name: string
  slug: {current: string}
  slotsLaunchId: number
  slotsLaunchSlug: string
  slotsLaunchThumb: string
  rating: number
  gameType: string | null
  gameTypeSlug: string | null
  themes: string[] | null
  rtp: string | null
  volatility: string | null
  releaseDate: string | null
  provider: {
    _id: string
    name: string
    slug: {current: string}
  } | null
}

/**
 * Generate a stable numeric ID from a string
 * Uses a simple hash function to create consistent IDs
 */
function stringToId(str: string): number {
  if (!str) return 0
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Transform a Sanity game to SlotGame format
 */
export function transformSanityGameToSlotGame(game: SanityGame): SlotGame {
  const providerId = game.provider ? stringToId(game.provider.slug.current) : 0
  const providerName = game.provider?.name || 'Unknown'
  const providerSlug = game.provider?.slug.current || 'unknown'

  const typeId = game.gameTypeSlug ? stringToId(game.gameTypeSlug) : 0
  const typeName = game.gameType || 'Unknown'
  const typeSlug = game.gameTypeSlug || 'unknown'

  // Transform themes array to Theme objects
  const themes: Theme[] = (game.themes || []).map(themeName => ({
    id: stringToId(themeName.toLowerCase()),
    name: themeName,
    slug: themeName.toLowerCase().replace(/\s+/g, '-'),
    parent_id: null,
    created_at: '',
    updated_at: '',
  }))

  return {
    id: game.slotsLaunchId,
    name: game.name,
    slug: game.slotsLaunchSlug,
    description: null,
    url: `https://slotslaunch.com/iframe/${game.slotsLaunchId}`,
    thumb: game.slotsLaunchThumb,
    provider_id: providerId,
    provider: providerName,
    provider_slug: providerSlug,
    type_id: typeId,
    type: typeName,
    type_slug: typeSlug,
    themes,
    megaways: 0,
    bonus_buy: 0,
    progressive: 0,
    featured: 0,
    release: game.releaseDate || '',
    reels: '',
    payline: '',
    rtp: game.rtp || '',
    volatility: game.volatility || '',
    currencies: '',
    languages: '',
    land_based: '',
    markets: [],
    cluster_slot: '',
    max_exposure: '',
    min_bet: '',
    max_bet: '',
    max_win_per_spin: '',
    autoplay: '',
    quickspin: '',
    tumbling_reels: '',
    increasing_multipliers: '',
    orientation: '',
    restrictions: '',
    created_at: '',
    updated_at: '',
    published: 1,
  }
}

/**
 * Extract unique providers from Sanity games
 */
export function extractProvidersFromGames(games: SanityGame[]): Provider[] {
  const providerMap = new Map<string, Provider>()

  games.forEach(game => {
    if (!game.provider) return

    const slug = game.provider.slug.current
    if (!providerMap.has(slug)) {
      providerMap.set(slug, {
        id: stringToId(slug),
        name: game.provider.name,
        slug: slug,
        created_at: '',
        updated_at: '',
      })
    }
  })

  return Array.from(providerMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Extract unique game types from Sanity games
 */
export function extractTypesFromGames(games: SanityGame[]): GameType[] {
  const typeMap = new Map<string, GameType>()

  games.forEach(game => {
    if (!game.gameTypeSlug) return

    const slug = game.gameTypeSlug
    if (!typeMap.has(slug)) {
      typeMap.set(slug, {
        id: stringToId(slug),
        name: game.gameType || 'Unknown',
        slug: slug,
        created_at: '',
        updated_at: '',
      })
    }
  })

  return Array.from(typeMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Extract unique themes from Sanity games
 */
export function extractThemesFromGames(games: SanityGame[]): Theme[] {
  const themeMap = new Map<string, Theme>()

  games.forEach(game => {
    if (!game.themes) return

    game.themes.forEach(themeName => {
      const slug = themeName.toLowerCase().replace(/\s+/g, '-')
      if (!themeMap.has(slug)) {
        themeMap.set(slug, {
          id: stringToId(themeName.toLowerCase()),
          name: themeName,
          slug: slug,
          parent_id: null,
          created_at: '',
          updated_at: '',
        })
      }
    })
  })

  return Array.from(themeMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
