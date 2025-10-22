import { sanityFetch } from '@/sanity/lib/live'
import { lotoQuery, lotoSlugsQuery } from '@/sanity/lib/queries'
import { LotoQueryResult } from '@/sanity.types'
import CustomPortableText from '@/app/components/PortableText'
import { Metadata } from 'next'
import { generateSEO } from '@/sanity/lib/seo'
import { notFound } from 'next/navigation'
import Image from 'next/image'

type Props = {
  params: Promise<{ slug: string }>
}

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
  const { data: loto } = await sanityFetch({
    query: lotoQuery,
    params: { slug },
    stega: false,
  })

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
  const { data: loto } = await sanityFetch({
    query: lotoQuery,
    params: { slug },
  })

  if (!loto) {
    notFound()
  }

  return (
    <article className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="mb-8">
        {loto.heading && (
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {loto.heading}
          </h1>
        )}

        {loto.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed">
            {loto.excerpt}
          </p>
        )}

        {/* Author & Date */}
        {(loto.author || loto.publishedAt) && (
          <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
            {loto.author && (
              <div className="flex items-center gap-2">
                {loto.author.picture && (
                  <Image
                    src={loto.author.picture as any}
                    alt={`${loto.author.firstName} ${loto.author.lastName}`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <span className="font-medium">
                  {loto.author.firstName} {loto.author.lastName}
                </span>
              </div>
            )}
            {loto.publishedAt && (
              <time dateTime={loto.publishedAt}>
                {new Date(loto.publishedAt).toLocaleDateString('ro-RO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      {loto.content && loto.content.length > 0 && (
        <div className="prose prose-lg max-w-none">
          <CustomPortableText value={loto.content as any} />
        </div>
      )}

      {/* Optional: Display lottery results widget if apiSlug is available */}
      {loto.apiSlug && (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Rezultate Recente</h2>
          <p className="text-gray-600">
            Widget pentru rezultate {loto.title} (API: {loto.apiSlug})
          </p>
          {/* TODO: Integrate with /api/lotto/{game} endpoint */}
        </div>
      )}
    </article>
  )
}
