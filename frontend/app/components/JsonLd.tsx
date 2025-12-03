/**
 * JsonLd component for injecting Schema.org structured data
 * Learn more: https://schema.org/
 */

type JsonLdProps = {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Schema.org helper functions for common structured data types
 */

export const schemaHelpers = {
  /**
   * Website schema for homepage
   */
  website: (siteUrl: string, siteName: string, description: string) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    description: description,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }),

  /**
   * Casino review schema (LocalBusiness + Review)
   */
  casinoReview: (data: {
    name: string
    url: string
    rating?: number
    reviewCount?: number
    description?: string
    image?: string
    welcomeBonus?: string
    licenses?: Array<{license?: string; licenseAuthority?: string}>
    establishedYear?: number
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'LocalBusiness',
      '@id': data.url,
      name: data.name,
      description: data.description,
      image: data.image,
      ...(data.establishedYear && { foundingDate: data.establishedYear.toString() }),
      ...(data.rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          bestRating: 10,
          worstRating: 0,
          ...(data.reviewCount && { reviewCount: data.reviewCount }),
        },
      }),
    },
    ...(data.rating && {
      reviewRating: {
        '@type': 'Rating',
        ratingValue: data.rating,
        bestRating: 10,
        worstRating: 0,
      },
    }),
  }),

  /**
   * Game schema (VideoGame)
   */
  game: (data: {
    name: string
    url: string
    description?: string
    image?: string
    provider?: string
    rating?: number
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: data.name,
    url: data.url,
    ...(data.description && { description: data.description }),
    ...(data.image && { image: data.image }),
    ...(data.provider && {
      publisher: {
        '@type': 'Organization',
        name: data.provider,
      },
    }),
    ...(data.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.rating,
        bestRating: 5,
        worstRating: 0,
      },
    }),
    gamePlatform: 'Web Browser',
    genre: 'Casino Game',
  }),

  /**
   * Article schema for blog posts and info pages
   */
  article: (data: {
    headline: string
    url: string
    datePublished?: string
    dateModified?: string
    author?: {name: string; url?: string}
    image?: string
    description?: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    url: data.url,
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
    ...(data.author && {
      author: {
        '@type': 'Person',
        name: data.author.name,
        ...(data.author.url && { url: data.author.url }),
      },
    }),
    ...(data.image && { image: data.image }),
    ...(data.description && { description: data.description }),
  }),

  /**
   * FAQ Page schema
   */
  faqPage: (faqs: Array<{question: string; answer: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  /**
   * Breadcrumb schema
   */
  breadcrumb: (items: Array<{name: string; url: string}>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  /**
   * Organization schema (enhanced)
   */
  organization: (data: {
    name: string
    url: string
    logo?: string
    description?: string
    sameAs?: string[]
    foundingDate?: string
    legalName?: string
    email?: string
    areaServed?: string
    knowsLanguage?: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    ...(data.logo && {
      logo: {
        '@type': 'ImageObject',
        url: data.logo,
        contentUrl: data.logo,
      },
    }),
    ...(data.description && {description: data.description}),
    ...(data.sameAs && {sameAs: data.sameAs}),
    ...(data.foundingDate && {foundingDate: data.foundingDate}),
    ...(data.legalName && {legalName: data.legalName}),
    ...(data.email && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: data.email,
        contactType: 'customer service',
      },
    }),
    ...(data.areaServed && {areaServed: data.areaServed}),
    ...(data.knowsLanguage && {knowsLanguage: data.knowsLanguage}),
  }),
}
