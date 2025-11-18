// app/pacanele/[slug]/page.tsx
import Link from 'next/link'
import {redirect} from 'next/navigation'
import {cache} from 'react'
import {GameIframe} from '@/app/components/GameIframe'
import {ContentSections} from '@/app/components/ContentSections'
import {JsonLd, schemaHelpers} from '@/app/components/JsonLd'
import {sanityFetch} from '@/sanity/lib/live'
import {gameBySlugQuery, allGameSlugsQuery} from '@/sanity/lib/queries'
import {client} from '@/sanity/lib/client'
import type {Metadata} from 'next'

const LOBBY_PATH = process.env.LOBBY_PATH || '/pacanele-gratis'

type Props = {
  params: Promise<{slug: string}>
}

// Add ISR revalidation
export const revalidate = 3600

// Cache game query to prevent duplicates
const getGame = cache(async (slug: string) => {
  const {data} = await sanityFetch({
    query: gameBySlugQuery,
    params: {slug},
    stega: false,
  })
  return data
})

// Generate static params for all games in Sanity
export async function generateStaticParams() {
  const games = await client.fetch(allGameSlugsQuery, {}, {
    perspective: 'published',
  })

  return (games || []).map((game: {slug: string}) => ({
    slug: game.slug,
  }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const game = await getGame(params.slug)

  if (!game) {
    return {
      title: 'Joc Slot Online',
      description: 'Joacă sloturi online',
    }
  }

  const title = `${game.name} - Joacă Online`
  const description = `Joacă ${game.name} online. Încearcă demo sau joacă pentru bani reali.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: game.slotsLaunchThumb ? [{url: game.slotsLaunchThumb}] : [],
    },
  }
}

export default async function SingleSlotPage(props: Props) {
  const params = await props.params
  const game = await getGame(params.slug)

  // Redirect to lobby if game not found in Sanity
  if (!game) {
    redirect(LOBBY_PATH)
  }

  const title = game.name
  const gameUrl = game.slotsLaunchId ? `https://slotslaunch.com/iframe/${game.slotsLaunchId}` : ''

  // Generate structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cazinou.io'
  const pageUrl = `${siteUrl}/pacanele/${params.slug}`

  const gameSchema = schemaHelpers.game({
    name: game.name,
    url: pageUrl,
    description: `Joacă ${game.name} online direct în browser. ${game.provider?.name ? `De la ${game.provider.name}.` : ''}`,
    image: game.slotsLaunchThumb || undefined,
    provider: game.provider?.name,
    rating: game.rating,
  })

  const breadcrumbSchema = schemaHelpers.breadcrumb([
    { name: 'Acasă', url: siteUrl },
    { name: 'Sloturi', url: `${siteUrl}${LOBBY_PATH}` },
    { name: game.name, url: pageUrl },
  ])

  return (
    <div className="bg-white">
      <JsonLd data={gameSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
        <div className="container pt-8 pb-12 relative">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-6 text-gray-600 font-mono">
            <Link href="/" className="hover:underline hover:text-brand transition">
              Acasă
            </Link>
            <span className="mx-2">/</span>
            <Link href={LOBBY_PATH} className="hover:underline hover:text-brand transition">
              Sloturi
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{title}</span>
          </nav>

          <header className="flex items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand font-mono mb-2">
                Slot Online
              </p>
              <h1 className="text-3xl font-extrabold tracking-tighter leading-tight text-gray-900 lg:text-5xl font-mono">
                {title}
              </h1>
            </div>
          </header>

          <section className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Game Iframe */}
            <GameIframe url={gameUrl} title={title} />

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 font-mono mb-3">
                  Despre Joc
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Joacă <strong>{title}</strong> online direct în browser.
                  Folosește butonul de fullscreen pentru o experiență mai bună.
                </p>
                {game.provider?.name && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="font-bold text-gray-700">Provider:</span>{' '}
                    <span className="font-mono">{game.provider.name}</span>
                  </p>
                )}
                {game.rtp && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-bold text-gray-700">RTP:</span>{' '}
                    <span className="font-mono">{game.rtp}</span>
                  </p>
                )}
                {game.volatility && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-bold text-gray-700">
                      Volatilitate:
                    </span>{' '}
                    <span className="font-mono">{game.volatility}</span>
                  </p>
                )}
              </div>

              {/* Responsible Gaming Notice */}
              <div className="rounded-lg border-2 border-orange-400 bg-orange-50/50 p-4 font-mono">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                      18+
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      Joacă responsabil – Doar pentru persoane peste 18 ani
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Jocurile de noroc sunt destinate exclusiv persoanelor care au împlinit 18 ani. Joacă mereu cu măsură.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Link
                  href={LOBBY_PATH}
                  className="text-brand hover:underline font-mono font-semibold text-sm"
                >
                  ← Înapoi la toate sloturile
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* SEO Content from Sanity (if available) */}
      {game.seoContent && (
        <ContentSections content={game.seoContent} />
      )}
    </div>
  )
}
