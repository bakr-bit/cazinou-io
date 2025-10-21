import {NextRequest, NextResponse} from 'next/server'
import {fetchGames} from '@/lib/slotslaunch'

const PER_PAGE = 16

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const page = Number(searchParams.get('page') || '1')
  const provider = searchParams.get('provider')
  const type = searchParams.get('type')
  const theme = searchParams.get('theme')
  const sortParam = searchParams.get('sort') || 'name-asc'

  // Parse sort parameter
  const [order_by, order] = sortParam.split('-') as [
    'name' | 'id' | 'updated_at',
    'asc' | 'desc',
  ]

  // Parse filter parameters
  const providerFilter = provider ? [Number(provider)] : undefined
  const typeFilter = type ? [Number(type)] : undefined
  const themeFilter = theme ? [Number(theme)] : undefined

  try {
    const response = await fetchGames({
      provider: providerFilter,
      type: typeFilter,
      theme: themeFilter,
      order,
      order_by,
      per_page: PER_PAGE,
      page,
      published: true,
    })

    const hasMore = response.data.length === PER_PAGE

    return NextResponse.json({
      games: response.data,
      hasMore,
      meta: response.meta,
    })
  } catch (error) {
    console.error('Failed to fetch games:', error)
    return NextResponse.json(
      {error: 'Failed to fetch games'},
      {status: 500},
    )
  }
}
