import type {Metadata, ResolvingMetadata} from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

import DateComponent from '@/app/components/Date'
import PageBuilderPage from '@/app/components/PageBuilder'
import {ContentSections} from '@/app/components/ContentSections'
import {ResponsibleGamingDisclaimer} from '@/app/components/ResponsibleGamingDisclaimer'
import {JsonLd, schemaHelpers} from '@/app/components/JsonLd'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageOrInfoPageQuery, pagesSlugs, allGamesQuery} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {ThemedGamesGrid} from '@/app/components/ThemedGamesGrid'
import {FeaturedCasinoBanner} from '@/app/components/FeaturedCasinoBanner'
import {transformSanityGameToSlotGame, type SanityGame} from '@/lib/sanity-games'
import type {SlotGame} from '@/lib/slotslaunch'

type Props = {
  params: Promise<{slug: string}>
}

const SINGLE_BASE = process.env.SINGLE_BASE || 'pacanele'

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

/**
 * Generate the static params for the page.
 * This now includes 'page', 'infoPage', and 'themedSlotsPage' document types
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    perspective: 'published',
    stega: false,
  })
  return data ?? []
}

/**
 * Generate metadata for the page.
 * Handles 'page', 'infoPage', and 'themedSlotsPage' document types
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: pageData} = await sanityFetch({
    query: getPageOrInfoPageQuery,
    params,
    stega: false,
  })

  if (!pageData?._id) {
    return {}
  }

  // Handle themedSlotsPage type with SEO
  if (pageData._type === 'themedSlotsPage') {
    const themedPage = pageData as any
    const metaTitle = themedPage.seo?.metaTitle || themedPage.heading || themedPage.title
    const metaDescription = themedPage.seo?.metaDescription || themedPage.description || `Joacă ${themedPage.title} gratis online pe Cazinou.io`
    const ogImageSource = themedPage.seo?.ogImage
    const previousImages = (await parent).openGraph?.images || []
    const ogImage = resolveOpenGraphImage(ogImageSource)
    const author = themedPage.author

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `https://cazinou.io/${params.slug}`,
        siteName: 'Cazinou.io',
        locale: 'ro_RO',
        type: 'article',
        images: ogImage ? [ogImage, ...previousImages] : previousImages,
        ...(themedPage.publishedAt ? {publishedTime: themedPage.publishedAt} : {}),
        ...(themedPage._updatedAt ? {modifiedTime: themedPage._updatedAt} : {}),
        ...(author ? {
          authors: [`${author.firstName} ${author.lastName}`.trim()],
        } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: ogImage ? [ogImage, ...previousImages] : previousImages,
      },
      robots: {
        index: !themedPage.hidden,
        follow: true,
      },
      alternates: {
        canonical: `https://cazinou.io/${params.slug}/`,
      },
    }
  }

  // Handle infoPage type with SEO
  if (pageData._type === 'infoPage') {
    const infoPage = pageData as any
    const title = infoPage.seo?.metaTitle ?? infoPage.title ?? infoPage.heading
    const description = infoPage.seo?.metaDescription ?? infoPage.excerpt
    const ogImageSource = infoPage.seo?.ogImage
    const previousImages = (await parent).openGraph?.images || []
    const ogImage = resolveOpenGraphImage(ogImageSource)
    const author = infoPage.author

    return {
      title,
      description,
      openGraph: {
        title: infoPage.seo?.ogTitle ?? title,
        description: infoPage.seo?.ogDescription ?? description,
        images: ogImage ? [ogImage, ...previousImages] : previousImages,
        type: 'article',
        ...(infoPage.publishedAt ? {publishedTime: infoPage.publishedAt} : {}),
        ...(infoPage._updatedAt ? {modifiedTime: infoPage._updatedAt} : {}),
        ...(author ? {
          authors: [`${author.firstName} ${author.lastName}`.trim()],
        } : {}),
      },
      twitter: {
        title: infoPage.seo?.twitterTitle ?? infoPage.seo?.ogTitle ?? title,
        description: infoPage.seo?.twitterDescription ?? infoPage.seo?.ogDescription ?? description,
        images: ogImage ? [ogImage, ...previousImages] : previousImages,
      },
    }
  }

  // Handle regular page type
  const title = (pageData as any).name || (pageData as any).title || 'Page'
  const description = (pageData as any).heading || (pageData as any).description || ''

  return {
    title,
    description,
  }
}

export default async function Page(props: Props) {
  const params = await props.params
  const [{data: pageData}] = await Promise.all([
    sanityFetch({query: getPageOrInfoPageQuery, params}),
  ])

  if (!pageData?._id) {
    return notFound()
  }

  // Render themedSlotsPage type
  if (pageData._type === 'themedSlotsPage') {
    const themedPage = pageData as any

    // Skip hidden pages
    if (themedPage.hidden) {
      return notFound()
    }

    // Fetch all games from Sanity
    const {data: allGames} = await sanityFetch({
      query: allGamesQuery,
      stega: false,
    })

    // Filter games based on criteria
    const filteredGames = allGames ? filterGames(allGames, themedPage.filterType, themedPage.filterValue) : []

    // Transform to SlotGame format
    const games: SlotGame[] = filteredGames.map((game: SanityGame) => transformSanityGameToSlotGame(game))
    const totalGamesCount = games.length

    const featuredCasino = themedPage.featuredCasino || null
    const author = themedPage.author || null

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
                  {themedPage.heading}
                </h1>
                {themedPage.description && (
                  <p className="text-lg text-gray-600">
                    {themedPage.description}
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
                        <Image
                          src={author.picture.asset.url}
                          alt={`${author.firstName} ${author.lastName}`}
                          width={64}
                          height={64}
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

            {games.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 font-mono">Nu există jocuri pentru acest filtru momentan.</p>
              </div>
            ) : (
              <ThemedGamesGrid
                games={games}
                singleBase={SINGLE_BASE}
              />
            )}
          </div>
        </div>

        {/* Content Sections */}
        <ContentSections content={themedPage.content || undefined} />

        {/* Responsible Gaming Disclaimer */}
        <ResponsibleGamingDisclaimer />

        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: themedPage.heading,
              description: themedPage.description || `Colecție de ${themedPage.title} disponibile pentru joc demo pe Cazinou.io`,
              numberOfItems: totalGamesCount,
              itemListElement: games.slice(0, 20).map((game, index) => ({
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

  // Render infoPage type
  if (pageData._type === 'infoPage') {
    const infoPage = pageData as any
    const author = infoPage.author

    // Generate structured data for info pages
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cazinou.io'
    const pageUrl = `${siteUrl}/${params.slug}/`

    const articleSchema = schemaHelpers.article({
      headline: infoPage.title || infoPage.heading,
      url: pageUrl,
      datePublished: infoPage._createdAt,
      dateModified: infoPage._updatedAt,
      author: author ? {
        name: `${author.firstName} ${author.lastName}`,
        url: author.slug?.current ? `${siteUrl}/author/${author.slug.current}/` : undefined,
      } : undefined,
      description: infoPage.excerpt,
    })

    const breadcrumbSchema = schemaHelpers.breadcrumb([
      { name: 'Acasă', url: `${siteUrl}/` },
      { name: infoPage.title || infoPage.heading, url: pageUrl },
    ])

    return (
      <div className="bg-white">
        <JsonLd data={articleSchema} />
        <JsonLd data={breadcrumbSchema} />
        {/* Hero Section */}
        <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
          <div className="container pt-8 pb-6 lg:pb-8">
            <header className="relative grid gap-6 border-b border-gray-100 pb-10">
              <div className="max-w-3xl grid gap-4">
                <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                  {infoPage.heading}
                </h1>
                {infoPage.subheading && (
                  <p className="text-lg text-gray-600">{infoPage.subheading}</p>
                )}
              </div>

              {/* Author Info & Metadata */}
              {author && (
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  {/* Author Section */}
                  <div className="flex items-center gap-4">
                    {/* Author Avatar */}
                    {author.picture?.asset?.url ? (
                      <Link href={`/autori/${author.slug?.current}`} className="flex-shrink-0">
                        <Image
                          src={author.picture.asset.url}
                          alt={author.picture.alt || `${author.firstName} ${author.lastName}`}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover aspect-square ring-2 ring-gray-100 hover:ring-brand transition-all"
                          placeholder={author.picture.asset.metadata?.lqip ? 'blur' : undefined}
                          blurDataURL={author.picture.asset.metadata?.lqip}
                        />
                      </Link>
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
                        <Link
                          href={`/autori/${author.slug?.current}`}
                          className="font-semibold text-gray-900 hover:text-brand transition-colors"
                        >
                          {author.firstName} {author.lastName}
                        </Link>
                      </div>
                      {author.role && (
                        <p className="text-sm text-gray-600">{author.role}</p>
                      )}
                      {infoPage.publishedAt && (
                        <p className="text-xs text-gray-500">
                          Ultima actualizare:{' '}
                          <DateComponent dateString={infoPage.publishedAt} />
                        </p>
                      )}
                      {/* Social Media Icons */}
                      {author.socialMedia && (
                        <div className="flex items-center gap-2 mt-1">
                          {author.socialMedia.linkedin && (
                            <a
                              href={author.socialMedia.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                              aria-label="LinkedIn"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                            </a>
                          )}
                          {author.socialMedia.twitter && (
                            <a
                              href={author.socialMedia.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                              aria-label="Twitter/X"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </a>
                          )}
                          {author.socialMedia.facebook && (
                            <a
                              href={author.socialMedia.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                              aria-label="Facebook"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            </a>
                          )}
                          {author.socialMedia.instagram && (
                            <a
                              href={author.socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                              aria-label="Instagram"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          )}
                          {author.socialMedia.website && (
                            <a
                              href={author.socialMedia.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                              aria-label="Website"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </header>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-12 lg:pb-24">
          {infoPage.content && <ContentSections content={infoPage.content} author={infoPage.author} />}

          {/* 18+ Disclaimer */}
          <ResponsibleGamingDisclaimer />
        </div>
      </div>
    )
  }

  // Render regular page type
  return (
    <div className="my-12 lg:my-24">
      <Head>
        <title>{pageData.heading}</title>
      </Head>
      <div className="">
        <div className="container">
          <div className="pb-6 border-b border-gray-100">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl">
                {pageData.heading}
              </h2>
              <p className="mt-4 text-base lg:text-lg leading-relaxed text-gray-600 uppercase font-light">
                {pageData.subheading}
              </p>
            </div>
          </div>
        </div>
      </div>
      <PageBuilderPage page={pageData as GetPageQueryResult} />
    </div>
  )
}
