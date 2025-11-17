'use client'

import Image from 'next/image'
import Link from 'next/link'

interface ReviewCardProps {
  review: {
    _id: string
    title: string
    slug: {
      current: string
    }
    excerpt?: string
    publishedAt?: string
    casino?: {
      _id: string
      name: string
      logo?: {
        asset?: {
          url: string
          metadata?: {
            lqip: string
          }
        }
        alt?: string
      }
      rating?: number
      welcomeBonus?: string
    }
    author?: {
      firstName: string
      lastName: string
      picture?: {
        asset?: {
          url: string
          metadata?: {
            lqip: string
          }
        }
        alt?: string
      }
    }
  }
}

export function ReviewCard({review}: ReviewCardProps) {
  const href = `/casino/${review.slug.current}`
  const formattedDate = review.publishedAt
    ? new Date(review.publishedAt).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const casinoLogoUrl = review.casino?.logo?.asset?.url
  const authorPictureUrl = review.author?.picture?.asset?.url

  // Debug logging
  if (typeof window !== 'undefined' && review.author) {
    console.log('Author data:', {
      name: `${review.author.firstName} ${review.author.lastName}`,
      hasPicture: !!review.author.picture,
      pictureUrl: authorPictureUrl,
    })
  }

  return (
    <article className="group rounded-2xl shadow-sm border border-gray-100 bg-white/70 backdrop-blur overflow-hidden transition-all hover:border-orange-500 hover:-translate-y-0.5 hover:scale-[1.01]">
      <Link href={href} className="block">
        {/* Casino Header */}
        {review.casino && (
          <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            {casinoLogoUrl ? (
              <Image
                src={casinoLogoUrl}
                alt={review.casino.logo?.alt || review.casino.name}
                width={200}
                height={120}
                className="object-contain max-h-24"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-700 font-mono">{review.casino.name}</h3>
            )}
            {review.casino.rating && (
              <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-sm font-bold font-mono shadow-lg">
                {review.casino.rating.toFixed(1)}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <h3 className="text-xl font-bold leading-tight line-clamp-2 text-gray-900 font-mono group-hover:text-orange-600 transition-colors mb-2">
            {review.title}
          </h3>

          {review.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">{review.excerpt}</p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
            {review.author && (
              <div className="flex items-center gap-2">
                {authorPictureUrl ? (
                  <Image
                    src={authorPictureUrl}
                    alt={`${review.author.firstName} ${review.author.lastName}`}
                    width={24}
                    height={24}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                    {review.author.firstName.charAt(0)}
                  </div>
                )}
                <span>
                  {review.author.firstName} {review.author.lastName}
                </span>
              </div>
            )}
            {formattedDate && <time dateTime={review.publishedAt}>{formattedDate}</time>}
          </div>

          {review.casino?.welcomeBonus && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-orange-800 font-mono line-clamp-1">
                {review.casino.welcomeBonus}
              </p>
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}
