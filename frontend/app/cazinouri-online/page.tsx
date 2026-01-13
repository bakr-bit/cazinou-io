import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {ContentSections} from '@/app/components/ContentSections'
import {JsonLd} from '@/app/components/JsonLd'
import {generateOrganizationGraph} from '@/lib/organization'
import {sanityFetch} from '@/sanity/lib/live'
import {infoPageBySlugQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

const PAGE_SLUG = 'cazinouri-online'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({
    query: infoPageBySlugQuery,
    params: {slug: PAGE_SLUG},
    stega: false,
  })

  const infoPage = data as any

  if (!infoPage?._id) {
    return {}
  }

  const title = infoPage.seo?.metaTitle ?? infoPage.title ?? infoPage.heading
  const description = infoPage.seo?.metaDescription ?? infoPage.excerpt
  const ogImageSource = infoPage.seo?.ogImage
  const ogImage = resolveOpenGraphImage(ogImageSource)

  return {
    title,
    description,
    openGraph: {
      title: infoPage.seo?.ogTitle ?? title,
      description: infoPage.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      title: infoPage.seo?.twitterTitle ?? infoPage.seo?.ogTitle ?? title,
      description: infoPage.seo?.twitterDescription ?? infoPage.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: 'https://cazinou.io/cazinouri-online/',
    },
  }
}

export default async function CazinoOnlinePage() {
  const [{data}] = await Promise.all([
    sanityFetch({query: infoPageBySlugQuery, params: {slug: PAGE_SLUG}}),
  ])

  const infoPage = data as any

  if (!infoPage?._id) {
    return notFound()
  }

  // Generate Organization + WebSite schema graph
  const organizationGraph = generateOrganizationGraph()

  return (
    <div className="bg-white">
      <JsonLd data={organizationGraph} />
      {/* Hero Section */}
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
        <div className="container pt-8 pb-6 lg:pb-8">
          <header className="relative border-b border-gray-100 pb-10">
            <div className="max-w-3xl grid gap-4">
              <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                {infoPage.heading}
              </h1>
              {infoPage.subheading && (
                <p className="text-lg text-gray-600 font-mono">{infoPage.subheading}</p>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-12 lg:pb-24">
        {infoPage.content && <ContentSections content={infoPage.content} pageSlug="cazinouri-online" />}
      </div>
    </div>
  )
}
