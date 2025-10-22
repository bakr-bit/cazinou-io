import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type AuthorIntroData = {
  _type: 'authorIntroSection'
  _key: string
  heading?: string
  customText?: string
  author?: {
    _id: string
    firstName?: string
    lastName?: string
    slug?: {
      current?: string
    }
    picture?: {
      asset?: {
        url?: string
        metadata?: {
          lqip?: string
        }
      }
      alt?: string
    }
    role?: string
    bio?: string
    expertise?: string[]
    yearsOfExperience?: number
    credentials?: string[]
    socialMedia?: {
      linkedin?: string
      twitter?: string
      facebook?: string
      instagram?: string
      website?: string
    }
  }
}

type AuthorIntroProps = {
  data: AuthorIntroData
  index: number
}

export function AuthorIntro({data, index}: AuthorIntroProps) {
  const author = data.author

  if (!author) {
    return null
  }

  const fullName = `${author.firstName || ''} ${author.lastName || ''}`.trim()
  const authorSlug = author.slug?.current
  const displayText = data.customText || author.bio

  return (
    <section
      className="my-12 rounded-2xl border border-gray-200 bg-gradient-to-br from-orange-50/30 via-white to-white p-8 shadow-sm"
      aria-labelledby={`author-intro-${index}`}
    >
      {data.heading && (
        <h2
          id={`author-intro-${index}`}
          className="mb-6 text-center text-2xl font-bold text-gray-900 font-mono"
        >
          {data.heading}
        </h2>
      )}

      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {author.picture?.asset?.url ? (
              <Link
                href={authorSlug ? `/autori/${authorSlug}` : '#'}
                className="block"
              >
                <Image
                  src={author.picture.asset.url}
                  alt={author.picture.alt || fullName || 'Author'}
                  width={120}
                  height={120}
                  className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-100 transition-all hover:ring-orange-300 md:h-32 md:w-32"
                  placeholder={author.picture.asset.metadata?.lqip ? 'blur' : undefined}
                  blurDataURL={author.picture.asset.metadata?.lqip}
                />
              </Link>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 ring-4 ring-gray-100 md:h-32 md:w-32">
                <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Author Details */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              {fullName && (
                <h3 className="text-xl font-bold text-gray-900 font-mono">
                  {authorSlug ? (
                    <Link
                      href={`/autori/${authorSlug}`}
                      className="hover:text-orange-600 transition-colors"
                    >
                      {fullName}
                    </Link>
                  ) : (
                    fullName
                  )}
                </h3>
              )}
              {author.role && (
                <p className="mt-1 text-sm font-medium text-orange-600 font-mono uppercase tracking-wide">
                  {author.role}
                </p>
              )}
            </div>

            {displayText && (
              <p className="text-base leading-relaxed text-gray-700">{displayText}</p>
            )}

            {/* Expertise & Experience */}
            {(author.expertise || author.yearsOfExperience || author.credentials) && (
              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                {author.yearsOfExperience && (
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <svg
                      className="h-5 w-5 text-orange-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 font-mono">
                      {author.yearsOfExperience}+ ani de experiență
                    </span>
                  </div>
                )}

                {author.expertise && author.expertise.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Expertiză
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                      {author.expertise.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {author.credentials && author.credentials.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Credențiale
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {author.credentials.map((credential, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-orange-500">✓</span>
                          <span>{credential}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Social Media Links */}
            {author.socialMedia && (
              <div className="flex items-center justify-center gap-3 md:justify-start">
                {author.socialMedia.linkedin && (
                  <a
                    href={author.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gray-100 p-2 transition-all hover:bg-orange-500 hover:text-white"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {author.socialMedia.twitter && (
                  <a
                    href={author.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gray-100 p-2 transition-all hover:bg-orange-500 hover:text-white"
                    aria-label="Twitter/X"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {author.socialMedia.facebook && (
                  <a
                    href={author.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gray-100 p-2 transition-all hover:bg-orange-500 hover:text-white"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {author.socialMedia.instagram && (
                  <a
                    href={author.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gray-100 p-2 transition-all hover:bg-orange-500 hover:text-white"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {author.socialMedia.website && (
                  <a
                    href={author.socialMedia.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gray-100 p-2 transition-all hover:bg-orange-500 hover:text-white"
                    aria-label="Website"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* View Full Profile Link */}
            {authorSlug && (
              <div className="pt-2">
                <Link
                  href={`/autori/${authorSlug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700 font-mono"
                >
                  Vezi profilul complet
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
