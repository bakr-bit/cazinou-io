import { useMemo, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/sanity/lib/utils'

// ==========================================================
// Types
// ==========================================================
export type DisplayOptions = {
  showRank?: boolean
  showLogo?: boolean
  showName?: boolean
  showBonus?: boolean
  showRating?: boolean
  showDescription?: boolean
  showLicense?: boolean
  showActions?: boolean
  showPaymentMethods?: boolean
  showKeyFeatures?: boolean
  showPlatformBadges?: boolean
  showDepositLimits?: boolean
  showGameCount?: boolean
  showEstablishedYear?: boolean
}

export type TopListItem = {
  _key?: string
  rank?: number
  customDescription?: string
  item?: {
    _id?: string
    _type?: string
    name?: string
    slug?: { current?: string } | string
    affiliateLink?: string
    logo?: unknown
    rating?: number
    welcomeBonus?: string
    license?: string
    paymentMethods?: string[]
    keyFeatures?: string[]
    crypto?: boolean
    mobile?: boolean
    liveCasino?: boolean
    minimumDeposit?: number
    maximumDeposit?: number
    numberOfGames?: number
    companyInfo?: {
      establishedYear?: number
    }
  }
}

export type TopListBlock = {
  _type: 'topListObject'
  title?: string
  description?: string
  listItems?: TopListItem[]
  displayOptions?: DisplayOptions
}

// ==========================================================
// Utility helpers
// ==========================================================
function isTopListBlock(data: unknown): data is TopListBlock {
  return !!data && typeof data === 'object' && (data as TopListBlock)._type === 'topListObject'
}

function safeNumber(n: unknown): number | null {
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function resolveSlug(slug: TopListItem['item'] extends infer T ? T extends { slug?: any } ? T['slug'] : never : never): string | undefined {
  if (!slug) return undefined
  if (typeof slug === 'string') return slug
  if (typeof slug === 'object' && 'current' in slug) return (slug as { current?: string }).current
  return undefined
}

function logoUrlFrom(logo: unknown): string | null {
  try {
    return logo ? urlForImage(logo)?.width(160).height(160).fit('max').url() ?? null : null
  } catch (_) {
    return null
  }
}

function licenseLabelFrom(license: unknown): string | null {
  if (typeof license !== 'string') return null
  const trimmed = license.trim()
  return trimmed.length > 0 ? trimmed : null
}

function sortListItems(items: TopListItem[] = []): TopListItem[] {
  return [...items].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity))
}

function fallbackRank(index: number, rank?: number): number {
  return rank ?? index + 1
}

function detailsHrefFor(slug?: string): string | undefined {
  return slug ? `/recenzii/${slug}` : undefined
}

function shouldShow(displayOptions: DisplayOptions | undefined, feature: keyof DisplayOptions): boolean {
  // Default to true for backward compatibility if displayOptions is undefined
  if (!displayOptions) return true
  // If the feature is explicitly set, use that value; otherwise default to true
  return displayOptions[feature] ?? true
}

function getRankTheme(rank: number) {
  if (rank === 1)
    return {
      card: 'border-orange-200 bg-gradient-to-br from-orange-50 via-white to-white',
      badge: 'bg-orange-500',
      title: 'text-orange-700',
      bonus: 'text-orange-600',
      badgeText: 'border-orange-200 bg-white/80 text-orange-600',
      primaryButton: 'bg-orange-500 hover:bg-orange-600',
      row: 'border-l-4 border-orange-300 bg-orange-50/30',
    }
  if (rank === 2)
    return {
      card: 'border-orange-100 bg-gradient-to-br from-orange-50/50 via-white to-white',
      badge: 'bg-orange-400',
      title: 'text-gray-900',
      bonus: 'text-orange-600',
      badgeText: 'border-orange-100 bg-white/80 text-orange-500',
      primaryButton: 'bg-orange-500 hover:bg-orange-600',
      row: 'border-l-4 border-orange-200 bg-orange-50/20',
    }
  if (rank === 3)
    return {
      card: 'border-gray-200 bg-white',
      badge: 'bg-orange-400',
      title: 'text-gray-900',
      bonus: 'text-gray-700',
      badgeText: 'border-orange-100 bg-orange-50 text-orange-600',
      primaryButton: 'bg-orange-500 hover:bg-orange-600',
      row: 'border-l-4 border-gray-200 bg-gray-50/30',
    }
  return {
    card: 'border-gray-200 bg-white',
    badge: 'bg-gray-500',
    title: 'text-gray-900',
    bonus: 'text-gray-700',
    badgeText: 'border-gray-200 bg-gray-50 text-gray-700',
    primaryButton: 'bg-orange-500 hover:bg-orange-600',
    row: 'hover:bg-gray-50/50',
  }
}

// ==========================================================
// Subcomponents
// ==========================================================
function ToplistItemCard({ listItem, index, displayOptions }: { listItem: TopListItem; index: number; displayOptions?: DisplayOptions }) {
  const itm = listItem.item
  if (!itm) return null

  const slug = resolveSlug(itm.slug)
  const detailsHref = detailsHrefFor(slug)
  const rank = fallbackRank(index, listItem.rank)
  const logoUrl = logoUrlFrom(itm.logo)
  const ratingValue = safeNumber(itm.rating)
  const licenseLabel = licenseLabelFrom(itm.license)
  const hasAffiliateLink = Boolean(itm.affiliateLink)

  const rankTheme = getRankTheme(rank)
  const keySeed = itm._id || slug || `${index}`

  return (
    <article
      key={`${rank}-${keySeed}`}
      className={`overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${rankTheme.card}`}
      aria-labelledby={`tl-${keySeed}-title`}
    >
      <div className="grid grid-cols-1 items-center gap-y-4 p-4 sm:gap-x-6">
        {/* Column 1: Rank & Logo */}
        {(shouldShow(displayOptions, 'showRank') || shouldShow(displayOptions, 'showLogo')) && (
          <div className="flex items-center gap-4 sm:pr-6">
            {shouldShow(displayOptions, 'showRank') && (
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white shadow ${rankTheme.badge}`}
                aria-label={`Rank ${rank}`}
              >
                {rank}
              </div>
            )}

            {shouldShow(displayOptions, 'showLogo') && (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 sm:h-24 sm:w-24">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`${itm.name || 'Casino'} logo`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 100px) 64px, 96px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    No image
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Column 2: Details */}
        <div className="min-w-0 space-y-2 sm:border-l sm:border-slate-200 sm:pl-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              {shouldShow(displayOptions, 'showName') && (
                <h3
                  id={`tl-${keySeed}-title`}
                  className={`truncate text-lg font-bold sm:text-xl font-mono ${rankTheme.title}`}
                >
                  {itm.name || 'Untitled Casino'}
                </h3>
              )}
              {shouldShow(displayOptions, 'showBonus') && itm.welcomeBonus && (
                <p className={`text-sm sm:text-base font-mono ${rankTheme.bonus}`}>
                  {itm.welcomeBonus}
                </p>
              )}
            </div>

            {((shouldShow(displayOptions, 'showRating') && ratingValue !== null) || (shouldShow(displayOptions, 'showDescription') && listItem.customDescription)) && (
              <div className="flex max-w-xs flex-col items-center gap-2 text-center">
                {shouldShow(displayOptions, 'showRating') && ratingValue !== null && <StarRating score={ratingValue} />}
                {shouldShow(displayOptions, 'showDescription') && listItem.customDescription && (
                  <p className="text-sm italic text-slate-600 sm:text-base">{listItem.customDescription}</p>
                )}
              </div>
            )}
          </div>

          {/* Additional Features */}
          {shouldShow(displayOptions, 'showPlatformBadges') && (itm.crypto || itm.mobile || itm.liveCasino) && (
            <div className="flex flex-wrap gap-2 mt-2">
              {itm.mobile && <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Mobile</span>}
              {itm.liveCasino && <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Live Casino</span>}
              {itm.crypto && <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Crypto</span>}
            </div>
          )}

          {/* Key Features */}
          {shouldShow(displayOptions, 'showKeyFeatures') && itm.keyFeatures && itm.keyFeatures.length > 0 && (
            <div className="mt-3">
              <ul className="space-y-1.5 text-sm text-gray-700">
                {itm.keyFeatures.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-500 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Payment Methods */}
          {shouldShow(displayOptions, 'showPaymentMethods') && itm.paymentMethods && itm.paymentMethods.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Metode de Plată</p>
              <div className="flex flex-wrap gap-2">
                {itm.paymentMethods.map((method, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {shouldShow(displayOptions, 'showDepositLimits') && (itm.minimumDeposit || itm.maximumDeposit) && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Depunere:</span>
                <span className="font-semibold">
                  {itm.minimumDeposit ? `${itm.minimumDeposit} RON` : '—'} - {itm.maximumDeposit ? `${itm.maximumDeposit} RON` : '—'}
                </span>
              </div>
            )}
            {shouldShow(displayOptions, 'showGameCount') && itm.numberOfGames && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Jocuri:</span>
                <span className="font-semibold">{itm.numberOfGames.toLocaleString()}</span>
              </div>
            )}
            {shouldShow(displayOptions, 'showEstablishedYear') && itm.companyInfo?.establishedYear && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Fondat:</span>
                <span className="font-semibold">{itm.companyInfo.establishedYear}</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: License */}
        {shouldShow(displayOptions, 'showLicense') && (
          <div className="flex items-center justify-start sm:border-l sm:border-slate-200 sm:pl-6">
            {licenseLabel ? (
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${rankTheme.badgeText}`}>
                {licenseLabel}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-400">
                License N/A
              </span>
            )}
          </div>
        )}

        {/* Column 4: Actions */}
        {shouldShow(displayOptions, 'showActions') && (
          <div className="flex flex-col gap-3 sm:w-40 sm:border-l sm:border-gray-200 sm:pl-6">
            <a
              href={hasAffiliateLink ? itm.affiliateLink : undefined}
              className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold font-mono transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                hasAffiliateLink
                  ? `${rankTheme.primaryButton} text-white focus-visible:ring-orange-500`
                  : 'cursor-not-allowed bg-gray-200 text-gray-500 focus-visible:ring-gray-400'
              }`}
              target={hasAffiliateLink ? '_blank' : undefined}
              rel={hasAffiliateLink ? 'nofollow noopener noreferrer' : undefined}
              aria-disabled={!hasAffiliateLink}
            >
              {hasAffiliateLink ? 'Joacă Acum' : 'Indisponibil'}
            </a>

            {detailsHref ? (
              <Link
                href={detailsHref}
                className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold font-mono text-gray-700 transition hover:border-orange-400 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                aria-label={`Vezi detalii pentru ${itm.name ?? 'cazino'}`}
              >
                Vezi Detalii
              </Link>
            ) : (
              <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-dashed border-gray-200 px-4 py-2 text-xs font-medium font-mono text-gray-400">
                În curând
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function ToplistTableRow({ listItem, index, displayOptions }: { listItem: TopListItem; index: number; displayOptions?: DisplayOptions }) {
  const itm = listItem.item
  if (!itm) return null

  const slug = resolveSlug(itm.slug)
  const detailsHref = detailsHrefFor(slug)
  const rank = fallbackRank(index, listItem.rank)
  const logoUrl = logoUrlFrom(itm.logo)
  const ratingValue = safeNumber(itm.rating)
  const licenseLabel = licenseLabelFrom(itm.license)
  const hasAffiliateLink = Boolean(itm.affiliateLink)

  const rankTheme = getRankTheme(rank)
  const keySeed = itm._id || slug || `${index}`

  return (
    <div
      className={`flex items-center gap-x-6 px-6 py-4 ${rankTheme.row}`}
      aria-labelledby={`tl-table-${keySeed}-title`}
    >
      <div className="flex items-center gap-4 pr-6 flex-1">
        {shouldShow(displayOptions, 'showRank') && (
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white shadow ${rankTheme.badge}`}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </div>
        )}

        <div className="flex items-center gap-4">
          {shouldShow(displayOptions, 'showLogo') && (
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${itm.name || 'Casino'} logo`}
                  fill
                  className="object-contain p-2"
                  sizes="112px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">No image</span>
              )}
            </div>
          )}
          <div className="min-w-0 space-y-1">
            {shouldShow(displayOptions, 'showName') && (
              <h3
                id={`tl-table-${keySeed}-title`}
                className={`truncate text-base font-semibold font-mono ${rankTheme.title}`}
              >
                {itm.name || 'Untitled Casino'}
              </h3>
            )}
            {shouldShow(displayOptions, 'showBonus') && itm.welcomeBonus && (
              <p className={`text-sm font-mono ${rankTheme.bonus}`}>{itm.welcomeBonus}</p>
            )}
            {/* Platform Badges */}
            {shouldShow(displayOptions, 'showPlatformBadges') && (itm.crypto || itm.mobile || itm.liveCasino) && (
              <div className="flex flex-wrap gap-2 mt-1">
                {itm.mobile && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Mobile</span>}
                {itm.liveCasino && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Live</span>}
                {itm.crypto && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Crypto</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Features Row */}
      {(
        (shouldShow(displayOptions, 'showKeyFeatures') && itm.keyFeatures && itm.keyFeatures.length > 0) ||
        (shouldShow(displayOptions, 'showPaymentMethods') && itm.paymentMethods && itm.paymentMethods.length > 0) ||
        (shouldShow(displayOptions, 'showDepositLimits') && (itm.minimumDeposit || itm.maximumDeposit)) ||
        (shouldShow(displayOptions, 'showGameCount') && itm.numberOfGames) ||
        (shouldShow(displayOptions, 'showEstablishedYear') && itm.companyInfo?.establishedYear)
      ) && (
        <div className="flex-1 border-t border-slate-100 pt-3 mt-3 space-y-2">
          {/* Key Features */}
          {shouldShow(displayOptions, 'showKeyFeatures') && itm.keyFeatures && itm.keyFeatures.length > 0 && (
            <div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700">
                {itm.keyFeatures.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-orange-500 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Payment Methods */}
          {shouldShow(displayOptions, 'showPaymentMethods') && itm.paymentMethods && itm.paymentMethods.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Plăți:</span>
              {itm.paymentMethods.slice(0, 5).map((method, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs border border-gray-200">
                  {method}
                </span>
              ))}
            </div>
          )}

          {/* Additional Info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {shouldShow(displayOptions, 'showDepositLimits') && (itm.minimumDeposit || itm.maximumDeposit) && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Depunere:</span>
                <span className="font-semibold">
                  {itm.minimumDeposit ? `${itm.minimumDeposit}` : '—'} - {itm.maximumDeposit ? `${itm.maximumDeposit}` : '—'} RON
                </span>
              </div>
            )}
            {shouldShow(displayOptions, 'showGameCount') && itm.numberOfGames && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Jocuri:</span>
                <span className="font-semibold">{itm.numberOfGames.toLocaleString()}</span>
              </div>
            )}
            {shouldShow(displayOptions, 'showEstablishedYear') && itm.companyInfo?.establishedYear && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Fondat:</span>
                <span className="font-semibold">{itm.companyInfo.establishedYear}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(shouldShow(displayOptions, 'showRating') || shouldShow(displayOptions, 'showDescription')) && (
        <div className="flex flex-col items-center gap-2 text-center sm:max-w-[14rem]">
          {shouldShow(displayOptions, 'showRating') && ratingValue !== null && <StarRating score={ratingValue} />}
          {shouldShow(displayOptions, 'showDescription') && listItem.customDescription && (
            <p className="text-sm italic text-slate-600">{listItem.customDescription}</p>
          )}
        </div>
      )}

      {shouldShow(displayOptions, 'showLicense') && (
        <div className="flex items-center justify-start">
          {licenseLabel ? (
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${rankTheme.badgeText}`}>
              {licenseLabel}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-400">
              License N/A
            </span>
          )}
        </div>
      )}

      {shouldShow(displayOptions, 'showActions') && (
        <div className="flex flex-col items-end gap-3">
          <a
            href={hasAffiliateLink ? itm.affiliateLink : undefined}
            className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold font-mono transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              hasAffiliateLink
                ? `${rankTheme.primaryButton} text-white focus-visible:ring-orange-500`
                : 'cursor-not-allowed bg-gray-200 text-gray-500 focus-visible:ring-gray-400'
            }`}
            target={hasAffiliateLink ? '_blank' : undefined}
            rel={hasAffiliateLink ? 'nofollow noopener noreferrer' : undefined}
            aria-disabled={!hasAffiliateLink}
          >
            {hasAffiliateLink ? 'Joacă Acum' : 'Indisponibil'}
          </a>

          {detailsHref ? (
            <Link
              href={detailsHref}
              className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold font-mono text-gray-700 transition hover:border-orange-400 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              aria-label={`Vezi detalii pentru ${itm.name ?? 'cazino'}`}
            >
              Vezi Detalii
            </Link>
          ) : (
            <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-dashed border-gray-200 px-4 py-2 text-xs font-medium font-mono text-gray-400">
              În curând
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ==========================================================
// Star Rating
// ==========================================================
function StarRating({ score }: { score: number }) {
  const normalized = Math.max(0, Math.min(10, score))
  const starScore = Math.round((normalized / 2) * 2) / 2
  const full = Math.floor(starScore)
  const hasHalf = starScore - full >= 0.5
  const empty = 5 - full - (hasHalf ? 1 : 0)

  const stars: ReactNode[] = []
  for (let i = 0; i < full; i++) stars.push(<Star key={`full-${i}`} variant="full" />)
  if (hasHalf) stars.push(<Star key="half" variant="half" />)
  for (let i = 0; i < empty; i++) stars.push(<Star key={`empty-${i}`} variant="empty" />)

  return (
    <div className="flex flex-shrink-0 items-center gap-2">
      <span
        className="inline-flex items-center gap-0.5"
        aria-label={`${normalized.toFixed(1)} out of 10 rating`}
      >
        {stars}
      </span>
      <span className="text-xs font-semibold font-mono text-gray-600 sm:text-sm">
        {normalized.toFixed(1)}/10
      </span>
    </div>
  )
}

function Star({ variant }: { variant: 'full' | 'half' | 'empty' }) {
  if (variant === 'half') {
    return (
      <span className="relative inline-block h-5 w-5 leading-none" aria-hidden>
        <span
          className="absolute inset-0 overflow-hidden text-amber-500 leading-none"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        >
          ★
        </span>
        <span className="text-gray-300 leading-none">★</span>
      </span>
    )
  }
  const colorClass = variant === 'full' ? 'text-amber-500' : 'text-gray-300'
  return (
    <span className={`inline-block h-5 w-5 ${colorClass} leading-none`} aria-hidden>
      ★
    </span>
  )
}

// ==========================================================
// Main Component
// ==========================================================
export function Toplist({ data }: { data: TopListBlock }) {
  if (!isTopListBlock(data) || !data.listItems || data.listItems.length === 0) return null

  const sortedItems = useMemo(() => sortListItems(data.listItems), [data.listItems])
  const displayOptions = data.displayOptions

  return (
    <section className="my-12 space-y-6">
      <header className="space-y-2 text-center sm:text-left">
        {data.title && <h2 className="text-3xl font-extrabold font-mono text-gray-900">{data.title}</h2>}
        {data.description && (
          <p className="text-base text-gray-600 sm:text-lg">{data.description}</p>
        )}
      </header>

      {/* Mobile Card View */}
      <div className="space-y-4 sm:hidden">
        {sortedItems.map((listItem, index) => (
          <ToplistItemCard key={listItem._key ?? `${index}`} listItem={listItem} index={index} displayOptions={displayOptions} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {sortedItems.map((listItem, index) => (
              <ToplistTableRow key={listItem._key ?? `${index}`} listItem={listItem} index={index} displayOptions={displayOptions} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Toplist
