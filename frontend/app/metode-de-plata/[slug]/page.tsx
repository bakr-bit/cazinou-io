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
      ogTitle: pageData.seo?.ogTitle || undefined,
      ogDescription: pageData.seo?.ogDescription || undefined,
      ogImage: pageData.seo?.ogImage,
    })
  }

  const title = (pageData as any).name || (pageData as any).title || 'Page'

  return {
    title,
  }
}

export default async function MetodeNestedPage({params}: Props) {
  const {slug} = await params
  const fullSlug = `metode-de-plata/${slug}`

  const {data: pageData} = await sanityFetch({
    query: getPageOrInfoPageQuery,
    params: {slug: fullSlug},
  })

  if (!pageData?._id) {
    notFound()
  }

  // Handle infoPage type
  if (pageData._type === 'infoPage') {
    const author = pageData.author

    return (
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
          <div className="container pt-8 pb-6 lg:pb-8">
            <header className="relative grid gap-6 border-b border-gray-100 pb-10">
              <div className="max-w-3xl grid gap-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand font-mono">
                  Metode de Plată
                </p>
                <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                  {pageData.heading}
                </h1>
                {pageData.subheading && (
                  <p className="text-lg text-gray-600">{pageData.subheading}</p>
                )}
              </div>

              {/* Author Info */}
              {author && (
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-4">
                    {/* Author Avatar */}
                    {author.picture?.asset?.url ? (
                      <div className="flex-shrink-0">
                        <img
                          src={author.picture.asset.url}
                          alt={`${author.firstName} ${author.lastName}`}
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
            </header>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-12 lg:pb-24">
          {pageData.content && pageData.content.length > 0 && (
            <ContentSections content={pageData.content} />
          )}
        </div>
      </div>
    )
  }

  // Handle page type (if any)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold">{(pageData as any).name || (pageData as any).title || 'Page'}</h1>
    </div>
  )
}
