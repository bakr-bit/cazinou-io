import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {ContentSections} from '@/app/components/ContentSections'
import {sanityFetch} from '@/sanity/lib/live'
import {getPageOrInfoPageQuery, pagesSlugs} from '@/sanity/lib/queries'
import {GetPageQueryResult} from '@/sanity.types'
import {generateSEO} from '@/sanity/lib/seo'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate static params for metode-de-plata nested pages
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: pagesSlugs,
    perspective: 'published',
    stega: false,
  })

  // Filter for metode-de-plata nested pages
  const metodePages = data?.filter((page) =>
    page.slug?.startsWith('metode-de-plata/') && page.slug !== 'metode-de-plata'
  ) || []

  return metodePages.map((page) => ({
    slug: page.slug?.replace('metode-de-plata/', ''),
  }))
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const fullSlug = `metode-de-plata/${slug}`

  const {data: pageData} = await sanityFetch({
    query: getPageOrInfoPageQuery,
    params: {slug: fullSlug},
    stega: false,
  })

  if (!pageData?._id) {
    return {}
  }

  if (pageData._type === 'infoPage') {
    return generateSEO({
      title: pageData.seo?.metaTitle || pageData.title,
      description: pageData.seo?.metaDescription || pageData.excerpt || '',
      ogTitle: pageData.seo?.ogTitle,
      ogDescription: pageData.seo?.ogDescription,
      ogImage: pageData.seo?.ogImage,
    })
  }

  return {
    title: pageData.name || 'Page',
  }
}

export default async function MetodeNestedPage({params}: Props) {
  const {slug} = await params
  const fullSlug = `metode-de-plata/${slug}`

  const {data: pageData} = await sanityFetch<GetPageQueryResult>({
    query: getPageOrInfoPageQuery,
    params: {slug: fullSlug},
  })

  if (!pageData?._id) {
    notFound()
  }

  // Handle infoPage type
  if (pageData._type === 'infoPage') {
    return (
      <div className="container mx-auto px-4 py-8">
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
            <ContentSections sections={pageData.content} />
          </div>
        )}
      </div>
    )
  }

  // Handle page type (if any)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">{pageData.name || 'Page'}</h1>
    </div>
  )
}
