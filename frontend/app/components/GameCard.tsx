// components/GameCard.tsx
'use client'

import Link from 'next/link'

export function GameCard({
  game,
  singleBase,
}: {
  game: any
  singleBase: string
}) {
  const href = `/${singleBase}/${game.slug}`

  return (
    <div className="group rounded-2xl shadow-sm border border-gray-100 bg-white/70 backdrop-blur p-3 transition-all hover:border-orange-500 hover:-translate-y-0.5 hover:scale-[1.01]">
      <Link href={href} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
          {game.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={game.thumb}
              alt={game.name}
              className="h-full w-full object-cover group-hover:scale-105 transition"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-sm text-gray-500">
              No image
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <h3 className="text-base font-semibold leading-tight line-clamp-1 font-mono">
            {game.name}
          </h3>
          {game.rtp && (
            <span className="text-xs px-2 py-1 rounded-full border border-gray-200 font-mono">
              RTP {game.rtp}
            </span>
          )}
        </div>
        {game.provider && (
          <p className="text-xs text-gray-500 mt-1">{game.provider}</p>
        )}
      </Link>
    </div>
  )
}
