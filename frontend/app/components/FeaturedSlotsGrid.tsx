import Image from 'next/image'
import Link from 'next/link'
import {sanityFetch} from '@/sanity/lib/live'
import {featuredGamesQuery} from '@/sanity/lib/queries'

export async function FeaturedSlotsGrid() {
  // Fetch top-rated games from Sanity
  const {data: games} = await sanityFetch({
    query: featuredGamesQuery,
    stega: false,
  })

  if (!games || games.length === 0) {
    return null
  }

  return (
    <section className="my-12">
      <div className="container">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 font-mono mb-2">
            Păcănele Populare
          </h2>
          <p className="text-gray-600">
            Cele mai jucate jocuri de păcănele online din România
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => {
            const gameSlug = game.slotsLaunchSlug || game.slug?.current || game.slug
            const thumb = game.slotsLaunchThumb
            const providerName = game.provider?.name

            return (
              <Link
                key={game._id}
                href={`/pacanele/${gameSlug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-orange-500 hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={game.name}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold leading-tight line-clamp-1 font-mono text-gray-900 group-hover:text-orange-600">
                    {game.name}
                  </h3>
                  {providerName && (
                    <p className="text-xs text-gray-500 mt-1">{providerName}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
