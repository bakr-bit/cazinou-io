'use client'

import {useState} from 'react'
import {GameGrid} from './GameGrid'
import type {SlotGame} from '@/lib/slotslaunch'

type ThemedGamesGridProps = {
  games: SlotGame[]
  singleBase: string
}

export function ThemedGamesGrid({
  games,
  singleBase,
}: ThemedGamesGridProps) {
  // Pagination state
  const [displayCount, setDisplayCount] = useState(16)

  // Paginated games
  const displayedGames = games.slice(0, displayCount)
  const hasMore = displayCount < games.length

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 16)
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 font-mono">
          {games.length > 0 ? (
            <>
              Afișăm{' '}
              <span className="font-semibold">{games.length}</span>{' '}
              jocuri
            </>
          ) : (
            'Nu s-au găsit jocuri.'
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
  )
}
