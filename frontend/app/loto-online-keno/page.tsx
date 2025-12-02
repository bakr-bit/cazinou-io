import { sanityFetch } from '@/sanity/lib/live'
import { lotoPageSettingsQuery } from '@/sanity/lib/queries'
import { LotoPageSettingsQueryResult } from '@/sanity.types'
import CustomPortableText from '@/app/components/PortableText'
import { FeaturedCasinoBanner } from '@/app/components/FeaturedCasinoBanner'
import { Metadata } from 'next'
import { generateSEO } from '@/sanity/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({
    query: lotoPageSettingsQuery,
    stega: false,
  })

  if (!data) {
    return {
      title: 'Loto Online',
      description: 'Joacă loto online la cele mai bune cazinouri din România',
    }
  }

  return generateSEO({
    title: data.seo?.metaTitle || data.heading || 'Loto Online',
    description: data.seo?.metaDescription || data.description || '',
    ogTitle: data.seo?.ogTitle || undefined,
    ogDescription: data.seo?.ogDescription || undefined,
    ogImage: data.seo?.ogImage,
    canonicalUrl: 'https://cazinou.io/loto-online-keno/',
  })
}

export default async function LotoOnlinePage() {
  const { data: pageSettings } = await sanityFetch({
    query: lotoPageSettingsQuery,
  })

  if (!pageSettings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Loto Online</h1>
        <p className="mt-4 text-gray-600">Conținut în curs de configurare...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      {pageSettings.heading && (
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {pageSettings.heading}
        </h1>
      )}

      {pageSettings.description && (
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          {pageSettings.description}
        </p>
      )}

      {/* Featured Casino Banner */}
      {pageSettings.featuredCasino && (
        <div className="mb-12">
          <FeaturedCasinoBanner casino={pageSettings.featuredCasino as any} />
        </div>
      )}

      {/* Main Content */}
      {pageSettings.content && pageSettings.content.length > 0 && (
        <div className="prose prose-lg max-w-none">
          <CustomPortableText value={pageSettings.content as any} />
        </div>
      )}
    </div>
  )
}
