import Image from 'next/image'
import Link from 'next/link'

interface AuthorCardProps {
  author: {
    _id: string
    firstName: string
    lastName: string
    slug: {
      current: string
    }
    role?: string
    bio?: string
    picture?: {
      asset?: {
        url: string
        metadata?: {
          lqip?: string
          dimensions?: {
            width: number
            height: number
          }
        }
      }
      alt?: string
    }
    expertise?: string[]
    yearsOfExperience?: number
  }
}

export default function AuthorCard({author}: AuthorCardProps) {
  const fullName = `${author.firstName} ${author.lastName}`
  const bioExcerpt = author.bio
    ? author.bio.length > 150
      ? `${author.bio.substring(0, 150)}...`
      : author.bio
    : ''

  return (
    <Link
      href={`/autori/${author.slug.current}`}
      className="group block h-full"
    >
      <article className="h-full flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-brand hover:-translate-y-1">
        {/* Author Picture */}
        <div className="flex flex-col items-center mb-4">
          {author.picture?.asset?.url ? (
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={author.picture.asset.url}
                alt={author.picture.alt || fullName}
                width={128}
                height={128}
                className="rounded-full object-cover w-full h-full ring-4 ring-gray-100 group-hover:ring-brand transition-all"
                placeholder={author.picture.asset.metadata?.lqip ? 'blur' : undefined}
                blurDataURL={author.picture.asset.metadata?.lqip}
              />
            </div>
          ) : (
            <div className="w-32 h-32 mb-4 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-gray-100 group-hover:ring-brand transition-all">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Name and Role */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors font-mono">
              {fullName}
            </h3>
            {author.role && (
              <p className="text-sm text-brand font-semibold mt-1 font-mono">
                {author.role}
              </p>
            )}
          </div>

          {/* Years of Experience Badge */}
          {typeof author.yearsOfExperience === 'number' && author.yearsOfExperience > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold font-mono">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {author.yearsOfExperience} {author.yearsOfExperience === 1 ? 'an' : 'ani'} experiență
            </div>
          )}
        </div>

        {/* Bio */}
        {bioExcerpt && (
          <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow font-mono">
            {bioExcerpt}
          </p>
        )}

        {/* Expertise Tags */}
        {author.expertise && author.expertise.length > 0 && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {author.expertise.slice(0, 4).map((item) => (
                <span
                  key={item}
                  className="inline-block px-2 py-1 text-xs font-medium bg-brand/10 text-brand rounded font-mono"
                >
                  {item}
                </span>
              ))}
              {author.expertise.length > 4 && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded font-mono">
                  +{author.expertise.length - 4} mai mult
                </span>
              )}
            </div>
          </div>
        )}

        {/* Read More Arrow */}
        <div className="mt-4 flex items-center justify-center gap-2 text-brand font-semibold text-sm font-mono">
          <span>Vezi profilul</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  )
}
