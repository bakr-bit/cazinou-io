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
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
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
      contactType: 'customer service',
      availableLanguage: ORGANIZATION_DATA.language,
    },
    areaServed: ORGANIZATION_DATA.areaServed,
    knowsLanguage: ORGANIZATION_DATA.language,
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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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
