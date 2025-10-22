// app/pacanele-gratis/page.tsx
import {
  fetchGames,
  fetchProviders,
  fetchTypes,
  fetchThemes,
  type SlotGame,
  type Provider,
  type GameType,
  type Theme,
} from '@/lib/slotslaunch'
import {getDevCache, setDevCache} from '@/lib/dev-cache'
import {SlotsFilteredGrid} from '@/app/components/SlotsFilteredGrid'
import {FeaturedCasinoBanner} from '@/app/components/FeaturedCasinoBanner'
import {FeaturedGamesGrid} from '@/app/components/FeaturedGamesGrid'
import {FeaturedSlotsGrid} from '@/app/components/FeaturedSlotsGrid'
import {ContentSections} from '@/app/components/ContentSections'
import {FAQSection} from '@/app/components/FAQSection'
import {ResponsibleGamingDisclaimer} from '@/app/components/ResponsibleGamingDisclaimer'
import {sanityFetch} from '@/sanity/lib/live'
import {slotsPageSettingsQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'

const SINGLE_BASE = process.env.SINGLE_BASE || 'pacanele'

// Revalidate page every hour
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pacanele Gratis (Demo) Online - 8000+ Jocuri ca la Aparate',
  description:
    'Joacă cele mai tari păcănele gratis pe Cazinou.io! Încearcă jocurile tale preferate de păcănele demo pe laptop sau telefon. Avem întreaga gamă de jocuri ca la aparate gratis precum Shining Crown, Burning Hot, Dice Roll și Book of Ra.',

  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: 'Pacanele Gratis (Demo) Online - 2400+ Jocuri ca la Aparate',
    description:
      'Joacă cele mai tari păcănele gratis! Peste 2400 jocuri de păcănele demo disponibile pe laptop și mobil.',
    url: 'https://cazinou.io/pacanele-gratis',
    siteName: 'Cazinou.io',
    locale: 'ro_RO',
    type: 'website',
    images: [
      {
        url: '/images/og-pacanele-gratis.jpg',
        width: 1200,
        height: 630,
        alt: 'Pacanele Gratis Online - Cazinou.io',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Pacanele Gratis - 2400+ Jocuri Demo Online',
    description:
      'Joacă păcănele gratis pe Cazinou.io! Shining Crown, Burning Hot, Book of Ra și multe altele.',
    images: ['/images/twitter-pacanele.jpg'],
  },

  // Robots & Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: 'https://cazinou.io/pacanele-gratis',
  },
}

const isDev = process.env.NODE_ENV === 'development'

type CachedData = {
  games: SlotGame[]
  providers: Provider[]
  types: GameType[]
  themes: Theme[]
  totalCount: number
}

async function fetchAllSlotsData(): Promise<CachedData> {
  // Try dev cache first (only in dev mode) - 4 hour TTL
  const cached = await getDevCache<CachedData>('slots-page-data', 240)
  if (cached) {
    console.log('✅ Using cached slots data from file (age: valid)')
    return cached
  }

  console.log(isDev ? '🔄 Fetching limited data for dev mode...' : '🔄 Fetching slots data (capped at 10,000 games)...')

  // Limit games to prevent build timeouts
  // In dev: limit to 300 games (3 API requests)
  // In prod: limit to 10,000 games (~100 API requests, ~8min build time)
  const maxGamesInDev = 300
  const maxGamesInProd = 10000

  // First, fetch one page to get total count
  const firstPage = await fetchGames({
    per_page: 100,
    page: 1,
    order: 'asc',
    order_by: 'name',
  })

  const totalGamesCount = firstPage.meta.total
  const actualPerPage = firstPage.meta.per_page

  // Calculate how many pages we need
  const maxGames = isDev ? maxGamesInDev : maxGamesInProd
  let targetGameCount = Math.min(maxGames, totalGamesCount)
  let totalPages = Math.ceil(targetGameCount / actualPerPage)

  let allGames: SlotGame[]

  if (totalPages === 1) {
    allGames = firstPage.data
  } else {
    const remainingPages = Array.from(
      {length: totalPages - 1},
      (_, i) => i + 2
    )

    const BATCH_SIZE = 1 // Sequential requests to prevent rate limiting
    const BATCH_DELAY = 5000 // 5 second delay between requests to prevent 429 errors
    const remainingResults = []

    console.log(`📊 Fetching ${remainingPages.length} additional pages in batches of ${BATCH_SIZE}...`)

    for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
      const batch = remainingPages.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(remainingPages.length / BATCH_SIZE)

      console.log(`🔄 Processing batch ${batchNum}/${totalBatches} (pages ${batch.join(', ')})...`)

      const batchPromises = batch.map((pageNum) =>
        fetchGames({
          per_page: actualPerPage,
          page: pageNum,
          order: 'asc',
          order_by: 'name',
        }).catch((error) => {
          console.warn(`⚠️ Failed to fetch page ${pageNum}:`, error.message)
          return null // Return null for failed requests
        })
      )

      try {
        const batchResults = await Promise.all(batchPromises)
        // Filter out null results from failed requests
        const successfulResults = batchResults.filter((result): result is NonNullable<typeof result> => result !== null)
        remainingResults.push(...successfulResults)

        const failedCount = batchResults.length - successfulResults.length
        if (failedCount > 0) {
          console.log(`✅ Batch ${batchNum}/${totalBatches} complete (${failedCount} requests failed)`)
        } else {
          console.log(`✅ Batch ${batchNum}/${totalBatches} complete`)
        }
      } catch (error) {
        console.warn(`⚠️ Batch ${batchNum}/${totalBatches} failed completely, continuing with available data...`)
        // Continue with what we have - don't throw
      }

      if (i + BATCH_SIZE < remainingPages.length) {
        console.log(`⏱️  Waiting ${BATCH_DELAY}ms before next batch...`)
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
      }
    }

    allGames = [
      ...firstPage.data,
      ...remainingResults.flatMap((result) => result.data),
    ]
  }

  // Fetch filter options - always just first page in dev
  const [firstProviderPage, firstTypePage, firstThemePage] = await Promise.all([
    fetchProviders({per_page: 100}).catch((error) => {
      console.warn('⚠️ Failed to fetch providers:', error.message)
      return { data: [], meta: { total: 0, per_page: 100, current_page: 1, from: 0, last_page: 0, path: '', to: 0 } }
    }),
    fetchTypes({per_page: 100}).catch((error) => {
      console.warn('⚠️ Failed to fetch types:', error.message)
      return { data: [], meta: { total: 0, per_page: 100, current_page: 1, from: 0, last_page: 0, path: '', to: 0 } }
    }),
    fetchThemes({per_page: 100}).catch((error) => {
      console.warn('⚠️ Failed to fetch themes:', error.message)
      return { data: [], meta: { total: 0, per_page: 100, current_page: 1, from: 0, last_page: 0, path: '', to: 0 } }
    }),
  ])

  let allProviders = firstProviderPage.data
  let allTypes = firstTypePage.data
  let allThemes = firstThemePage.data

  // In production, fetch all pages of filters
  if (!isDev) {
    // Fetch all providers
    const providerActualPerPage = firstProviderPage.meta.per_page
    const providerTotalPages = Math.ceil(firstProviderPage.meta.total / providerActualPerPage)

    if (providerTotalPages > 1) {
      const providerPages = Array.from({length: providerTotalPages - 1}, (_, i) => i + 2)
      const providerResults = await Promise.all(
        providerPages.map((page) =>
          fetchProviders({per_page: providerActualPerPage, page}).catch((error) => {
            console.warn(`⚠️ Failed to fetch providers page ${page}:`, error.message)
            return { data: [], meta: { total: 0, per_page: 100, current_page: page, from: 0, last_page: 0, path: '', to: 0 } }
          })
        )
      )
      allProviders = [...firstProviderPage.data, ...providerResults.flatMap((r) => r.data)]
    }

    // Fetch all types
    const typeActualPerPage = firstTypePage.meta.per_page
    const typeTotalPages = Math.ceil(firstTypePage.meta.total / typeActualPerPage)

    if (typeTotalPages > 1) {
      const typePages = Array.from({length: typeTotalPages - 1}, (_, i) => i + 2)
      const typeResults = await Promise.all(
        typePages.map((page) =>
          fetchTypes({per_page: typeActualPerPage, page}).catch((error) => {
            console.warn(`⚠️ Failed to fetch types page ${page}:`, error.message)
            return { data: [], meta: { total: 0, per_page: 100, current_page: page, from: 0, last_page: 0, path: '', to: 0 } }
          })
        )
      )
      allTypes = [...firstTypePage.data, ...typeResults.flatMap((r) => r.data)]
    }

    // Fetch all themes
    const themeActualPerPage = firstThemePage.meta.per_page
    const themeTotalPages = Math.ceil(firstThemePage.meta.total / themeActualPerPage)

    if (themeTotalPages > 1) {
      const themePages = Array.from({length: themeTotalPages - 1}, (_, i) => i + 2)
      const themeResults = await Promise.all(
        themePages.map((page) =>
          fetchThemes({per_page: themeActualPerPage, page}).catch((error) => {
            console.warn(`⚠️ Failed to fetch themes page ${page}:`, error.message)
            return { data: [], meta: { total: 0, per_page: 100, current_page: page, from: 0, last_page: 0, path: '', to: 0 } }
          })
        )
      )
      allThemes = [...firstThemePage.data, ...themeResults.flatMap((r) => r.data)]
    }
  }

  const data: CachedData = {
    games: allGames,
    providers: allProviders,
    types: allTypes,
    themes: allThemes,
    totalCount: totalGamesCount,
  }

  // Cache the data in dev mode
  await setDevCache('slots-page-data', data)

  return data
}

export default async function SlotsPage() {

  // Fetch slots page settings from Sanity
  const {data: slotsSettings} = await sanityFetch({
    query: slotsPageSettingsQuery,
    stega: false,
  })

  const featuredCasino = slotsSettings?.featuredCasino || null

  // Fetch games data with dev caching
  let slotsData: CachedData

  try {
    slotsData = await fetchAllSlotsData()
  } catch (error) {
    console.error('Failed to fetch from SlotsLaunch API:', error)
    // Return empty data on API failure
    slotsData = {
      games: [],
      providers: [],
      types: [],
      themes: [],
      totalCount: 0,
    }
  }

  const { games: allGames, providers, types, themes, totalCount: totalGamesCount } = slotsData

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <div className="container my-12 lg:my-24">
        <header className="grid gap-6 border-b border-gray-100 pb-10">
          <div className="max-w-3xl grid gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              Jocuri de noroc
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl">
              Pacanele Gratis (Demo) Online
            </h1>
            <p className="text-lg text-gray-600">
              Joacă cele mai tari păcănele gratis pe Cazinou.io! Încearcă jocurile tale preferate de păcănele demo pe laptop sau telefon. Avem întreaga gamă de jocuri ca la aparate gratis precum Shining Crown, Burning Hot, Dice Roll și Book of Ra, dar și jocuri de sloturi online noi cu speciale, Megaways și alte funcții atractive!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="rounded-full bg-amber-50 px-4 py-2 font-medium text-amber-700">
              {totalGamesCount.toLocaleString('ro-RO')}+ Jocuri Disponibile
            </div>
            <div className="rounded-full bg-brand/10 px-4 py-2 font-medium text-brand">
              Fără Download
            </div>
            <div className="rounded-full bg-brand/10 px-4 py-2 font-medium text-brand">
              Demo Gratuit
            </div>
          </div>
        </header>
      </div>

      {/* Featured Casino Banner */}
      <FeaturedCasinoBanner casino={featuredCasino as any} />

      {/* Featured Games Grid (Sanity-managed) */}
      <FeaturedGamesGrid data={slotsSettings?.featuredGamesGrid as any} />

      {/* Featured Slots (SlotsLaunch API) */}
      <FeaturedSlotsGrid />

      {/* Filters & Games Grid */}
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
        <div className="container pt-8 pb-12 relative">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tighter text-gray-900 font-mono mb-2">
              Toate Jocurile de Păcănele
            </h2>
            <p className="text-gray-600 text-lg">
              Descoperă {totalGamesCount.toLocaleString('ro-RO')} jocuri de sloturi
            </p>
          </div>

          {allGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-mono">⚠️ API indisponibil momentan. Reveniți mai târziu.</p>
            </div>
          ) : (
            <>
              {isDev && allGames.length < totalGamesCount && (
                <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-800">
                    🔧 <strong>Dev Mode:</strong> Showing {allGames.length} of {totalGamesCount.toLocaleString('ro-RO')} games.
                    Using cached data to prevent API rate limits. Production will show all games.
                  </p>
                </div>
              )}
              <SlotsFilteredGrid
                allGames={allGames}
                providers={providers}
                types={types}
                themes={themes}
                singleBase={SINGLE_BASE}
              />
            </>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <ContentSections content={slotsSettings?.content || undefined} />

      {/* Responsible Gaming Disclaimer */}
      <ResponsibleGamingDisclaimer />

      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Pacanele Gratis Online',
            description:
              'Colecție completă de jocuri de păcănele gratis disponibile pentru joc demo pe Cazinou.io',
            numberOfItems: totalGamesCount,
            itemListElement: allGames.slice(0, 20).map((game, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Game',
                name: game.name,
                url: `https://cazinou.io/${SINGLE_BASE}/${game.slug}`,
                description: game.description || `Joacă ${game.name} online gratis`,
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
