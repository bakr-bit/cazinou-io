// app/pacanele-gratis/[slug]/page.tsx
import type {SlotGame} from '@/lib/slotslaunch'
import {
  transformSanityGameToSlotGame,
  type SanityGame,
} from '@/lib/sanity-games'
import {ThemedGamesGrid} from '@/app/components/ThemedGamesGrid'
import {FeaturedCasinoBanner} from '@/app/components/FeaturedCasinoBanner'
import {ContentSections} from '@/app/components/ContentSections'
import {ResponsibleGamingDisclaimer} from '@/app/components/ResponsibleGamingDisclaimer'
import {sanityFetch} from '@/sanity/lib/live'
import {client} from '@/sanity/lib/client'
import {themedSlotsPageBySlugQuery, themedSlotsPageSlugsQuery, allGamesQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

const SINGLE_BASE = process.env.SINGLE_BASE || 'pacanele'

// Revalidate page every hour
export const revalidate = 3600

type ThemedSlotsData = {
  games: SlotGame[]
  totalCount: number
}

// Filter games by the specified criteria
function filterGames(
  allGames: SanityGame[],
  filterType: string,
  filterValue: string
): SanityGame[] {
  if (filterType === 'theme') {
    return allGames.filter(game =>
      game.themes?.some(theme =>
        theme.toLowerCase() === filterValue.toLowerCase()
      )
    )
  } else if (filterType === 'provider') {
    return allGames.filter(game =>
      game.provider?.name.toLowerCase() === filterValue.toLowerCase() ||
      game.provider?.slug.current.toLowerCase() === filterValue.toLowerCase()
    )
  } else if (filterType === 'gameType') {
    return allGames.filter(game =>
      game.gameType?.toLowerCase() === filterValue.toLowerCase() ||
      game.gameTypeSlug?.toLowerCase() === filterValue.toLowerCase()
    )
  } else if (filterType === 'rtp') {
    const minRTP = parseFloat(filterValue)
    if (isNaN(minRTP)) {
      console.warn(`Invalid RTP filter value: "${filterValue}"`)
      return allGames
    }
    return allGames.filter(game => {
      if (!game.rtp) return false
      const gameRTP = typeof game.rtp === 'string' ? parseFloat(game.rtp) : game.rtp
      return !isNaN(gameRTP) && gameRTP >= minRTP
    })
  }
  return allGames
}

async function fetchFilteredSlotsData(
  filterType: string,
  filterValue: string
): Promise<ThemedSlotsData> {
  console.log(`🔄 Fetching games filtered by ${filterType}: "${filterValue}"`)

  // Fetch all games from Sanity
  const {data: allGames} = await sanityFetch({
    query: allGamesQuery,
    stega: false,
  })

  if (!allGames || allGames.length === 0) {
    console.warn('⚠️ No games found in Sanity')
    return {
      games: [],
      totalCount: 0,
    }
  }

  // Filter games based on criteria
  const filteredGames = filterGames(allGames, filterType, filterValue)
  console.log(`✅ Filtered to ${filteredGames.length} games`)

  // Transform to SlotGame format
  const games = filteredGames.map((game: SanityGame) => transformSanityGameToSlotGame(game))

  return {
    games,
    totalCount: games.length,
  }
}

// Generate static params for all themed pages
export async function generateStaticParams() {
  const pages = await client.fetch(themedSlotsPageSlugsQuery, {}, {
    perspective: 'published',
  })

  return (pages || []).map((page: {slug: string}) => ({
    slug: page.slug,
  }))
}

// Generate metadata for each page
export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params
  const {data: page} = await sanityFetch({
    query: themedSlotsPageBySlugQuery,
    params: {slug},
    stega: false,
  })

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  const metaTitle = page.seo?.metaTitle || page.heading || page.title
  const metaDescription = page.seo?.metaDescription || page.description || `Joacă ${page.title} gratis online pe Cazinou.io`

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://cazinou.io/pacanele-gratis/${slug}`,
      siteName: 'Cazinou.io',
      locale: 'ro_RO',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    },
    robots: {
      index: !page.hidden,
      follow: true,
    },
    alternates: {
      canonical: `https://cazinou.io/pacanele-gratis/${slug}`,
    },
  }
}

export default async function ThemedSlotsPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params

  // Fetch themed page data
  const {data: page} = await sanityFetch({
    query: themedSlotsPageBySlugQuery,
    params: {slug},
    stega: false,
  })

  if (!page || page.hidden) {
    notFound()
  }

  // Fetch filtered games data
  const slotsData = await fetchFilteredSlotsData(page.filterType, page.filterValue)
  const {games: allGames, totalCount: totalGamesCount} = slotsData

  const featuredCasino = page.featuredCasino || null
  const author = page.author || null

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
        <div className="container pt-8 pb-6 lg:pb-8">
          <header className="relative grid gap-6 border-b border-gray-100 pb-10">
            <div className="max-w-3xl grid gap-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand font-mono">
                Jocuri de noroc
              </p>
              <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                {page.heading}
              </h1>
              {page.description && (
                <p className="text-lg text-gray-600">
                  {page.description}
                </p>
              )}
            </div>

            {/* Author Info */}
            {author && (
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-4">
                  {/* Author Avatar */}
                  {author.picture?.asset?.url ? (
                    <div className="flex-shrink-0">
                      <img
                        src={author.picture.asset.url}
                        alt={`${author.firstName} ${author.lastName}`}
                        className="w-16 h-16 rounded-full object-cover aspect-square ring-2 ring-gray-100"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 aspect-square">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Author Info */}
                  <div className="flex flex-col gap-1 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">De</span>
                      <span className="font-semibold text-gray-900">
                        {author.firstName} {author.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-brand/10 px-4 py-2 font-medium text-brand font-mono text-sm">
                Fără Download
              </div>
              <div className="rounded-full bg-brand/10 px-4 py-2 font-medium text-brand font-mono text-sm">
                Demo Gratuit
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Featured Casino Banner */}
      {featuredCasino && <FeaturedCasinoBanner casino={featuredCasino as any} />}

      {/* Games Grid */}
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
        <div className="container pt-8 pb-12 relative">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tighter text-gray-900 font-mono mb-2">
              Toate Jocurile
            </h2>
            <p className="text-gray-600 text-lg">
              Descoperă {totalGamesCount.toLocaleString('ro-RO')} {totalGamesCount === 1 ? 'joc' : 'jocuri'}
            </p>
          </div>

          {allGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-mono">Nu există jocuri pentru acest filtru momentan.</p>
            </div>
          ) : (
            <ThemedGamesGrid
              games={allGames}
              singleBase={SINGLE_BASE}
            />
          )}
        </div>
      </div>

      {/* Content Sections */}
      <ContentSections content={page.content || undefined} />

      {/* Responsible Gaming Disclaimer */}
      <ResponsibleGamingDisclaimer />

      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: page.heading,
            description: page.description || `Colecție de ${page.title} disponibile pentru joc demo pe Cazinou.io`,
            numberOfItems: totalGamesCount,
            itemListElement: allGames.slice(0, 20).map((game, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Game',
                name: game.name,
                url: `https://cazinou.io/${SINGLE_BASE}/${game.id}-${game.slug}`,
                description: `Joacă ${game.name} online gratis`,
                image: game.thumb,
                author: {
                  '@type': 'Organization',
                  name: game.provider || 'Unknown Provider',
                },
              },
            })),
          }),
        }}
      />
    </main>
  )
}
