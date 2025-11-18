import {MetadataRoute} from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cazinou.io'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/sanity/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
