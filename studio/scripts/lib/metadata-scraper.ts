// studio/scripts/lib/metadata-scraper.ts
// HTML scraping utility to extract metadata from WordPress pages

import * as cheerio from 'cheerio'

export interface ScrapedMetadata {
  title?: string
  metaDescription?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

/**
 * Fetch HTML from a URL with retry logic
 */
async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  timeout = 10000
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MetadataSync/1.0)',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to fetch ${url} after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw new Error('Unexpected error in fetchWithRetry')
}

/**
 * Parse HTML and extract metadata tags
 */
export function parseMetadata(html: string): ScrapedMetadata {
  const $ = cheerio.load(html)
  const metadata: ScrapedMetadata = {}

  // Extract <title> tag
  const titleTag = $('title').first().text().trim()
  if (titleTag) {
    metadata.title = titleTag
  }

  // Extract meta description
  const metaDesc = $('meta[name="description"]').attr('content')?.trim()
  if (metaDesc) {
    metadata.metaDescription = metaDesc
  }

  // Extract Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim()
  if (ogTitle) {
    metadata.ogTitle = ogTitle
  }

  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim()
  if (ogDesc) {
    metadata.ogDescription = ogDesc
  }

  const ogImage = $('meta[property="og:image"]').attr('content')?.trim()
  if (ogImage) {
    // Ensure it's an absolute URL
    try {
      const imageUrl = new URL(ogImage)
      metadata.ogImage = imageUrl.href
    } catch {
      // If relative URL, it's malformed or needs base URL resolution
      // Skip for now
    }
  }

  // Extract Twitter Card tags
  const twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim()
  if (twitterTitle) {
    metadata.twitterTitle = twitterTitle
  }

  const twitterDesc = $('meta[name="twitter:description"]').attr('content')?.trim()
  if (twitterDesc) {
    metadata.twitterDescription = twitterDesc
  }

  const twitterImage = $('meta[name="twitter:image"]').attr('content')?.trim()
  if (twitterImage) {
    try {
      const imageUrl = new URL(twitterImage)
      metadata.twitterImage = imageUrl.href
    } catch {
      // Skip malformed URLs
    }
  }

  return metadata
}

/**
 * Fetch and scrape metadata from a WordPress URL
 */
export async function scrapeMetadata(url: string): Promise<ScrapedMetadata> {
  try {
    console.log(`  📥 Fetching ${url}...`)
    const html = await fetchWithRetry(url)
    const metadata = parseMetadata(html)
    return metadata
  } catch (error) {
    throw new Error(
      `Failed to scrape ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Check if metadata has meaningful content
 */
export function hasMetadata(metadata: ScrapedMetadata): boolean {
  return !!(
    metadata.title ||
    metadata.metaDescription ||
    metadata.ogTitle ||
    metadata.ogDescription ||
    metadata.ogImage
  )
}

/**
 * Compare metadata and determine if update is needed
 */
export function needsUpdate(
  current: Partial<ScrapedMetadata>,
  scraped: ScrapedMetadata
): boolean {
  // Check if any field has changed
  if (current.title !== scraped.title && scraped.title) return true
  if (current.metaDescription !== scraped.metaDescription && scraped.metaDescription) return true
  if (current.ogTitle !== scraped.ogTitle && scraped.ogTitle) return true
  if (current.ogDescription !== scraped.ogDescription && scraped.ogDescription) return true
  if (current.ogImage !== scraped.ogImage && scraped.ogImage) return true
  if (current.twitterTitle !== scraped.twitterTitle && scraped.twitterTitle) return true
  if (current.twitterDescription !== scraped.twitterDescription && scraped.twitterDescription) return true
  if (current.twitterImage !== scraped.twitterImage && scraped.twitterImage) return true

  return false
}
