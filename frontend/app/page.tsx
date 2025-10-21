import type {Metadata, ResolvingMetadata} from 'next'
import {PortableText} from '@portabletext/react'

import {ContentSections} from '@/app/components/ContentSections'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

/**
 * Generate metadata for the homepage
 */
export async function generateMetadata(
  props: {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const {data: homePageData} = await sanityFetch({
    query: homePageQuery,
    stega: false,
  })

  if (!homePageData) {
    return {
      title: 'Cazinou Online România',
      description: 'Descoperă cele mai bune cazinouri online din România',
    }
  }

  const title = homePageData.seo?.metaTitle || 'Cazinou Online România'
  const description =
    homePageData.seo?.metaDescription || 'Descoperă cele mai bune cazinouri online din România'
  const ogImageSource = homePageData.seo?.ogImage
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(ogImageSource)

  return {
    title,
    description,
    openGraph: {
      title: homePageData.seo?.ogTitle ?? title,
      description: homePageData.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    twitter: {
      title: homePageData.seo?.twitterTitle ?? homePageData.seo?.ogTitle ?? title,
      description:
        homePageData.seo?.twitterDescription ?? homePageData.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  }
}

export default async function HomePage() {
  const {data: homePageData} = await sanityFetch({
    query: homePageQuery,
  })

  if (!homePageData) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-gray-900">Bine ați venit!</h1>
          <p className="mt-4 text-lg text-gray-600">
            Homepage-ul este în curs de configurare. Mergi la Sanity Studio și creează un document
            de tip &quot;Home Page&quot; pentru a începe.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Banner Section */}
      {homePageData.heroBanner && (
        <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white"></div>
          <div className="container relative py-12 lg:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="prose prose-lg lg:prose-xl max-w-none text-center">
                <PortableText
                  value={homePageData.heroBanner}
                  components={{
                    block: {
                      h1: ({children}) => (
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                          {children}
                        </h1>
                      ),
                      h2: ({children}) => (
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-mono">
                          {children}
                        </h2>
                      ),
                      normal: ({children}) => (
                        <p className="text-lg text-gray-700 lg:text-xl leading-relaxed">
                          {children}
                        </p>
                      ),
                    },
                    marks: {
                      link: ({value, children}) => {
                        const target = value?.openInNewTab ? '_blank' : undefined
                        const rel = value?.openInNewTab ? 'noopener noreferrer' : undefined
                        return (
                          <a
                            href={value?.href}
                            target={target}
                            rel={rel}
                            className="text-orange-600 underline decoration-2 underline-offset-4 hover:text-orange-700 transition-colors"
                          >
                            {children}
                          </a>
                        )
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="pb-12 lg:pb-24">
        {homePageData.content && <ContentSections content={homePageData.content} />}
      </div>
    </div>
  )
}
