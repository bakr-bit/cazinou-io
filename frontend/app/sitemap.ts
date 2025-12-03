import {MetadataRoute} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {sitemapData} from '@/sanity/lib/queries'
import {headers} from 'next/headers'

/**
 * This file creates a sitemap (sitemap.xml) for the application. Learn more about sitemaps in Next.js here: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * Be sure to update the `changeFrequency` and `priority` values to match your application's content.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPostsAndPages = await sanityFetch({
    query: sitemapData,
  })
  const headersList = await headers()
  const sitemap: MetadataRoute.Sitemap = []
  const host = headersList.get('host') as string
  // Use SITE_URL from env or construct from host with https protocol
  const domain = process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`

  sitemap.push({
    url: `${domain}/`,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: 'monthly',
  })

  // Static index pages (not in Sanity CMS)
  sitemap.push(
    {url: `${domain}/recenzii/`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly'},
    {url: `${domain}/metode-de-plata/`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly'},
    {url: `${domain}/loto-online-keno/`, lastModified: new Date(), priority: 0.8, changeFrequency: 'weekly'},
    {url: `${domain}/pacanele-gratis/`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly'},
    {url: `${domain}/cazinouri-online/`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly'},
  )

  if (allPostsAndPages != null && allPostsAndPages.data.length != 0) {
    let priority: number
    let changeFrequency:
      | 'monthly'
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'yearly'
      | 'never'
      | undefined
    let url: string

    for (const p of allPostsAndPages.data) {
      switch (p._type) {
        case 'page':
          priority = 0.8
          changeFrequency = 'monthly'
          url = `${domain}/${p.slug}/`
          break
        case 'post':
          priority = 0.5
          changeFrequency = 'never'
          url = `${domain}/posts/${p.slug}/`
          break
        case 'casinoReview':
          priority = 0.9
          changeFrequency = 'weekly'
          url = `${domain}/casino/${p.slug}/`
          break
        case 'infoPage':
          priority = 0.8
          changeFrequency = 'monthly'
          url = `${domain}/${p.slug}/`
          break
        case 'loto':
          priority = 0.9
          changeFrequency = 'weekly'
          url = `${domain}/loto-online-keno/${p.slug}/`
          break
        case 'themedSlotsPage':
          priority = 0.85
          changeFrequency = 'weekly'
          url = `${domain}/pacanele-gratis/${p.slug}/`
          break
        case 'game':
          priority = 0.7
          changeFrequency = 'monthly'
          url = `${domain}/pacanele/${p.slug}/`
          break
        default:
          // Skip unknown document types
          continue
      }
      sitemap.push({
        lastModified: p._updatedAt || new Date(),
        priority,
        changeFrequency,
        url,
      })
    }
  }

  return sitemap
}
