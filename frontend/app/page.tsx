import type {Metadata, ResolvingMetadata} from 'next'
import {cache} from 'react'
import {PortableText} from '@portabletext/react'
import Image from 'next/image'

import {ContentSections} from '@/app/components/ContentSections'
import {ResponsibleGamingDisclaimer} from '@/app/components/ResponsibleGamingDisclaimer'
import {JsonLd} from '@/app/components/JsonLd'
import {generateHomepageGraph} from '@/lib/organization'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

// Revalidate every hour - enables ISR for faster TTFB
export const revalidate = 3600

// Cache the homepage data fetch to deduplicate between generateMetadata and page component
const getHomePageData = cache(async () => {
  const {data} = await sanityFetch({
    query: homePageQuery,
    stega: false,
  })
  return data
})

/**
 * Generate metadata for the homepage
 */
export async function generateMetadata(
  props: {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const homePageData = await getHomePageData()

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
      type: 'article',
      ...(homePageData.publishedAt ? {publishedTime: homePageData.publishedAt} : {}),
      ...(homePageData._updatedAt ? {modifiedTime: homePageData._updatedAt} : {}),
    },
    twitter: {
      title: homePageData.seo?.twitterTitle ?? homePageData.seo?.ogTitle ?? title,
      description:
        homePageData.seo?.twitterDescription ?? homePageData.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    alternates: {
      canonical: 'https://cazinou.io/',
    },
  }
}

export default async function HomePage() {
  const homePageData = await getHomePageData()

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

  // Extract FAQs from content sections if they exist
  const faqs: Array<{question: string; answer: string}> = []
  if (homePageData.content) {
    for (const section of homePageData.content) {
      if (section._type === 'faqSection' && section.faqs) {
        for (const faq of section.faqs) {
          if (faq.question && faq.answer) {
            faqs.push({question: faq.question, answer: faq.answer})
          }
        }
      }
    }
  }

  // Generate Homepage schema with Organization, WebSite, Person, and FAQ
  const homepageGraph = generateHomepageGraph({faqs})

  return (
    <div className="bg-white">
      <JsonLd data={homepageGraph} />
      {/* Update Announcement Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container py-3 px-4">
          <div className="flex items-center justify-center gap-2 text-center">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="font-semibold font-mono text-sm sm:text-base">
              Site actualizat! Explorează noul cazinou.io!
            </p>
          </div>
        </div>
      </div>

      {/* Hero Banner Section - Always render image for faster LCP */}
      <div className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[400px]">
        <Image
          src="/images/hero-banner-hp.webp"
          alt="Cazinou Online România - Hero Banner"
          fill
          priority
          fetchPriority="high"
          quality={75}
          className="object-cover object-center"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACwAgCdASoUAAsAP3Ggxli0q6gjsAgCkC4JaQAAeyAA/u14qu0cswuIgAA="
        />
        <div className="absolute inset-0 bg-white/70"></div>
        <div className="container relative py-12 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="prose prose-lg lg:prose-xl max-w-none text-center">
              {homePageData.heroBanner && (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="pb-12 lg:pb-24">
        {homePageData.content && <ContentSections content={homePageData.content} />}
      </div>

      {/* Responsible Gaming Disclaimer */}
      <ResponsibleGamingDisclaimer />
    </div>
  )
}
