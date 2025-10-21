'use client'

import {useState, useMemo} from 'react'
import {GameFilters} from './GameFilters'
import {GameGrid} from './GameGrid'
import type {SlotGame, Provider, GameType, Theme} from '@/lib/slotslaunch'

type SlotsFilteredGridProps = {
  allGames: SlotGame[]
  providers: Provider[]
  types: GameType[]
  themes: Theme[]
  singleBase: string
}

export function SlotsFilteredGrid({
  allGames,
  providers,
  types,
  themes,
  singleBase,
}: SlotsFilteredGridProps) {
  // Filter state
  const [search, setSearch] = useState('')
  const [providerId, setProviderId] = useState<string>('')
  const [typeId, setTypeId] = useState<string>('')
  const [themeId, setThemeId] = useState<string>('')
  const [sort, setSort] = useState<string>('name-asc')

  // Pagination state
  const [displayCount, setDisplayCount] = useState(16)

  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    let filtered = [...allGames]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((game) =>
        game.name.toLowerCase().includes(searchLower),
      )
    }

    // Apply provider filter
    if (providerId) {
      filtered = filtered.filter((game) => game.provider_id === Number(providerId))
    }

    // Apply type filter
    if (typeId) {
      filtered = filtered.filter((game) => game.type_id === Number(typeId))
    }

    // Apply theme filter
    if (themeId) {
      filtered = filtered.filter((game) =>
        game.themes.some((theme) => theme.id === Number(themeId)),
      )
    }

    // Apply sorting
    const [orderBy, order] = sort.split('-') as [string, 'asc' | 'desc']
    filtered.sort((a, b) => {
      let aVal: any
      let bVal: any

      if (orderBy === 'name') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else if (orderBy === 'updated_at') {
        aVal = new Date(a.updated_at).getTime()
        bVal = new Date(b.updated_at).getTime()
      } else {
        aVal = a.id
        bVal = b.id
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [allGames, search, providerId, typeId, themeId, sort])

  // Paginated games
  const displayedGames = filteredAndSortedGames.slice(0, displayCount)
  const hasMore = displayCount < filteredAndSortedGames.length

  // Filter handlers
  const handleFilterChange = (filters: {
    search?: string
    provider?: string
    type?: string
    theme?: string
    sort?: string
  }) => {
    if (filters.search !== undefined) setSearch(filters.search)
    if (filters.provider !== undefined) setProviderId(filters.provider)
    if (filters.type !== undefined) setTypeId(filters.type)
    if (filters.theme !== undefined) setThemeId(filters.theme)
    if (filters.sort !== undefined) setSort(filters.sort)

    // Reset pagination when filters change
    setDisplayCount(16)
  }

  const handleClearFilters = () => {
    setSearch('')
    setProviderId('')
    setTypeId('')
    setThemeId('')
    setSort('name-asc')
    setDisplayCount(16)
  }

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 16)
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <GameFilters
          providers={providers}
          types={types}
          themes={themes}
          currentFilters={{
            search,
            provider: providerId,
            type: typeId,
            theme: themeId,
            sort,
          }}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </aside>

      {/* Games Grid */}
      <div>
        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-mono">
            {filteredAndSortedGames.length > 0 ? (
              <>
                Afișăm{' '}
                <span className="font-semibold">{filteredAndSortedGames.length}</span>{' '}
                jocuri
                {search && (
                  <>
                    {' '}
                    pentru &quot;
                    <span className="font-semibold">{search}</span>
                    &quot;
                  </>
                )}
              </>
            ) : (
              'Nu s-au găsit jocuri. Încearcă să modifici filtrele.'
            )}
          </p>
        </div>

        <GameGrid
          games={displayedGames}
          singleBase={singleBase}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  )
}
