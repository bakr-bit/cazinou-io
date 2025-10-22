import Image from 'next/image'
import Link from 'next/link'

type Game = {
  _id: string
  name: string
  slug: {current: string}
  slotsLaunchSlug?: string
  slotsLaunchThumb?: string
  mainImage?: {
    asset?: {
      _id: string
      url: string
      metadata?: {
        lqip?: string
        dimensions?: {width: number; height: number}
      }
    }
    alt?: string
  }
  provider?: {
    name: string
  }
  rating?: number
}

export type FeaturedGamesGridData = {
  title?: string
  description?: string
  games?: (Game | null)[]
}

type FeaturedGamesGridProps = {
  data?: FeaturedGamesGridData | null
}

export function FeaturedGamesGrid({data}: FeaturedGamesGridProps) {
  if (!data?.games || data.games.length === 0) {
    return null
  }

  // Filter out null/undefined games and ensure required fields exist
  const validGames = (data.games || []).filter((game): game is Game => {
    return game !== null && game !== undefined && !!game.slug
  })

  if (validGames.length === 0) {
    return null
  }

  const games = validGames.slice(0, 24) // Max 24 for compact grid

  return (
    <section className="my-8">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 font-mono mb-2">
            {data.title || 'Păcănele Recomandate'}
          </h2>
          {data.description && (
            <p className="text-sm text-gray-600">{data.description}</p>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {games.map((game) => {
              // Use SlotsLaunch slug if available, otherwise fallback to Sanity slug
              const gameHref = game.slotsLaunchSlug
                ? `/pacanele/${game.slotsLaunchSlug}`
                : `/pacanele/${game.slug.current}`

              return (
                <Link
                  key={game._id}
                  href={gameHref}
                  className="group block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:border-orange-500 hover:shadow-md"
                >
                <div className="aspect-square w-full overflow-hidden">
                  {(() => {
                    // Priority: SlotsLaunch thumb -> Sanity mainImage -> placeholder
                    if (game.slotsLaunchThumb) {
                      return (
                        <Image
                          src={game.slotsLaunchThumb}
                          alt={game.name}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      )
                    }

                    if (game.mainImage?.asset?.url) {
                      return (
                        <Image
                          src={game.mainImage.asset.url}
                          alt={game.mainImage.alt || game.name}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          placeholder={game.mainImage.asset.metadata?.lqip ? 'blur' : undefined}
                          blurDataURL={game.mainImage.asset.metadata?.lqip}
                        />
                      )
                    }

                    return (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                        No image
                      </div>
                    )
                  })()}
                </div>
                <div className="p-2">
                  <h3 className="text-xs font-semibold leading-tight line-clamp-2 font-mono text-gray-900 group-hover:text-orange-600">
                    {game.name}
                  </h3>
                  {game.provider?.name && (
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{game.provider.name}</p>
                  )}
                  {typeof game.rating === 'number' && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-2.5 h-2.5 ${star <= game.rating! ? 'text-amber-500' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-600 font-mono">{game.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
