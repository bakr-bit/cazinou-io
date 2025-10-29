import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'

import CustomPortableText from '@/app/components/PortableText'
import DateComponent from '@/app/components/Date'
import {sanityFetch} from '@/sanity/lib/live'
import {authorBySlugQuery, authorSlugsQuery, authorContentQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: authorSlugsQuery,
    perspective: 'published',
    stega: false,
  })

  return data ?? []
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data} = await sanityFetch({
    query: authorBySlugQuery,
    params,
    stega: false,
  })

  const author = data as any

  if (!author?._id) {
    return {}
  }

  const fullName = `${author.firstName} ${author.lastName}`
  const title = `${fullName} - ${author.role || 'Expert Cazinouri Online'} | Cazinou.io`
  const description = author.bio || `Citește articolele și recenziile scrise de ${fullName}, ${author.role || 'expert în cazinouri online'}.`
  const ogImageSource = author.picture
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(ogImageSource)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
    twitter: {
      title,
      description,
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  }
}

export default async function AuthorPage(props: Props) {
  const params = await props.params
  const [{data: author}, {data: content}] = await Promise.all([
    sanityFetch({query: authorBySlugQuery, params}),
    sanityFetch({
      query: authorContentQuery,
      params: {authorId: ''},
      stega: false,
    }),
  ])

  const authorData = author as any

  if (!authorData?._id) {
    return notFound()
  }

  // Fetch author content with the correct author ID
  const {data: authorContent} = await sanityFetch({
    query: authorContentQuery,
    params: {authorId: authorData._id},
    stega: false,
  })

  const contentData = authorContent as any
  const fullName = `${authorData.firstName} ${authorData.lastName}`

  // Combine all content and sort by date
  const allContent = [
    ...(contentData?.reviews || []).map((item: any) => ({...item, type: 'review', date: item.publishedAt})),
    ...(contentData?.posts || []).map((item: any) => ({...item, type: 'post'})),
    ...(contentData?.infoPages || []).map((item: any) => ({...item, type: 'info', date: item.publishedAt})),
    ...(contentData?.lotoPages || []).map((item: any) => ({...item, type: 'loto', date: item.publishedAt})),
  ]
    .sort((a, b) => {
      const dateA = new Date(a.date || a.publishedAt || 0).getTime()
      const dateB = new Date(b.date || b.publishedAt || 0).getTime()
      return dateB - dateA
    })
    .slice(0, 4)

  // Generate JSON-LD structured data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cazinou.io'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fullName,
    jobTitle: authorData.role,
    description: authorData.bio,
    image: authorData.picture?.asset?.url,
    url: `${siteUrl}/autori/${authorData.slug.current}`,
    sameAs: [
      authorData.socialMedia?.linkedin,
      authorData.socialMedia?.twitter,
      authorData.socialMedia?.facebook,
      authorData.socialMedia?.instagram,
      authorData.socialMedia?.website,
    ].filter(Boolean),
  }

  const getContentUrl = (item: any) => {
    if (item.type === 'review') return `/recenzii/${item.slug.current}`
    if (item.type === 'post') return `/posts/${item.slug.current}`
    if (item.type === 'info') return `/${item.slug.current}`
    if (item.type === 'loto') return `/loto-online/${item.slug.current}`
    return '#'
  }

  const getContentLabel = (type: string) => {
    if (type === 'review') return 'Recenzie'
    if (type === 'post') return 'Articol'
    if (type === 'info') return 'Ghid'
    if (type === 'loto') return 'Loto'
    return 'Conținut'
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />

      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-[url(/images/tile-1-black.png)] bg-[length:5px_5px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white"></div>
          <div className="container relative py-12 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-12 items-start">
              {/* Author Picture */}
              <div className="flex justify-center lg:justify-start">
                {authorData.picture?.asset?.url ? (
                  <div className="relative w-48 h-48 lg:w-64 lg:h-64">
                    <Image
                      src={authorData.picture.asset.url}
                      alt={authorData.picture.alt || fullName}
                      width={256}
                      height={256}
                      className="rounded-full object-cover w-full h-full ring-8 ring-white shadow-2xl"
                      placeholder={authorData.picture.asset.metadata?.lqip ? 'blur' : undefined}
                      blurDataURL={authorData.picture.asset.metadata?.lqip}
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white shadow-2xl">
                    <svg className="w-24 h-24 lg:w-32 lg:h-32 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl font-mono mb-3">
                    {fullName}
                  </h1>
                  {authorData.role && (
                    <p className="text-xl text-brand font-semibold font-mono">
                      {authorData.role}
                    </p>
                  )}
                </div>

                {/* Stats Badges */}
                <div className="flex flex-wrap gap-3">
                  {typeof authorData.yearsOfExperience === 'number' && authorData.yearsOfExperience > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 font-semibold font-mono">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {authorData.yearsOfExperience} {authorData.yearsOfExperience === 1 ? 'an' : 'ani'} experiență
                    </div>
                  )}
                  {authorData.expertise && authorData.expertise.length > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand font-semibold font-mono">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {authorData.expertise.length} {authorData.expertise.length === 1 ? 'specializare' : 'specializări'}
                    </div>
                  )}
                  {authorData.credentials && authorData.credentials.length > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-semibold font-mono">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Certificat
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {authorData.socialMedia && (
                  <div className="flex flex-wrap items-center gap-3">
                    {authorData.socialMedia.linkedin && (
                      <a
                        href={authorData.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                    )}
                    {authorData.socialMedia.twitter && (
                      <a
                        href={authorData.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                        aria-label="Twitter/X"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                    {authorData.socialMedia.facebook && (
                      <a
                        href={authorData.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                        aria-label="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {authorData.socialMedia.instagram && (
                      <a
                        href={authorData.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {authorData.socialMedia.website && (
                      <a
                        href={authorData.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-gray-100 hover:bg-brand hover:text-white transition-all"
                        aria-label="Website"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Main Content */}
            <div className="space-y-12">
              {/* Biography */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mono">Despre {authorData.firstName}</h2>
                {authorData.longBio && authorData.longBio.length > 0 ? (
                  <div className="prose max-w-none">
                    <CustomPortableText value={authorData.longBio as PortableTextBlock[]} />
                  </div>
                ) : authorData.bio ? (
                  <p className="text-gray-700 leading-relaxed font-mono">{authorData.bio}</p>
                ) : (
                  <p className="text-gray-500 font-mono">Biografie indisponibilă.</p>
                )}
              </section>

              {/* Recent Content */}
              {allContent.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mono">
                    Articole Recente de {authorData.firstName}
                  </h2>
                  <div className="space-y-4">
                    {allContent.map((item: any) => (
                      <Link
                        key={item._id}
                        href={getContentUrl(item)}
                        className="block group"
                      >
                        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-brand">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="inline-block px-2 py-1 text-xs font-semibold bg-brand/10 text-brand rounded font-mono">
                                  {getContentLabel(item.type)}
                                </span>
                                {item.date && (
                                  <span className="text-xs text-gray-500 font-mono">
                                    <DateComponent dateString={item.date} />
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand transition-colors font-mono mb-2">
                                {item.title}
                              </h3>
                              {item.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-2 font-mono">
                                  {item.excerpt}
                                </p>
                              )}
                            </div>
                            {item.type === 'review' && item.casino?.logo?.asset?.url && (
                              <div className="flex-shrink-0 w-16 h-16 bg-white rounded border border-gray-200 overflow-hidden">
                                <Image
                                  src={item.casino.logo.asset.url}
                                  alt={item.casino.logo.alt || item.casino.name}
                                  width={64}
                                  height={64}
                                  className="object-contain w-full h-full"
                                  placeholder={item.casino.logo.asset.metadata?.lqip ? 'blur' : undefined}
                                  blurDataURL={item.casino.logo.asset.metadata?.lqip}
                                />
                              </div>
                            )}
                          </div>
                          {item.type === 'review' && item.casino && (
                            <div className="flex items-center gap-3 text-sm">
                              {typeof item.casino.rating === 'number' && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                  </svg>
                                  <span className="font-semibold text-gray-700 font-mono">{item.casino.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </article>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Expertise */}
              {authorData.expertise && authorData.expertise.length > 0 && (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Domenii de Expertiză</h3>
                  <div className="flex flex-wrap gap-2">
                    {authorData.expertise.map((item: string) => (
                      <span
                        key={item}
                        className="inline-block px-3 py-2 text-sm font-medium bg-brand/10 text-brand rounded-lg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Credentials */}
              {authorData.credentials && authorData.credentials.length > 0 && (
                <section className="rounded-lg border border-gray-100 bg-white p-6 font-mono">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificări & Credențiale</h3>
                  <ul className="space-y-2">
                    {authorData.credentials.map((credential: string) => (
                      <li key={credential} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>{credential}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Info Box */}
              <section className="rounded-lg border-l-4 border-brand bg-brand/10 p-6 font-mono">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Expert verificat
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Toate articolele și recenziile scrise de {authorData.firstName} sunt bazate pe experiență
                  reală și analiză detaliată. Informațiile sunt verificate și actualizate regulat pentru
                  a vă oferi cele mai corecte sfaturi.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
