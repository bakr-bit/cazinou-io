// app/pacanele-gratis/page.tsx
import type {SlotGame, Provider, GameType, Theme} from '@/lib/slotslaunch'
import {
  transformSanityGameToSlotGame,
  extractProvidersFromGames,
  extractTypesFromGames,
  extractThemesFromGames,
  type SanityGame,
} from '@/lib/sanity-games'
import {SlotsFilteredGrid} from '@/app/components/SlotsFilteredGrid'
import {FeaturedCasinoBanner} from '@/app/components/FeaturedCasinoBanner'
import {FeaturedGamesGrid} from '@/app/components/FeaturedGamesGrid'
import {FeaturedSlotsGrid} from '@/app/components/FeaturedSlotsGrid'
import {ContentSections} from '@/app/components/ContentSections'
import {ResponsibleGamingDisclaimer} from '@/app/components/ResponsibleGamingDisclaimer'
import {JsonLd} from '@/app/components/JsonLd'
import {generateOrganizationGraph} from '@/lib/organization'
import {sanityFetch} from '@/sanity/lib/live'
import {slotsPageSettingsQuery, allGamesQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'

const SINGLE_BASE = process.env.SINGLE_BASE || 'pacanele'

// Revalidate page every hour
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pacanele Gratis (Demo) Online - Top 40 Cele Mai Populare Jocuri',
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
    canonical: 'https://cazinou.io/pacanele-gratis/',
  },
}

type SlotsData = {
  games: SlotGame[]
  providers: Provider[]
  types: GameType[]
  themes: Theme[]
  totalCount: number
}

async function fetchAllSlotsData(): Promise<SlotsData> {
  console.log('🔄 Fetching games from Sanity...')

  // Fetch games from Sanity
  const {data: sanityGames} = await sanityFetch({
    query: allGamesQuery,
    stega: false,
  })

  if (!sanityGames || sanityGames.length === 0) {
    console.warn('⚠️ No games found in Sanity')
    return {
      games: [],
      providers: [],
      types: [],
      themes: [],
      totalCount: 0,
    }
  }

  console.log(`✅ Fetched ${sanityGames.length} games from Sanity`)

  // Transform Sanity games to SlotGame format
  const games = sanityGames.map((game: SanityGame) => transformSanityGameToSlotGame(game))

  // Extract filter options from games
  const providers = extractProvidersFromGames(sanityGames)
  const types = extractTypesFromGames(sanityGames)
  const themes = extractThemesFromGames(sanityGames)

  console.log(`📊 Filters: ${providers.length} providers, ${types.length} types, ${themes.length} themes`)

  return {
    games,
    providers,
    types,
    themes,
    totalCount: games.length,
  }
}

export default async function SlotsPage() {

  // Fetch slots page settings from Sanity
  const {data: slotsSettings} = await sanityFetch({
    query: slotsPageSettingsQuery,
    stega: false,
  })

  const featuredCasino = slotsSettings?.featuredCasino || null

  // Fetch games data from Sanity
  const slotsData = await fetchAllSlotsData()
  const { games: allGames, providers, types, themes, totalCount: totalGamesCount } = slotsData

  // Generate Organization + WebSite schema graph
  const organizationGraph = generateOrganizationGraph()

  return (
    <main className="bg-white">
      <JsonLd data={organizationGraph} />
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
      <FeaturedCasinoBanner casino={featuredCasino as any} pageSlug="pacanele-gratis" />

      {/* Featured Games Grid (Sanity-managed) */}
      <div className="container">
        <FeaturedGamesGrid data={slotsSettings?.featuredGamesGrid as any} />
      </div>

      {/* Featured Slots (SlotsLaunch API) */}
      <div className="container">
        <FeaturedSlotsGrid />
      </div>

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
              <p className="text-gray-600 font-mono">Nu există jocuri disponibile momentan.</p>
            </div>
          ) : (
            <SlotsFilteredGrid
              allGames={allGames}
              providers={providers}
              types={types}
              themes={themes}
              singleBase={SINGLE_BASE}
            />
          )}
        </div>
      </div>

      {/* Content Sections */}
      <ContentSections content={slotsSettings?.content || undefined} pageSlug="pacanele-gratis" />

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
                url: `https://cazinou.io/${SINGLE_BASE}/${game.id}-${game.slug}`,
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
