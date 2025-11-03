import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'

export type FeaturedGameBlock = {
  _type: 'featuredGame'
  heading?: string
  text?: string
  buttonText?: string
  affiliateLink?: string
  showRating?: boolean
  displayOptions?: {
    showProvider?: boolean
    showRTP?: boolean
    showVolatility?: boolean
    showReleaseDate?: boolean
    showGameFeatures?: boolean
  }
  game?: {
    _id?: string
    name?: string
    slug?: {current?: string}
    slotsLaunchSlug?: string
    rating?: number
    mainImage?: unknown
    slotsLaunchThumb?: string
    provider?: {
      name?: string
    }
  }
}

type FeaturedGameProps = {
  block: FeaturedGameBlock
  index: number
}

function StarRating({score}: {score: number}) {
  // Game ratings are 1-5, normalize to 0-5 range
  const normalized = Math.max(0, Math.min(5, score))
  const starScore = Math.round(normalized * 2) / 2 // Round to nearest 0.5
  const full = Math.floor(starScore)
  const hasHalf = starScore - full >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)

  const stars = []
  for (let i = 0; i < full; i++) stars.push(<Star key={`full-${i}`} variant="full" />)
  if (hasHalf) stars.push(<Star key="half" variant="half" />)
  for (let i = 0; i < empty; i++) stars.push(<Star key={`empty-${i}`} variant="empty" />)

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-0.5" aria-label={`${normalized.toFixed(1)} out of 5 rating`}>
        {stars}
      </span>
      <span className="text-sm font-semibold text-gray-900 font-mono">
        {normalized.toFixed(1)}/5
      </span>
    </div>
  )
}

function Star({variant}: {variant: 'full' | 'half' | 'empty'}) {
  if (variant === 'half') {
    return (
      <span className="relative inline-block h-5 w-5 leading-none" aria-hidden>
        <span
          className="absolute inset-0 overflow-hidden text-yellow-500 leading-none"
          style={{clipPath: 'inset(0 50% 0 0)'}}
        >
          ★
        </span>
        <span className="text-gray-300 leading-none">★</span>
      </span>
    )
  }
  const colorClass = variant === 'full' ? 'text-yellow-500' : 'text-gray-300'
  return (
    <span className={`inline-block h-5 w-5 ${colorClass} leading-none`} aria-hidden>
      ★
    </span>
  )
}

export default function FeaturedGame({block}: FeaturedGameProps) {
  if (!block?.game) {
    return null
  }

  const game = block.game
  const slug = game.slug?.current
  const detailsHref = slug ? `/pacanele/${slug}` : undefined

  // Use slotsLaunchThumb if available, fallback to mainImage
  const thumbnailUrl = game.slotsLaunchThumb || (game.mainImage ? urlForImage(game.mainImage)?.width(400).height(400).fit('max').url() : null)

  const buttonText = block.buttonText || 'Joacă Gratis'
  const showRating = block.showRating !== false
  const displayOptions = block.displayOptions || {}
  const shouldShow = (option: keyof typeof displayOptions) => displayOptions[option] !== false

  return (
    <section className="relative my-8 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/30 via-white to-white shadow-sm">
      {/* Background Pattern */}
      {thumbnailUrl && (
        <div className="absolute inset-0 opacity-5">
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            className="object-cover blur-sm"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 py-8 md:grid-cols-2 md:py-10 lg:gap-8">
          {/* Left Column: Text Content */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl font-mono">
                {block.heading || game.name || 'Featured Game'}
              </h2>

              {showRating && game.rating && (
                <div className="inline-flex">
                  <StarRating score={game.rating} />
                </div>
              )}

              {shouldShow('showProvider') && game.provider?.name && (
                <p className="text-base font-semibold text-orange-600 font-mono">
                  by {game.provider.name}
                </p>
              )}

              {block.text && (
                <p className="text-sm leading-relaxed text-gray-700">
                  {block.text}
                </p>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
              {/* Game Features - Placeholder for future data */}
              {shouldShow('showGameFeatures') && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-mono">
                    Game Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 font-mono">
                      Free Spins
                    </span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 font-mono">
                      Wild Symbols
                    </span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 font-mono">
                      Bonus Rounds
                    </span>
                  </div>
                </div>
              )}

              {/* Game Stats */}
              {(shouldShow('showRTP') || shouldShow('showVolatility') || shouldShow('showReleaseDate')) && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 font-mono">
                  {shouldShow('showRTP') && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">RTP:</span>
                      <span>96.5%</span>
                    </div>
                  )}
                  {shouldShow('showVolatility') && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Volatility:</span>
                      <span>Medium-High</span>
                    </div>
                  )}
                  {shouldShow('showReleaseDate') && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Released:</span>
                      <span>2024</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {detailsHref && (
                <Link
                  href={detailsHref}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white font-mono"
                >
                  {buttonText}
                </Link>
              )}

              {block.affiliateLink && (
                <a
                  href={block.affiliateLink}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border-2 border-orange-500 bg-white px-6 py-2.5 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white font-mono"
                >
                  Joacă pe bani reali
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Game Thumbnail Card */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xs rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {thumbnailUrl ? (
                <div className="relative mx-auto aspect-square w-full max-w-[256px]">
                  <Image
                    src={thumbnailUrl}
                    alt={`${game.name} thumbnail`}
                    fill
                    className="object-contain rounded-lg"
                    sizes="256px"
                    unoptimized={thumbnailUrl.includes('slotslaunch.com')}
                  />
                </div>
              ) : (
                <div className="mx-auto flex aspect-square w-full max-w-[256px] items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  No image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
