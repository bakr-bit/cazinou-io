import type {Metadata} from 'next'

import {ContentSections} from '@/app/components/ContentSections'
import {ReviewCard} from '@/app/components/ReviewCard'
import {ResponsibleGamingDisclaimer} from '@/app/components/ResponsibleGamingDisclaimer'
import {sanityFetch} from '@/sanity/lib/live'
import {allCasinoReviewsQuery, reviewsPageQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({
    query: reviewsPageQuery,
    stega: false,
  })

  const reviewsPage = data as any

  if (!reviewsPage) {
    return {
      title: 'Recenzii Cazinouri Online',
      description: 'Citește recenziile noastre detaliate despre cele mai bune cazinouri online din România',
    }
  }

  const title = reviewsPage.seo?.metaTitle || reviewsPage.title || 'Recenzii Cazinouri Online'
  const description =
    reviewsPage.seo?.metaDescription ||
    'Citește recenziile noastre detaliate despre cele mai bune cazinouri online din România'
  const ogImageSource = reviewsPage.seo?.ogImage
  const ogImage = resolveOpenGraphImage(ogImageSource)

  return {
    title,
    description,
    openGraph: {
      title: reviewsPage.seo?.ogTitle ?? title,
      description: reviewsPage.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function RecenziiPage() {
  const [{data: reviewsPageData}, {data: reviews}] = await Promise.all([
    sanityFetch({query: reviewsPageQuery}),
    sanityFetch({query: allCasinoReviewsQuery}),
  ])

  const reviewsPage = reviewsPageData as any
  const casinoReviews = (reviews as any[]) || []

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
        <div className="container pt-8 pb-6 lg:pb-8">
          <header className="relative border-b border-gray-100 pb-10">
            <div className="max-w-3xl grid gap-4">
              <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                {reviewsPage?.heading || 'Recenzii Cazinouri Online'}
              </h1>
              {reviewsPage?.subheading && (
                <p className="text-lg text-gray-600 font-mono">{reviewsPage.subheading}</p>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* Casino Reviews Grid */}
      {casinoReviews.length > 0 && (
        <section className="container py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casinoReviews.map((review: any) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* No Reviews Message */}
      {casinoReviews.length === 0 && (
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900">Nu există recenzii încă</h2>
            <p className="mt-4 text-lg text-gray-600">
              Adaugă recenzii de cazinouri în Sanity Studio pentru a le afișa aici.
            </p>
          </div>
        </div>
      )}

      {/* Text Content Section */}
      {reviewsPage?.content && (
        <div className="pb-12 lg:pb-24">
          <ContentSections content={reviewsPage.content} />
        </div>
      )}

      {/* Responsible Gaming Disclaimer */}
      <ResponsibleGamingDisclaimer />
    </div>
  )
}
