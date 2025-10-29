// app/pacanele/[slug]/page.tsx
import Link from 'next/link'
import {fetchGameById} from '@/lib/slotslaunch'
import {notFound} from 'next/navigation'
import {GameIframe} from '@/app/components/GameIframe'
import {ContentSections} from '@/app/components/ContentSections'
import {sanityFetch} from '@/sanity/lib/live'
import {gameContentBySlugQuery} from '@/sanity/lib/queries'
import type {Metadata} from 'next'

const LOBBY_PATH = process.env.LOBBY_PATH || '/pacanele-gratis'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Extract game ID from slug parameter
 * Format: "123-game-slug" -> 123
 */
function extractGameId(slug: string): number | null {
  const match = slug.match(/^(\d+)-/)
  return match ? parseInt(match[1], 10) : null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const gameId = extractGameId(params.slug)

  if (!gameId) {
    return {
      title: 'Joc Slot Online',
      description: 'Joacă sloturi online',
    }
  }

  const game = await fetchGameById(gameId)

  if (!game) {
    return {
      title: 'Joc Slot Online',
      description: 'Joacă sloturi online',
    }
  }

  const title = `${game.name} - Joacă Online`
  const description =
    game.description ||
    `Joacă ${game.name} online. Încearcă demo sau joacă pentru bani reali.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: game.thumb ? [{url: game.thumb}] : [],
    },
  }
}

export default async function SingleSlotPage(props: Props) {
  const params = await props.params
  const gameId = extractGameId(params.slug)

  if (!gameId) {
    return notFound()
  }

  const game = await fetchGameById(gameId)

  if (!game) {
    return notFound()
  }

  // API returns: name, thumb, url (iframe link)
  const title = game.name

  // Try to fetch Sanity game content by SlotsLaunch slug or ID
  const {data: sanityGame} = await sanityFetch({
    query: gameContentBySlugQuery,
    params: {
      slug: game.slug,
      id: game.id,
    },
    stega: false,
  })

  return (
    <div className="bg-white">
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
            <GameIframe url={game.url} title={title} />

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 font-mono mb-3">
                  Despre Joc
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Joacă <strong>{title}</strong> online direct în browser.
                  Folosește butonul de fullscreen pentru o experiență mai bună.
                </p>
                {game.provider && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="font-bold text-gray-700">Provider:</span>{' '}
                    <span className="font-mono">{game.provider}</span>
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
      {sanityGame?.seoContent && (
        <ContentSections content={sanityGame.seoContent} />
      )}
    </div>
  )
}
