import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ContentSections} from '@/app/components/ContentSections'
import {JsonLd} from '@/app/components/JsonLd'
import {generateOrganizationGraph} from '@/lib/organization'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageOrInfoPageQuery} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {generateSEO} from '@/sanity/lib/seo'

const SLUG = 'metode-de-plata'

export async function generateMetadata(): Promise<Metadata> {
  const {data: pageData} = await sanityFetch({
    query: getPageOrInfoPageQuery,
    params: {slug: SLUG},
    stega: false,
  })

  if (!pageData?._id) {
    return {}
  }

  if (pageData._type === 'infoPage') {
    return generateSEO({
      title: pageData.seo?.metaTitle || pageData.title,
      description: pageData.seo?.metaDescription || pageData.excerpt || '',
      ogTitle: pageData.seo?.ogTitle || undefined,
      ogDescription: pageData.seo?.ogDescription || undefined,
      ogImage: pageData.seo?.ogImage,
      canonicalUrl: 'https://cazinou.io/metode-de-plata/',
    })
  }

  const title = (pageData as any).name || (pageData as any).title || 'Metode de Plată'

  return {
    title,
  }
}

export default async function MetodeDePlataPage() {
  const {data: pageData} = await sanityFetch({
    query: getPageOrInfoPageQuery,
    params: {slug: SLUG},
  })

  if (!pageData?._id) {
    notFound()
  }

  // Generate Organization + WebSite schema graph
  const organizationGraph = generateOrganizationGraph()

  // Handle infoPage type
  if (pageData._type === 'infoPage') {
    return (
      <div className="container mx-auto px-4 py-8">
        <JsonLd data={organizationGraph} />
        {pageData.heading && (
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {pageData.heading}
          </h1>
        )}

        {pageData.excerpt && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {pageData.excerpt}
          </p>
        )}

        {pageData.content && pageData.content.length > 0 && (
          <div className="prose prose-lg max-w-none">
            <ContentSections content={pageData.content} pageSlug="metode-de-plata" />
          </div>
        )}
      </div>
    )
  }

  // Handle page type (if any)
  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={organizationGraph} />
      <h1 className="text-4xl font-bold">{(pageData as any).name || (pageData as any).title || 'Metode de Plată'}</h1>
    </div>
  )
}
