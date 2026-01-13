import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'
import {buildAffiliateUrl} from '@/lib/affiliate-utils'

export type FeaturedCasinoBlock = {
  _type: 'featuredCasino'
  heading?: string
  text?: string
  buttonText?: string
  showRating?: boolean
  displayOptions?: {
    showBonus?: boolean
    showKeyFeatures?: boolean
    showPaymentMethods?: boolean
    showPlatformBadges?: boolean
    showDepositLimits?: boolean
    showGameCount?: boolean
    showEstablishedYear?: boolean
    showLicense?: boolean
  }
  casino?: {
    _id?: string
    name?: string
    slug?: {current?: string}
    affiliateLink?: string
    logo?: unknown
    featuredBanner?: unknown
    rating?: number
    welcomeBonus?: string
    keyFeatures?: string[]
    paymentMethods?: string[]
    crypto?: boolean
    mobile?: boolean
    liveCasino?: boolean
    minimumDeposit?: number
    maximumDeposit?: number
    numberOfGames?: number
    companyInfo?: {
      establishedYear?: number
      licenses?: Array<{
        license?: string
        licenseNumber?: string
        licenseAuthority?: string
      }>
    }
  }
}

type FeaturedCasinoProps = {
  block: FeaturedCasinoBlock
  index: number
  pageSlug: string
}

function StarRating({score}: {score: number}) {
  const normalized = Math.max(0, Math.min(10, score))
  const starScore = Math.round((normalized / 2) * 2) / 2
  const full = Math.floor(starScore)
  const hasHalf = starScore - full >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)

  const stars = []
  for (let i = 0; i < full; i++) stars.push(<Star key={`full-${i}`} variant="full" />)
  if (hasHalf) stars.push(<Star key="half" variant="half" />)
  for (let i = 0; i < empty; i++) stars.push(<Star key={`empty-${i}`} variant="empty" />)

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-0.5" aria-label={`${normalized.toFixed(1)} out of 10 rating`}>
        {stars}
      </span>
      <span className="text-sm font-semibold text-gray-900 font-mono">
        {normalized.toFixed(1)}/10
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

export default function FeaturedCasino({block, pageSlug}: FeaturedCasinoProps) {
  if (!block?.casino) {
    return null
  }

  const casino = block.casino
  const slug = casino.slug?.current
  const detailsHref = slug ? `/casino/${slug}` : undefined

  // Use featured banner if available, fallback to logo
  const bannerImage = casino.featuredBanner || casino.logo
  const bannerUrl = bannerImage ? urlForImage(bannerImage)?.width(1920).height(600).fit('crop').url() : null
  const logoUrl = casino.logo ? urlForImage(casino.logo)?.width(800).height(800).url() : null

  const buttonText = block.buttonText || 'Joacă Acum'
  const showRating = block.showRating !== false
  const displayOptions = block.displayOptions || {}
  const shouldShow = (option: keyof typeof displayOptions) => displayOptions[option] !== false

  return (
    <section className="relative my-8 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/30 via-white to-white shadow-sm">
      {/* Background Banner */}
      {bannerUrl && (
        <div className="absolute inset-0 opacity-10">
          <Image
            src={bannerUrl}
            alt=""
            fill
            loading="lazy"
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 py-8 md:grid-cols-[1fr_auto] md:py-10 lg:gap-8">
          {/* Left Column: Text Content */}
          <div className="flex flex-col justify-center space-y-4">
            {block.heading && (
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 font-mono">
                {block.heading}
              </p>
            )}

            <div className="space-y-3">
              <div className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl font-mono">
                {casino.name || 'Featured Casino'}
              </div>

              {showRating && casino.rating && (
                <div className="inline-flex">
                  <StarRating score={casino.rating} />
                </div>
              )}

              {shouldShow('showBonus') && casino.welcomeBonus && (
                <p className="text-base font-semibold text-orange-600 font-mono">
                  {casino.welcomeBonus}
                </p>
              )}

              {block.text && (
                <p className="text-base leading-relaxed text-gray-700">
                  {block.text}
                </p>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-3">
              {/* Key Features */}
              {shouldShow('showKeyFeatures') && casino.keyFeatures && casino.keyFeatures.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-mono">
                    Caracteristici Principale
                  </div>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {casino.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-0.5 text-orange-500">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment Methods */}
              {shouldShow('showPaymentMethods') && casino.paymentMethods && casino.paymentMethods.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-mono">
                    Metode de Plată
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {casino.paymentMethods.slice(0, 8).map((method, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 font-mono"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Badges */}
              {shouldShow('showPlatformBadges') && (casino.mobile || casino.crypto || casino.liveCasino) && (
                <div className="flex flex-wrap gap-2">
                  {casino.mobile && (
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 font-mono">
                      📱 Mobile
                    </span>
                  )}
                  {casino.crypto && (
                    <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 font-mono">
                      ₿ Crypto
                    </span>
                  )}
                  {casino.liveCasino && (
                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 font-mono">
                      🎥 Live Casino
                    </span>
                  )}
                </div>
              )}

              {/* Deposit Limits, Game Count, Established Year, License */}
              {(shouldShow('showDepositLimits') || shouldShow('showGameCount') || shouldShow('showEstablishedYear') || shouldShow('showLicense')) && (
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 font-mono">
                  {shouldShow('showDepositLimits') && (casino.minimumDeposit || casino.maximumDeposit) && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Deposit:</span>
                      <span>
                        {casino.minimumDeposit && `€${casino.minimumDeposit}`}
                        {casino.minimumDeposit && casino.maximumDeposit && ' - '}
                        {casino.maximumDeposit && `€${casino.maximumDeposit}`}
                      </span>
                    </div>
                  )}
                  {shouldShow('showGameCount') && casino.numberOfGames && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Games:</span>
                      <span>{casino.numberOfGames.toLocaleString()}+</span>
                    </div>
                  )}
                  {shouldShow('showEstablishedYear') && casino.companyInfo?.establishedYear && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Est.:</span>
                      <span>{casino.companyInfo.establishedYear}</span>
                    </div>
                  )}
                  {shouldShow('showLicense') && casino.companyInfo?.licenses?.[0]?.license && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">License:</span>
                      <span>{casino.companyInfo.licenses[0].license}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {casino.affiliateLink && (
                <a
                  href={buildAffiliateUrl(casino.affiliateLink, pageSlug, 'featured_casino_button')}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white font-mono"
                  data-tracking-component="featured-casino"
                  data-tracking-brand={casino.name}
                >
                  {buttonText}
                </a>
              )}

              {detailsHref && (
                <Link
                  href={detailsHref}
                  className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white font-mono"
                >
                  Vezi Detalii
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Logo Card */}
          <div className="flex items-center justify-center">
            {casino.affiliateLink ? (
              <a
                href={buildAffiliateUrl(casino.affiliateLink, pageSlug, 'featured_casino_logo')}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-2 shadow-sm hover:border-orange-300 hover:shadow-md transition-all"
              >
                {logoUrl ? (
                  <div className="relative mx-auto h-[320px] w-full min-w-[280px]">
                    <Image
                      src={logoUrl}
                      alt={`${casino.name} logo`}
                      fill
                      loading="lazy"
                      className="object-contain"
                      sizes="(max-width: 768px) 90vw, 512px"
                    />
                  </div>
                ) : (
                  <div className="mx-auto flex h-[320px] w-full min-w-[280px] items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    No logo
                  </div>
                )}
              </a>
            ) : (
              <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                {logoUrl ? (
                  <div className="relative mx-auto h-[320px] w-full min-w-[280px]">
                    <Image
                      src={logoUrl}
                      alt={`${casino.name} logo`}
                      fill
                      loading="lazy"
                      className="object-contain"
                      sizes="(max-width: 768px) 90vw, 512px"
                    />
                  </div>
                ) : (
                  <div className="mx-auto flex h-[320px] w-full min-w-[280px] items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    No logo
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
