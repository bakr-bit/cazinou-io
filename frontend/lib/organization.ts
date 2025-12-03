/**
 * Centralized organization data and JSON-LD schema generators
 * for Cazinou.io structured data
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cazinou.io'

/**
 * Organization data constants
 */
export const ORGANIZATION_DATA = {
  name: 'Cazinou.io',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/cazinou-logo.png`,
  description: 'Portal de recenzii de cazinouri online internaționale',
  foundingDate: '2024',
  email: 'andrei@cazinou.io',
  areaServed: 'RO',
  language: 'ro',
} as const

/**
 * Founder/Author data
 */
export const FOUNDER_DATA = {
  name: 'Andrei Gavrila',
  url: `${SITE_URL}/author/andreigavrila/`,
  image: `${SITE_URL}/images/andrei-gavrila.jpg`,
} as const

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema() {
  return {
    '@type': ['EntertainmentBusiness', 'Organization'],
    '@id': `${SITE_URL}/#organization`,
    name: ORGANIZATION_DATA.name,
    url: ORGANIZATION_DATA.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: ORGANIZATION_DATA.logo,
      contentUrl: ORGANIZATION_DATA.logo,
      caption: ORGANIZATION_DATA.name,
    },
    image: {
      '@id': `${SITE_URL}/#logo`,
    },
    description: ORGANIZATION_DATA.description,
    foundingDate: ORGANIZATION_DATA.foundingDate,
    contactPoint: {
      '@type': 'ContactPoint',
      email: ORGANIZATION_DATA.email,
      contactType: 'editorial',
      availableLanguage: ORGANIZATION_DATA.language,
    },
    areaServed: ORGANIZATION_DATA.areaServed,
    knowsLanguage: ORGANIZATION_DATA.language,
  }
}

/**
 * Generate Person JSON-LD schema for founder/main author
 */
export function generateFounderSchema() {
  return {
    '@type': 'Person',
    '@id': FOUNDER_DATA.url,
    name: FOUNDER_DATA.name,
    url: FOUNDER_DATA.url,
    image: {
      '@type': 'ImageObject',
      url: FOUNDER_DATA.image,
    },
    worksFor: {
      '@id': `${SITE_URL}/#organization`,
    },
  }
}

/**
 * Generate WebSite JSON-LD schema
 */
export function generateWebSiteSchema(options?: {
  name?: string
  description?: string
}) {
  const siteName = options?.name || ORGANIZATION_DATA.name
  const siteDescription =
    options?.description ||
    'Site-ul tău de recenzii de cazinouri străine. Găsește cele mai bune cazinouri online internaționale, jocuri, bonusuri și recenzii detaliate.'

  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: siteName,
    url: ORGANIZATION_DATA.url,
    description: siteDescription,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: ORGANIZATION_DATA.language,
  }
}

/**
 * Generate combined WebSite + Organization JSON-LD graph
 * Use this on homepage and pillar pages
 */
export function generateOrganizationGraph(options?: {
  siteName?: string
  siteDescription?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateOrganizationSchema(),
      generateWebSiteSchema({
        name: options?.siteName,
        description: options?.siteDescription,
      }),
    ],
  }
}

/**
 * Generate WebPage JSON-LD schema for specific pages
 */
export function generateWebPageSchema(options: {
  name: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
}) {
  return {
    '@type': 'WebPage',
    '@id': `${options.url}#webpage`,
    name: options.name,
    description: options.description,
    url: options.url,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: ORGANIZATION_DATA.language,
    ...(options.datePublished && {datePublished: options.datePublished}),
    ...(options.dateModified && {dateModified: options.dateModified}),
  }
}

/**
 * Generate complete page schema with WebSite, Organization, and WebPage
 */
export function generatePageSchema(options: {
  pageName: string
  pageDescription: string
  pageUrl: string
  datePublished?: string
  dateModified?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      generateOrganizationSchema(),
      generateWebSiteSchema(),
      generateWebPageSchema({
        name: options.pageName,
        description: options.pageDescription,
        url: options.pageUrl,
        datePublished: options.datePublished,
        dateModified: options.dateModified,
      }),
    ],
  }
}

/**
 * Generate FAQPage JSON-LD schema
 */
export function generateFAQSchema(faqs: Array<{question: string; answer: string}>) {
  if (!faqs || faqs.length === 0) return null

  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate homepage schema with Organization, WebSite, Person, and optional FAQ
 */
export function generateHomepageGraph(options?: {
  faqs?: Array<{question: string; answer: string}>
}) {
  const graph: any[] = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    generateFounderSchema(),
  ]

  // Add FAQ if provided
  if (options?.faqs && options.faqs.length > 0) {
    const faqSchema = generateFAQSchema(options.faqs)
    if (faqSchema) {
      graph.push(faqSchema)
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
