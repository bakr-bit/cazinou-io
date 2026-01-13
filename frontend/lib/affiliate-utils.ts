/**
 * Utility functions for affiliate URL tracking
 */

/**
 * Appends tracking parameters to an affiliate URL
 *
 * @param affiliateLink - The base affiliate URL from Sanity CMS
 * @param pageSlug - The page slug (e.g., "homepage", "cazinouri-noi", "vlad-cazino")
 * @param componentType - The component type (e.g., "list_1", "button", "featured_banner_button")
 * @returns The affiliate URL with tracking parameters appended
 */
export function buildAffiliateUrl(
  affiliateLink: string | undefined | null,
  pageSlug: string,
  componentType: string
): string | undefined {
  if (!affiliateLink) {
    return undefined
  }

  try {
    const url = new URL(affiliateLink)
    url.searchParams.set('var1', pageSlug)
    url.searchParams.set('var2', componentType)
    return url.toString()
  } catch {
    // Fallback for malformed URLs - append params manually
    const separator = affiliateLink.includes('?') ? '&' : '?'
    return `${affiliateLink}${separator}var1=${encodeURIComponent(pageSlug)}&var2=${encodeURIComponent(componentType)}`
  }
}
