'use client'

import {GameCard} from './GameCard'
import type {SlotGame} from '@/lib/slotslaunch'

type GameGridProps = {
  games: SlotGame[]
  singleBase: string
  hasMore: boolean
  onLoadMore: () => void
}

export function GameGrid({
  games,
  singleBase,
  hasMore,
  onLoadMore,
}: GameGridProps) {
  return (
    <>
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {games.map((g) => (
          <GameCard key={g.id} game={g} singleBase={singleBase} />
        ))}
      </section>

      {games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 font-mono">
            Nu s-au găsit jocuri. Încearcă să modifici filtrele.
          </p>
        </div>
      )}

      {hasMore && games.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center justify-center rounded-full bg-orange-500 text-white px-8 py-3 font-semibold font-mono hover:bg-orange-600 transition-colors"
          >
            Încarcă mai multe jocuri
          </button>
        </div>
      )}
    </>
  )
}
