/**
 * SEO & JSON-LD Schema.org Utilities
 *
 * Generate structured data for casino reviews to improve SEO and rich results.
 */

import {Metadata} from 'next'
import {resolveOpenGraphImage} from './utils'

/**
 * Generate SEO metadata for pages
 */
export function generateSEO(options: {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: any
  canonicalUrl?: string
  article?: {
    publishedTime?: string
    modifiedTime?: string
    authors?: string[]
    tags?: string[]
  }
}): Metadata {
  const {title, description, ogTitle, ogDescription, ogImage, canonicalUrl, article} = options

  const openGraphImage = ogImage ? resolveOpenGraphImage(ogImage) : undefined
  const images = openGraphImage ? [openGraphImage] : []

  return {
    title,
    description,
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
    openGraph: {
      title: ogTitle || title,
      description: ogDescription || description,
      images,
      ...(canonicalUrl && {url: canonicalUrl}),
      ...(article && {
        type: 'article',
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
        authors: article.authors,
        tags: article.tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle || title,
      description: ogDescription || description,
      ...(images.length > 0 && {images}),
    },
  }
}

type JsonLdOptions = {
  review: any
  casino: any
  author: any
  siteUrl: string
}

/**
 * Generate Person JSON-LD for author
 */
export function generatePersonJsonLd(person: any, siteUrl: string): Record<string, any> {
  const fullName = `${person.firstName} ${person.lastName}`
  const authorUrl = `${siteUrl}/autori/${person.slug?.current}`

  const sameAs = []
  if (person.socialMedia?.linkedin) sameAs.push(person.socialMedia.linkedin)
  if (person.socialMedia?.twitter) sameAs.push(person.socialMedia.twitter)
  if (person.socialMedia?.facebook) sameAs.push(person.socialMedia.facebook)
  if (person.socialMedia?.instagram) sameAs.push(person.socialMedia.instagram)
  if (person.socialMedia?.website) sameAs.push(person.socialMedia.website)

  return {
    '@type': 'Person',
    '@id': authorUrl,
    name: fullName,
    url: authorUrl,
    ...(person.picture?.asset?.url && {image: person.picture.asset.url}),
    ...(person.role && {jobTitle: person.role}),
    ...(person.bio && {description: person.bio}),
    ...(person.expertise && person.expertise.length > 0 && {knowsAbout: person.expertise}),
    ...(sameAs.length > 0 && {sameAs}),
  }
}

/**
 * Generate Organization JSON-LD for casino operator
 */
export function generateCasinoOrganizationJsonLd(casino: any): Record<string, any> | null {
  if (!casino.companyInfo?.websiteUrl) return null

  const license = casino.companyInfo.licenses?.[0]

  return {
    '@type': 'Organization',
    name: casino.name,
    url: casino.companyInfo.websiteUrl,
    ...(casino.logo && {
      logo: casino.logo,
      image: casino.logo,
    }),
    ...(casino.legalEntity && {legalName: casino.legalEntity}),
    ...(casino.companyInfo.establishedYear && {
      foundingDate: `${casino.companyInfo.establishedYear}`,
    }),
    ...(license && {
      license: `${license.license} - ${license.licenseNumber}`,
    }),
  }
}

/**
 * Generate Review JSON-LD
 */
export function generateReviewJsonLd({
  review,
  casino,
  author,
  siteUrl,
}: JsonLdOptions): Record<string, any> {
  const reviewUrl = `${siteUrl}/casino/${review.slug?.current}`
  const authorData = generatePersonJsonLd(author, siteUrl)

  // Convert 1-10 rating to 1-5 for schema.org
  const normalizedRating = casino.rating ? (casino.rating / 2).toFixed(1) : '0'

  return {
    '@type': 'Review',
    '@id': reviewUrl,
    url: reviewUrl,
    headline: review.title,
    ...(review.excerpt && {description: review.excerpt}),
    datePublished: review.publishedAt,
    ...(review.seo?.modifiedAt && {dateModified: review.seo.modifiedAt}),
    author: authorData,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: normalizedRating,
      bestRating: '5',
      worstRating: '1',
    },
    itemReviewed: {
      '@type': 'WebSite',
      name: casino.name,
      ...(casino.companyInfo?.websiteUrl && {url: casino.companyInfo.websiteUrl}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cazinou.io',
      url: siteUrl,
    },
  }
}

/**
 * Generate Article JSON-LD
 */
export function generateArticleJsonLd({
  review,
  casino,
  author,
  siteUrl,
}: JsonLdOptions): Record<string, any> {
  const reviewUrl = `${siteUrl}/casino/${review.slug?.current}`
  const authorData = generatePersonJsonLd(author, siteUrl)

  return {
    '@type': 'Article',
    '@id': reviewUrl,
    headline: review.title,
    ...(review.excerpt && {description: review.excerpt}),
    datePublished: review.publishedAt,
    ...(review.seo?.modifiedAt && {dateModified: review.seo.modifiedAt}),
    author: authorData,
    publisher: {
      '@type': 'Organization',
      name: 'Cazinou.io',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': reviewUrl,
    },
    ...(casino.logo && {image: casino.logo}),
  }
}

/**
 * Generate FAQPage JSON-LD
 */
export function generateFAQJsonLd(review: any, siteUrl: string): Record<string, any> | null {
  if (!review.faq || review.faq.length === 0) return null

  const reviewUrl = `${siteUrl}/casino/${review.slug?.current}`

  return {
    '@type': 'FAQPage',
    '@id': `${reviewUrl}#faq`,
    mainEntity: review.faq.map((item: any) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * Generate complete JSON-LD graph for review page
 */
export function generateCompleteReviewJsonLd(options: JsonLdOptions): Record<string, any> {
  const {review, casino, siteUrl} = options

  const graph: any[] = [
    generateReviewJsonLd(options),
    generateArticleJsonLd(options),
    generatePersonJsonLd(options.author, siteUrl),
  ]

  // Add casino organization if available
  const orgJsonLd = generateCasinoOrganizationJsonLd(casino)
  if (orgJsonLd) {
    graph.push(orgJsonLd)
  }

  // Add FAQ if available
  const faqJsonLd = generateFAQJsonLd(review, siteUrl)
  if (faqJsonLd) {
    graph.push(faqJsonLd)
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
