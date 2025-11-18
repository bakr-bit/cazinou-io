import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'
import {cache} from 'react'

import DateComponent from '@/app/components/Date'
import CustomPortableText from '@/app/components/PortableText'
import ReviewFAQ from '@/app/components/review/ReviewFAQ'
import {sanityFetch} from '@/sanity/lib/live'
import {reviewBySlugQuery, reviewSlugsQuery} from '@/sanity/lib/queries'
import {generateCompleteReviewJsonLd} from '@/sanity/lib/seo'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

// Add revalidation for ISR (1 hour)
export const revalidate = 3600

// Cache the review query to prevent duplicate fetches
const getReview = cache(async (slug: string) => {
  const {data} = await sanityFetch({
    query: reviewBySlugQuery,
    params: {slug},
    stega: false,
  })
  return data
})

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: reviewSlugsQuery,
    perspective: 'published',
    stega: false,
  })

  return data ?? []
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const review = await getReview(params.slug) as any

  if (!review?._id) {
    return {}
  }

  const casino = review.casino
  const fallbackTitle = `${casino?.name ?? 'Casino'} Recenzie 2025`
  const title = review.seo?.metaTitle ?? review.title ?? fallbackTitle
  const description = review.seo?.metaDescription ?? review.excerpt ?? review.tldr
  const ogImageSource = review.seo?.ogImage ?? casino?.logo
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(ogImageSource)

  return {
    title,
    description,
    openGraph: {
      title: review.seo?.ogTitle ?? title,
      description: review.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    twitter: {
      title: review.seo?.twitterTitle ?? review.seo?.ogTitle ?? title,
      description: review.seo?.twitterDescription ?? review.seo?.ogDescription ?? description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  }
}

export default async function ReviewPage(props: Props) {
  const params = await props.params
  const review = await getReview(params.slug) as any

  if (!review?._id || !review.casino || !review.author) {
    return notFound()
  }

  const casino = review.casino
  const author = review.author
  const reviewContent = review.content as PortableTextBlock[] | undefined

  // Generate JSON-LD structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cazinou.io'
  const jsonLd = generateCompleteReviewJsonLd({
    review,
    casino,
    author,
    siteUrl,
  })

  const formatBoolean = (value: boolean | undefined | null) => {
    if (value === undefined || value === null) return undefined
    return value ? 'Da' : 'Nu'
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
    )
  }

  const getPaymentIcon = (method: string) => {
    const methodLower = method.toLowerCase()

    // Visa
    if (methodLower.includes('visa')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M211.328,184.445l-23.465,144.208h37.542l23.468-144.208H211.328z M156.276,184.445l-35.794,99.185l-4.234-21.358l0.003,0.007l-0.933-4.787c-4.332-9.336-14.365-27.08-33.31-42.223c-5.601-4.476-11.247-8.296-16.705-11.559l32.531,124.943h39.116l59.733-144.208H156.276z M302.797,224.48c0-16.304,36.563-14.209,52.629-5.356l5.357-30.972c0,0-16.534-6.288-33.768-6.288c-18.632,0-62.875,8.148-62.875,47.739c0,37.26,51.928,37.723,51.928,57.285c0,19.562-46.574,16.066-61.944,3.726l-5.586,32.373c0,0,16.763,8.148,42.382,8.148c25.616,0,64.272-13.271,64.272-49.37C355.192,244.272,302.797,240.78,302.797,224.48z M455.997,184.445h-30.185c-13.938,0-17.332,10.747-17.332,10.747l-55.988,133.461h39.131l7.828-21.419h47.728l4.403,21.419h34.472L455.997,184.445z M410.27,277.641l19.728-53.966l11.098,53.966H410.27z" fill="#005BAC"/>
          <path d="M104.132,198.022c0,0-1.554-13.015-18.144-13.015H25.715l-0.706,2.446c0,0,28.972,5.906,56.767,28.033c26.562,21.148,35.227,47.51,35.227,47.51L104.132,198.022z" fill="#F6AC1D"/>
        </svg>
      )
    }

    // Mastercard
    if (methodLower.includes('mastercard') || methodLower.includes('master card')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 48 32" fill="none">
          <rect width="48" height="32" rx="4" fill="#252525"/>
          <circle cx="18" cy="16" r="8" fill="#EB001B"/>
          <circle cx="30" cy="16" r="8" fill="#FF5F00"/>
          <path d="M24 9.33c-1.67 1.44-2.73 3.56-2.73 5.95s1.06 4.51 2.73 5.95c1.67-1.44 2.73-3.56 2.73-5.95s-1.06-4.51-2.73-5.95z" fill="#F79E1B"/>
        </svg>
      )
    }

    // PayPal
    if (methodLower.includes('paypal')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.633h7.316c2.693 0 4.535 1.417 4.535 3.49 0 2.693-2.1 4.535-5.18 4.535H9.65a.77.77 0 0 0-.76.633l-.633 3.608-.35 2.063a.64.64 0 0 1-.633.633l-1.24.633zm12.54-6.93c0 2.576-2.1 4.418-5.18 4.418h-2.725a.77.77 0 0 0-.76.633l-.633 3.608-.35 2.063a.64.64 0 0 1-.633.633h-4.418a.641.641 0 0 1-.633-.74l3.107-16.877a.77.77 0 0 1 .76-.633h7.316c2.576 0 4.152 1.3 4.152 3.373z" fill="#003087"/>
          <path d="M19.616 14.407c0 2.576-2.1 4.418-5.18 4.418h-2.725a.77.77 0 0 0-.76.633l-.633 3.608-.35 2.063a.64.64 0 0 1-.633.633H4.917a.641.641 0 0 1-.633-.74l3.107-16.877a.77.77 0 0 1 .76-.633h7.316c2.576 0 4.152 1.3 4.152 3.373z" fill="#0070E0"/>
        </svg>
      )
    }

    // Bitcoin/Crypto
    if (methodLower.includes('bitcoin') || methodLower.includes('crypto') || methodLower.includes('btc')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#F7931A"/>
          <path d="M16.2 10.47c.2-1.4-.85-2.15-2.3-2.65l.47-1.88-1.15-.29-.46 1.83c-.3-.08-.61-.15-.92-.22l.46-1.85-1.15-.29-.47 1.88c-.25-.06-.5-.12-.74-.18l-.01-.01-1.58-.4-.3 1.23s.85.2.83.21c.46.12.55.42.53.67l-.53 2.15c.03.01.07.02.12.04l-.12-.03-.75 3.01c-.06.14-.2.35-.51.27.01.02-.83-.21-.83-.21l-.57 1.32 1.49.37c.28.07.55.14.82.21l-.47 1.91 1.15.29.47-1.89c.31.08.62.16.91.23l-.47 1.88 1.15.29.47-1.9c1.95.37 3.42.22 4.03-1.55.5-1.42-.02-2.24-1.05-2.78.75-.17 1.31-.67 1.46-1.69zm-2.61 3.66c-.35 1.43-2.75.66-3.53.46l.63-2.52c.78.2 3.27.59 2.9 2.06zm.36-3.68c-.32 1.3-2.3.64-2.95.48l.57-2.29c.65.16 2.72.46 2.38 1.81z" fill="white"/>
        </svg>
      )
    }

    // Bank Transfer
    if (methodLower.includes('bank') || methodLower.includes('transfer') || methodLower.includes('wire')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.83-3.13 9.37-7 10.5-3.87-1.13-7-5.67-7-10.5V6.3l7-3.12z" className="text-gray-600"/>
          <path d="M7 9h2v6H7zm4-2h2v8h-2zm4 4h2v4h-2z" className="text-gray-600"/>
        </svg>
      )
    }

    // Skrill
    if (methodLower.includes('skrill')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#6E1E5B"/>
          <path d="M6 8h12v2H6V8zm0 3h12v2H6v-2zm0 3h12v2H6v-2z" fill="white"/>
        </svg>
      )
    }

    // Neteller
    if (methodLower.includes('neteller')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#86BC24"/>
          <path d="M12 6l5 4-5 4-5-4 5-4zm0 9l5-4v4l-5 4-5-4v-4l5 4z" fill="white"/>
        </svg>
      )
    }

    // Paysafecard
    if (methodLower.includes('paysafe')) {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#0E4C92"/>
          <path d="M8 9h8v2H8V9zm0 3h8v2H8v-2z" fill="white"/>
        </svg>
      )
    }

    // Generic card icon for unknown methods
    return (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" className="text-gray-400"/>
        <rect x="2" y="9" width="20" height="3" fill="currentColor" className="text-gray-400"/>
      </svg>
    )
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />

      <div className="bg-white">
        <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
          <div className="container pt-8 pb-6 lg:pb-8">
            <header className="relative grid gap-6 border-b border-gray-100 pb-10">
              <div className="max-w-3xl grid gap-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand font-mono">
                  Recenzie Casino
                </p>
                <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono">
                  {review.title.replace(' 2025', '')} <span className="text-orange-500">2025</span>
                </h1>
              </div>
            {/* Author Info & Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
              {/* Author Section */}
              {author && (
                <div className="flex items-center gap-4">
                  {/* Author Avatar */}
                  {author.picture?.asset?.url ? (
                    <Link href={`/autori/${author.slug?.current}`} className="flex-shrink-0">
                      <Image
                        src={author.picture.asset.url}
                        alt={author.picture.alt || `${author.firstName} ${author.lastName}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover aspect-square ring-2 ring-gray-100 hover:ring-brand transition-all"
                        placeholder={author.picture.asset.metadata?.lqip ? 'blur' : undefined}
                        blurDataURL={author.picture.asset.metadata?.lqip}
                      />
                    </Link>
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
                      <Link
                        href={`/autori/${author.slug?.current}`}
                        className="font-semibold text-gray-900 hover:text-brand transition-colors"
                      >
                        {author.firstName} {author.lastName}
                      </Link>
                    </div>
                    {author.role && (
                      <p className="text-sm text-gray-600">{author.role}</p>
                    )}
                    {review.publishedAt && (
                      <p className="text-xs text-gray-500">
                        Ultima actualizare:{' '}
                        <DateComponent dateString={review.publishedAt} />
                      </p>
                    )}
                    {/* Social Media Icons */}
                    {author.socialMedia && (
                      <div className="flex items-center gap-2 mt-1">
                        {author.socialMedia.linkedin && (
                          <a
                            href={author.socialMedia.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                            aria-label="LinkedIn"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                          </a>
                        )}
                        {author.socialMedia.twitter && (
                          <a
                            href={author.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                            aria-label="Twitter/X"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                        )}
                        {author.socialMedia.facebook && (
                          <a
                            href={author.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                            aria-label="Facebook"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        {author.socialMedia.instagram && (
                          <a
                            href={author.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                            aria-label="Instagram"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                        {author.socialMedia.website && (
                          <a
                            href={author.socialMedia.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                            aria-label="Website"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rating Badge + CTA */}
              <div className="flex flex-col gap-3 items-end">
                {/* Rating Badge */}
                {typeof casino.rating === 'number' && (
                  <div className="rounded-full bg-amber-50 px-6 py-3 font-semibold text-amber-700 whitespace-nowrap font-mono flex items-center gap-2 text-lg">
                    <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {casino.rating.toFixed(1)} / 10
                  </div>
                )}
                {/* CTA Button */}
                {casino.affiliateLink && (
                  <a
                    href={casino.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full inline-flex gap-2 font-mono whitespace-nowrap items-center bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 py-3 px-6 text-white transition-colors duration-200"
                  >
                    Joacă la {casino.name}
                  </a>
                )}
              </div>
            </div>

            {/* Welcome Bonus Badge */}
            {casino.welcomeBonus && (
              <div className="inline-flex items-center rounded-lg bg-brand/10 px-6 py-3 text-lg font-bold text-brand font-mono">
                <span className="font-bold">Bonusuri: </span>
                {casino.affiliateLink ? (
                  <a
                    href={casino.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {casino.welcomeBonus}
                  </a>
                ) : (
                  casino.welcomeBonus
                )}
              </div>
            )}
          </header>
          </div>
        </div>

        <div className="container pb-12 lg:pb-24">
          {/* TL;DR Section */}
          {review.tldr && (
            <section className="mt-6 rounded-lg border-l-4 border-brand bg-brand/10 p-6 font-mono">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Rezumat Rapid</h2>
              <p className="text-gray-700 leading-relaxed">{review.tldr}</p>
            </section>
          )}

          <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-12">
              {/* Main Review Content */}
              <article className="prose max-w-none">
                {reviewContent?.length ? (
                  <CustomPortableText className="max-w-none" value={reviewContent} author={author} />
                ) : (
                  <p className="text-gray-500">Recenzia completă pentru acest cazino vine în curând.</p>
                )}
              </article>

              {/* FAQ Section */}
              {review.faq && review.faq.length > 0 && (
                <section>
                  <ReviewFAQ items={review.faq} />
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Casino Snapshot */}
              <section className="rounded-lg border border-gray-100 bg-gray-50 p-6 font-mono">
                <h2 className="text-lg font-semibold text-gray-900">Informații Casino</h2>

                {/* Casino Logo */}
                {casino.logo?.asset?.url && (
                  <div className="mt-4 mb-4 flex justify-center">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-full">
                      <Image
                        src={casino.logo.asset.url}
                        alt={casino.logo.alt || casino.name}
                        width={200}
                        height={100}
                        className="object-contain w-full"
                        placeholder={casino.logo.asset.metadata?.lqip ? 'blur' : undefined}
                        blurDataURL={casino.logo.asset.metadata?.lqip}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {casino.legalEntity && (
                    <p>
                      <span className="font-bold text-gray-700">Entitate Legală:</span>{' '}
                      {casino.legalEntity}
                    </p>
                  )}
                  {casino.companyInfo?.establishedYear && (
                    <p>
                      <span className="font-bold text-gray-700">Înființat:</span>{' '}
                      {casino.companyInfo.establishedYear}
                    </p>
                  )}
                  {casino.companyInfo?.licenses?.[0] && (
                    <p>
                      <span className="font-bold text-gray-700">Licență:</span>{' '}
                      {casino.companyInfo.licenses[0].license}
                      {casino.companyInfo.licenses[0].licenseNumber &&
                        ` #${casino.companyInfo.licenses[0].licenseNumber}`}
                      {casino.companyInfo.licenses[0].licenseAuthority &&
                        ` (${casino.companyInfo.licenses[0].licenseAuthority})`}
                    </p>
                  )}
                  {typeof casino.numberOfGames === 'number' && (
                    <p>
                      <span className="font-bold text-gray-700">Jocuri Disponibile:</span>{' '}
                      {casino.numberOfGames.toLocaleString()}
                    </p>
                  )}
                  {(casino.minimumDeposit || casino.maximumDeposit) && (
                    <p>
                      <span className="font-bold text-gray-700">Depunere:</span>{' '}
                      {casino.minimumDeposit && `min. ${casino.minimumDeposit}€`}
                      {casino.minimumDeposit && casino.maximumDeposit && ' / '}
                      {casino.maximumDeposit && `max. ${casino.maximumDeposit}€`}
                    </p>
                  )}
                  {formatBoolean(casino.crypto) && (
                    <p>
                      <span className="font-bold text-gray-700">Suportă Cripto:</span>{' '}
                      {formatBoolean(casino.crypto)}
                    </p>
                  )}
                  {formatBoolean(casino.mobile) && (
                    <p>
                      <span className="font-bold text-gray-700">Mobile Friendly:</span>{' '}
                      {formatBoolean(casino.mobile)}
                    </p>
                  )}
                  {formatBoolean(casino.liveCasino) && (
                    <p>
                      <span className="font-bold text-gray-700">Live Casino:</span>{' '}
                      {formatBoolean(casino.liveCasino)}
                    </p>
                  )}
                </div>
              </section>

              {/* Detailed Ratings */}
              {(casino.trustRating || casino.bonusRating || casino.paymentRating || casino.withdrawalRating) && (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h2 className="text-lg font-semibold text-gray-900">Evaluări Detaliate</h2>
                  <div className="mt-4 space-y-3">
                    {casino.trustRating && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-700">Încredere:</span>
                        <div className="flex items-center gap-2">
                          {renderStars(casino.trustRating)}
                          <span className="text-xs text-gray-500 whitespace-nowrap">{casino.trustRating.toFixed(1)} / 5</span>
                        </div>
                      </div>
                    )}
                    {casino.bonusRating && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-700">Bonusuri:</span>
                        <div className="flex items-center gap-2">
                          {renderStars(casino.bonusRating)}
                          <span className="text-xs text-gray-500 whitespace-nowrap">{casino.bonusRating.toFixed(1)} / 5</span>
                        </div>
                      </div>
                    )}
                    {casino.paymentRating && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-700">Plăți:</span>
                        <div className="flex items-center gap-2">
                          {renderStars(casino.paymentRating)}
                          <span className="text-xs text-gray-500 whitespace-nowrap">{casino.paymentRating.toFixed(1)} / 5</span>
                        </div>
                      </div>
                    )}
                    {casino.withdrawalRating && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-700">Retrageri:</span>
                        <div className="flex items-center gap-2">
                          {renderStars(casino.withdrawalRating)}
                          <span className="text-xs text-gray-500 whitespace-nowrap">{casino.withdrawalRating.toFixed(1)} / 5</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href="/metodologia" className="text-sm font-light text-brand hover:underline">
                      Citește metodologia noastră de evaluare
                    </Link>
                  </div>
                </section>
              )}

              {/* Key Features */}
              {casino.keyFeatures?.length ? (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h2 className="text-lg font-semibold text-gray-900">Caracteristici Cheie</h2>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {casino.keyFeatures.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="text-brand">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Pros */}
              {casino.pros?.length ? (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h2 className="text-lg font-semibold text-gray-900">Avantaje</h2>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {casino.pros.map((pro: string) => (
                      <li key={pro} className="flex items-start gap-2">
                        <span className="text-emerald-500">+</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Cons */}
              {casino.cons?.length ? (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h2 className="text-lg font-semibold text-gray-900">Dezavantaje</h2>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {casino.cons.map((con: string) => (
                      <li key={con} className="flex items-start gap-2">
                        <span className="text-rose-500">−</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Payment Methods */}
              {casino.paymentMethods?.length ? (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h2 className="text-lg font-semibold text-gray-900">Metode de Plată</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {casino.paymentMethods.map((method: string) => (
                      <div
                        key={method}
                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md border border-gray-200"
                      >
                        {getPaymentIcon(method)}
                        <span className="text-xs text-gray-700">{method}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* CTA Button */}
              {casino.affiliateLink && (
                <section className="rounded-lg border border-orange-200 bg-orange-50 p-6 font-mono">
                  <a
                    href={casino.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full flex gap-2 font-mono whitespace-nowrap items-center justify-center bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 py-3 px-6 text-white transition-colors duration-200 animate-pulse w-full"
                  >
                    Joacă la {casino.name}
                  </a>
                </section>
              )}

              {/* Similar Casinos */}
              {review.similarCasinos?.length > 0 && (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Cazinouri Similare</h2>
                  <div className="space-y-4">
                    {review.similarCasinos.map((similarCasino: any) => {
                      const badges = []
                      if (similarCasino.crypto) badges.push({label: 'Crypto', color: 'bg-blue-100 text-blue-700'})
                      if (similarCasino.liveCasino) badges.push({label: 'Live', color: 'bg-red-100 text-red-700'})
                      if (similarCasino.mobile) badges.push({label: 'Mobile', color: 'bg-green-100 text-green-700'})
                      if (similarCasino.welcomeBonus) badges.push({label: 'Bonus', color: 'bg-orange-100 text-orange-700'})

                      return (
                        <Link
                          key={similarCasino._id}
                          href={`/casino/${similarCasino.slug.current}`}
                          className="block p-3 rounded-lg border border-gray-100 hover:border-brand hover:bg-brand/5 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {similarCasino.logo?.asset?.url && (
                              <div className="flex-shrink-0 w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden">
                                <Image
                                  src={similarCasino.logo.asset.url}
                                  alt={similarCasino.logo.alt || similarCasino.name}
                                  width={48}
                                  height={48}
                                  className="object-contain w-full h-full"
                                  placeholder={similarCasino.logo.asset.metadata?.lqip ? 'blur' : undefined}
                                  blurDataURL={similarCasino.logo.asset.metadata?.lqip}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-900 truncate">
                                {similarCasino.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {typeof similarCasino.rating === 'number' && (
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                    <span className="text-xs text-gray-600">{similarCasino.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {badges.slice(0, 3).map((badge, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}
                                  >
                                    {badge.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )}
            </aside>
          </div>

          {/* Responsible Gaming Disclaimer */}
          <div className="mt-12">
            <div className="rounded-lg border-2 border-orange-400 bg-orange-50/50 p-6 lg:p-8 font-mono">
              <div className="flex gap-4">
                {/* 18+ Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl lg:text-2xl">
                    18+
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                    Joacă responsabil – Doar pentru persoane peste 18 ani
                  </h3>

                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                    Jocurile de noroc sunt destinate exclusiv persoanelor care au împlinit 18 ani. Scopul lor este distracția, nu câștigul sigur. Joacă mereu cu măsură și stabilește-ți din timp limitele de timp și bani.
                  </p>

                  <p className="text-sm lg:text-base text-gray-700 leading-relaxed">
                    Dacă simți că pierzi controlul sau jocul nu mai este o plăcere, cere ajutor. Poți apela gratuit la linia telefonică Joc Responsabil –{' '}
                    <a href="tel:0800800099" className="font-semibold text-orange-600 hover:underline">
                      0800 800 099
                    </a>
                    {' '}sau vizita{' '}
                    <a
                      href="https://www.jocresponsabil.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-orange-600 hover:underline"
                    >
                      www.jocresponsabil.ro
                    </a>
                    {' '}pentru consiliere și sprijin.
                  </p>

                  <p className="text-sm lg:text-base font-bold text-gray-900 pt-2">
                    Joacă informat. Joacă responsabil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
