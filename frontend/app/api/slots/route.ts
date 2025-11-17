import {NextRequest, NextResponse} from 'next/server'
import {client} from '@/sanity/lib/client'
import {allGamesQuery} from '@/sanity/lib/queries'
import {transformSanityGameToSlotGame, type SanityGame} from '@/lib/sanity-games'

const PER_PAGE = 16

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const page = Number(searchParams.get('page') || '1')
  const providerSlug = searchParams.get('provider')
  const typeSlug = searchParams.get('type')
  const themeSlug = searchParams.get('theme')
  const sortParam = searchParams.get('sort') || 'name-asc'

  // Parse sort parameter
  const [order_by, order] = sortParam.split('-') as ['name' | 'rating', 'asc' | 'desc']

  try {
    // Fetch all games from Sanity
    const games = await client.fetch<SanityGame[]>(allGamesQuery, {}, {
      perspective: 'published',
    })

    if (!games) {
      return NextResponse.json({
        games: [],
        hasMore: false,
        meta: {total: 0, page, per_page: PER_PAGE},
      })
    }

    // Filter games based on search parameters
    let filteredGames = games

    if (providerSlug) {
      filteredGames = filteredGames.filter(
        (game) => game.provider?.slug?.current === providerSlug
      )
    }

    if (typeSlug) {
      filteredGames = filteredGames.filter((game) => game.gameTypeSlug === typeSlug)
    }

    if (themeSlug) {
      filteredGames = filteredGames.filter(
        (game) => game.themes && game.themes.includes(themeSlug)
      )
    }

    // Sort games
    filteredGames.sort((a, b) => {
      let compareValue = 0

      if (order_by === 'name') {
        compareValue = a.name.localeCompare(b.name)
      } else if (order_by === 'rating') {
        compareValue = (a.rating || 0) - (b.rating || 0)
      }

      return order === 'desc' ? -compareValue : compareValue
    })

    // Paginate
    const startIndex = (page - 1) * PER_PAGE
    const endIndex = startIndex + PER_PAGE
    const paginatedGames = filteredGames.slice(startIndex, endIndex)

    // Transform to SlotGame format
    const transformedGames = paginatedGames.map(transformSanityGameToSlotGame)

    const hasMore = endIndex < filteredGames.length

    return NextResponse.json({
      games: transformedGames,
      hasMore,
      meta: {
        total: filteredGames.length,
        page,
        per_page: PER_PAGE,
        current_page: page,
        last_page: Math.ceil(filteredGames.length / PER_PAGE),
      },
    })
  } catch (error) {
    console.error('Failed to fetch games from Sanity:', error)
    return NextResponse.json(
      {error: 'Failed to fetch games'},
      {status: 500},
    )
  }
}
