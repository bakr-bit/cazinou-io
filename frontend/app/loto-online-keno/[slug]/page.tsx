import { sanityFetch } from '@/sanity/lib/live'
import { lotoQuery, lotoSlugsQuery } from '@/sanity/lib/queries'
import { LotoQueryResult } from '@/sanity.types'
import CustomPortableText from '@/app/components/PortableText'
import { ContentSections } from '@/app/components/ContentSections'
import { Metadata } from 'next'
import { generateSEO } from '@/sanity/lib/seo'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { cache } from 'react'

type Props = {
  params: Promise<{ slug: string }>
}

// Add ISR revalidation
export const revalidate = 3600

// Cache loto query to prevent duplicates
const getLoto = cache(async (slug: string) => {
  const { data } = await sanityFetch({
    query: lotoQuery,
    params: { slug },
    stega: false,
  })
  return data
})

export async function generateStaticParams() {
  const { data: lotoPages } = await sanityFetch({
    query: lotoSlugsQuery,
    perspective: 'published',
    stega: false,
  })

  return lotoPages?.map((page) => ({
    slug: page.slug,
  })) || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loto = await getLoto(slug)

  if (!loto) {
    return {
      title: 'Loto Game Not Found',
    }
  }

  return generateSEO({
    title: loto.seo?.metaTitle || loto.title,
    description: loto.seo?.metaDescription || loto.excerpt || '',
    ogTitle: loto.seo?.ogTitle || undefined,
    ogDescription: loto.seo?.ogDescription || undefined,
    ogImage: loto.seo?.ogImage,
    canonicalUrl: `https://cazinou.io/loto-online-keno/${slug}/`,
    article: {
      publishedTime: loto.publishedAt || undefined,
      modifiedTime: loto.seo?.modifiedAt || undefined,
      authors: loto.author
        ? [`${loto.author.firstName} ${loto.author.lastName}`.trim()]
        : undefined,
    },
  })
}

export default async function LotoGamePage({ params }: Props) {
  const { slug } = await params
  const loto = await getLoto(slug)

  if (!loto) {
    notFound()
  }

  const publishedDate = loto.publishedAt ? new Date(loto.publishedAt) : null
  const currentYear = new Date().getFullYear()

  return (
    <div className="bg-white">
      {/* Hero Section with Decorative Background */}
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        {/* Banner Image with Low Opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: 'url(/images/banner/loto-online-banner.webp)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>

        <div className="container relative pt-8 pb-6 lg:pb-8">
          <header className="grid gap-6 border-b border-gray-100 pb-10">
            {/* Breadcrumb / Category */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand font-mono">
                Loto Online
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-mono text-gray-500">{loto.title}</span>
            </div>

            {/* Main Heading */}
            <div>
              {loto.heading && (() => {
                // Extract year if present at the end and highlight it
                const yearMatch = loto.heading.match(/^(.+?)(\s+)(\d{4})$/)

                if (yearMatch) {
                  return (
                    <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                      {yearMatch[1]}{yearMatch[2]}<span className="text-orange-500">{yearMatch[3]}</span>
                    </h1>
                  )
                }

                return (
                  <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                    {loto.heading}
                  </h1>
                )
              })()}
            </div>

            {/* Author & Metadata */}
            <div className="flex flex-wrap items-center gap-6">
              {loto.author && (
                <div className="flex items-center gap-3">
                  {loto.author.picture?.asset?.url && (
                    <Image
                      src={loto.author.picture.asset.url}
                      alt={loto.author.picture.alt || `${loto.author.firstName} ${loto.author.lastName}`}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover aspect-square ring-2 ring-gray-100"
                      placeholder={loto.author.picture.asset.metadata?.lqip ? 'blur' : undefined}
                      blurDataURL={loto.author.picture.asset.metadata?.lqip || undefined}
                    />
                  )}
                  <div className="flex flex-col gap-1 font-mono">
                    <div className="text-sm font-semibold text-gray-900">
                      {loto.author.firstName} {loto.author.lastName}
                    </div>
                    {loto.author.role && (
                      <div className="text-xs text-gray-500">{loto.author.role}</div>
                    )}
                  </div>
                </div>
              )}

              {publishedDate && (
                <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={loto.publishedAt || undefined}>
                    {publishedDate.toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container pb-12 lg:pb-24">
        {/* Main Content Sections */}
        {loto.content && loto.content.length > 0 && (
          <div className="pt-12">
            <ContentSections content={loto.content} author={loto.author} pageSlug={slug} />
          </div>
        )}

        {/* Optional: Display lottery results widget if apiSlug is available */}
        {loto.apiSlug && (
          <div className="mt-12">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-mono">
                Rezultate Recente
              </h2>
              <p className="text-gray-600 font-mono">
                Widget pentru rezultate {loto.title} (API: {loto.apiSlug})
              </p>
              {/* TODO: Integrate with /api/lotto/{game} endpoint */}
            </div>
          </div>
        )}

        {/* Responsible Gaming Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600 font-mono">
              Joacă responsabil. Participarea la jocuri de noroc poate crea dependență.
              Interzis persoanelor sub 18 ani.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
