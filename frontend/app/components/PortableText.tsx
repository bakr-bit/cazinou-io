/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import Image from 'next/image'
import Link from 'next/link'
import {PortableText, type PortableTextComponents, type PortableTextBlock} from 'next-sanity'

import ResolvedLink from '@/app/components/ResolvedLink'
import {Table, type TableBlockData} from '@/app/components/Table'

export default function CustomPortableText({
  className,
  value,
  author,
}: {
  className?: string
  value: PortableTextBlock[]
  author?: any
}) {
  const renderImageBlock = (value: any) => {
    const imageUrl = value?.asset?.url
    if (!imageUrl) {
      return null
    }

    const imageElement = (
      <Image
        src={imageUrl}
        alt={value.alt || ''}
        width={value.asset?.metadata?.dimensions?.width || 800}
        height={value.asset?.metadata?.dimensions?.height || 450}
        className="rounded-lg w-full h-auto"
      />
    )

    return (
      <figure className="my-4">
        {value.link?.url ? (
          <a
            href={value.link.url}
            target={value.link.blank ? '_blank' : undefined}
            rel={value.link.blank ? 'noopener noreferrer' : undefined}
            className="block hover:opacity-90 transition-opacity"
          >
            {imageElement}
          </a>
        ) : (
          imageElement
        )}
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-600 mt-3">
            {value.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  const renderYouTubeEmbed = (value: any) => {
    const getYouTubeId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
      ]
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
      }
      return null
    }

    const videoId = value?.url ? getYouTubeId(value.url) : null
    if (!videoId) return null

    return (
      <figure className="my-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={value.title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        {value.title && (
          <figcaption className="text-center text-sm text-gray-600 mt-3">
            {value.title}
          </figcaption>
        )}
      </figure>
    )
  }

  const components: PortableTextComponents = {
    types: {
      image: ({value}) => renderImageBlock(value),
      linkableImage: ({value}) => renderImageBlock(value),
      youtubeEmbed: ({value}) => renderYouTubeEmbed(value),
      authorComment: ({value}) => {
        if (!value.comment) return null

        // Use avatar from authorComment, fallback to review author's picture
        const avatarUrl = value.avatar?.asset?.url || author?.picture?.asset?.url
        const avatarAlt = value.avatar?.alt || author?.picture?.alt || 'Author avatar'
        const authorName = value.author || `${author?.firstName} ${author?.lastName}`
        const authorRole = author?.role // Always use role from Person object
        const authorSlug = author?.slug?.current

        return (
          <aside className="my-6 p-6 bg-brand/5 rounded-lg font-mono">
            <div className="flex items-start gap-4">
              {/* Author Avatar */}
              <div className="flex-shrink-0">
                {avatarUrl ? (
                  authorSlug ? (
                    <Link href={`/autori/${authorSlug}`}>
                      <Image
                        src={avatarUrl}
                        alt={avatarAlt}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover aspect-square ring-2 ring-white shadow-md hover:ring-brand transition-all cursor-pointer"
                        placeholder={value.avatar?.asset?.metadata?.lqip || author?.picture?.asset?.metadata?.lqip ? 'blur' : undefined}
                        blurDataURL={value.avatar?.asset?.metadata?.lqip || author?.picture?.asset?.metadata?.lqip}
                      />
                    </Link>
                  ) : (
                    <Image
                      src={avatarUrl}
                      alt={avatarAlt}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover aspect-square ring-2 ring-white shadow-md"
                      placeholder={value.avatar?.asset?.metadata?.lqip || author?.picture?.asset?.metadata?.lqip ? 'blur' : undefined}
                      blurDataURL={value.avatar?.asset?.metadata?.lqip || author?.picture?.asset?.metadata?.lqip}
                    />
                  )
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white shadow-md aspect-square">
                    <svg
                      className="w-7 h-7 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="mb-3">
                  {authorSlug ? (
                    <Link
                      href={`/autori/${authorSlug}`}
                      className="font-bold text-lg text-gray-900 hover:text-brand transition-colors leading-tight"
                    >
                      {authorName}
                    </Link>
                  ) : (
                    <p className="font-bold text-lg text-gray-900 leading-tight">{authorName}</p>
                  )}
                  {authorRole && (
                    <p className="text-sm text-gray-600 font-medium mt-1">{authorRole}</p>
                  )}
                </div>
                <blockquote className="relative">
                  <svg
                    className="absolute -left-1 -top-2 w-8 h-8 text-brand/20 opacity-50"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                  >
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8zm16 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" />
                  </svg>
                  <p className="text-gray-700 leading-relaxed pl-6 italic">
                    {value.comment}
                  </p>
                </blockquote>
              </div>
            </div>
          </aside>
        )
      },
      tableBlock: ({value}) => <Table data={value as TableBlockData} />,
      calloutBox: ({value}) => {
        if (!value.content) return null

        const typeConfig = {
          warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-400',
            iconColor: 'text-yellow-600',
            titleColor: 'text-yellow-800',
            defaultTitle: 'Atenție',
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ),
          },
          info: {
            bg: 'bg-blue-50',
            border: 'border-blue-400',
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-800',
            defaultTitle: 'Informație',
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          tip: {
            bg: 'bg-green-50',
            border: 'border-green-400',
            iconColor: 'text-green-600',
            titleColor: 'text-green-800',
            defaultTitle: 'Sfat',
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            ),
          },
          note: {
            bg: 'bg-gray-100',
            border: 'border-gray-400',
            iconColor: 'text-gray-600',
            titleColor: 'text-gray-800',
            defaultTitle: 'Notă',
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
          },
          keyTakeaway: {
            bg: 'bg-purple-50',
            border: 'border-purple-400',
            iconColor: 'text-purple-600',
            titleColor: 'text-purple-800',
            defaultTitle: 'Concluzie Cheie',
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            ),
          },
          didYouKnow: {
            bg: 'bg-cyan-50',
            border: 'border-cyan-400',
            iconColor: 'text-cyan-600',
            titleColor: 'text-cyan-800',
            defaultTitle: 'Știai că?',
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            ),
          },
        }

        const config =
          typeConfig[value.type as keyof typeof typeConfig] || typeConfig.info
        const title = value.title || config.defaultTitle

        return (
          <aside className={`my-6 p-5 ${config.bg} ${config.border} border-l-4 rounded-r-lg`}>
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</div>
              <div className="flex-1">
                <h4 className={`font-bold text-lg ${config.titleColor} mb-2`}>{title}</h4>
                <p className="text-gray-700 leading-relaxed">{value.content}</p>
              </div>
            </div>
          </aside>
        )
      },
    },
    block: {
      h1: ({children, value}) => (
        // Add an anchor to the h1
        <h1 className="group relative font-mono font-bold">
          {children}
          <a
            href={`#${value?._key}`}
            className="absolute left-0 top-0 bottom-0 -ml-6 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </a>
        </h1>
      ),
      h2: ({children, value}) => {
        // Add an anchor to the h2
        return (
          <h2 className="group relative font-mono font-bold">
            {children}
            <a
              href={`#${value?._key}`}
              className="absolute left-0 top-0 bottom-0 -ml-6 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </a>
          </h2>
        )
      },
      h3: ({children}) => <h3 className="font-mono font-bold">{children}</h3>,
    },
    marks: {
      link: ({children, value: link}) => {
        return <ResolvedLink link={link}>{children}</ResolvedLink>
      },
    },
  }

  return (
    <div
      className={[
        'prose prose-a:text-brand prose-ul:pl-0 prose-ol:pl-0 prose-ul:my-4 prose-ol:my-4 prose-li:my-0 max-w-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <PortableText components={components} value={value} />
    </div>
  )
}
