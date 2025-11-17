import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'

type Game = {
  _id: string
  _type: 'game'
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

type LinkCard = {
  _key: string
  _type: 'linkCard'
  title: string
  subtitle?: string
  icon?: string
  image?: unknown
  link: string
  backgroundColor?: string
}

type GridItem = Game | LinkCard

export type FeaturedGamesGridData = {
  title?: string
  description?: string
  games?: (GridItem | null)[]
}

type FeaturedGamesGridProps = {
  data?: FeaturedGamesGridData | null
}

export function FeaturedGamesGrid({data}: FeaturedGamesGridProps) {
  if (!data?.games || data.games.length === 0) {
    return null
  }

  // Filter out null/undefined items and validate
  const validItems = (data.games || []).filter((item): item is GridItem => {
    if (!item) return false

    // Validate game references
    if ('slug' in item) {
      return !!item.slug
    }

    // Validate link cards
    if (item._type === 'linkCard') {
      return !!item.title && !!item.link
    }

    return false
  })

  if (validItems.length === 0) {
    return null
  }

  const items = validItems.slice(0, 24) // Max 24 for compact grid

  return (
    <section className="my-8">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 font-mono mb-2">
          {data.title || 'Păcănele Recomandate'}
        </h2>
        {data.description && (
          <p className="text-sm text-gray-600">{data.description}</p>
        )}
      </div>

      <div className="grid gap-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => {
              // Render link card
              if (item._type === 'linkCard') {
                const imageUrl = item.image ? urlForImage(item.image)?.width(200).height(200).url() : null
                const bgColor = item.backgroundColor || 'bg-gradient-to-br from-gray-200 to-gray-300'

                return (
                  <Link
                    key={item._key}
                    href={item.link}
                    className="group block overflow-hidden rounded-lg border border-gray-100 shadow-sm transition hover:border-orange-500 hover:shadow-md"
                    style={item.backgroundColor ? {backgroundColor: item.backgroundColor} : undefined}
                  >
                    <div className={`aspect-square w-full overflow-hidden ${!item.backgroundColor ? bgColor : ''} flex items-center justify-center text-center p-4`}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : item.icon ? (
                        <div className="text-5xl">
                          {item.icon}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <h3 className="text-gray-900 font-bold text-sm line-clamp-3 font-mono">
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p className="text-gray-700 text-xs line-clamp-2">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {(imageUrl || item.icon) && (
                      <div className="p-2 bg-white">
                        <h3 className="text-xs font-semibold leading-tight line-clamp-2 font-mono text-gray-900 group-hover:text-orange-600">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    )}
                  </Link>
                )
              }

              // Render game card
              const game = item as Game
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
    </section>
  )
}
