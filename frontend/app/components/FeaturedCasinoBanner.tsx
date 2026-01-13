import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'
import {buildAffiliateUrl} from '@/lib/affiliate-utils'

type Casino = {
  _id?: string
  name?: string
  slug?: {current?: string}
  affiliateLink?: string
  logo?: unknown
  rating?: number
  welcomeBonus?: string
  keyFeatures?: string[]
}

type FeaturedCasinoBannerProps = {
  casino: Casino | null
  pageSlug: string
}

export function FeaturedCasinoBanner({casino, pageSlug}: FeaturedCasinoBannerProps) {
  if (!casino) {
    return null
  }

  const casinoSlug = casino.slug?.current
  const logoUrl = casino.logo ? urlForImage(casino.logo)?.width(800).height(800).url() : null

  return (
    <section className="my-12">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-lg">
          <div className="grid gap-8 md:grid-cols-[auto_1fr_auto]">
            {/* Casino Logo */}
            <div className="flex items-center justify-center">
              {casinoSlug && (
                <Link href={`/casino/${casinoSlug}`} className="block">
                  <div className="relative h-56 w-56 overflow-hidden rounded-2xl border-2 border-orange-200 bg-white p-2 shadow-md transition hover:shadow-lg">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={`${casino.name} logo`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 280px, 360px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No logo
                      </div>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Casino Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-gray-900 font-mono">
                  {casino.name || 'Casino'}
                </div>
                {typeof casino.rating === 'number' && (
                  <div className="rounded-full bg-amber-50 px-6 py-3 font-semibold text-amber-700 whitespace-nowrap font-mono flex items-center gap-2 text-lg">
                    <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {casino.rating.toFixed(1)} / 10
                  </div>
                )}
              </div>

              {casino.keyFeatures && casino.keyFeatures.length > 0 && (
                <ul className="space-y-2 text-sm text-gray-700">
                  {casino.keyFeatures.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="text-orange-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {casino.welcomeBonus && (
                <div className="rounded-lg border-2 border-orange-300 bg-orange-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 font-mono mb-2">
                    Bonus de cazinou
                  </p>
                  <p className="text-lg font-bold text-gray-900 font-mono">
                    {casino.welcomeBonus}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">*T&C Se aplică</p>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col justify-center gap-3">
              {casino.affiliateLink && (
                <a
                  href={buildAffiliateUrl(casino.affiliateLink, pageSlug, 'featured_banner_button')}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-mono whitespace-nowrap"
                  data-tracking-component="featured-banner"
                  data-tracking-brand={casino.name}
                >
                  Profită Acum
                </a>
              )}
              {casinoSlug && (
                <Link
                  href={`/casino/${casinoSlug}`}
                  className="inline-flex items-center justify-center rounded-full border-2 border-orange-500 bg-white px-8 py-4 text-base font-semibold text-orange-600 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-mono whitespace-nowrap"
                >
                  Citește recenzia
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
