// studio/scripts/sync-metadata-from-wp.ts
// Sync metadata from live WordPress site to Sanity
// Usage: DRY_RUN=true TYPE=page SLUG=top-cazinouri-2025 npx sanity exec scripts/sync-metadata-from-wp.ts --with-user-token

import {getCliClient} from 'sanity/cli'
import {scrapeMetadata, hasMetadata, needsUpdate, type ScrapedMetadata} from './lib/metadata-scraper'
import {uploadImageToSanity} from './lib/image-uploader'

const WORDPRESS_BASE_URL = 'https://cazinou.io'

// Document types and their URL patterns
const DOCUMENT_TYPES = {
  page: (slug: string) => `/${slug}`,
  infoPage: (slug: string) => `/${slug}`,
  casinoReview: (slug: string) => `/recenzii/${slug}`,
  loto: (slug: string) => `/loto-online/${slug}`,
  themedSlotsPage: (slug: string) => `/pacanele-gratis/${slug}`,
  game: (slug: string) => `/pacanele/${slug}`,
  post: (slug: string) => `/posts/${slug}`,
}

interface SanityDocument {
  _id: string
  _type: string
  slug: {
    current: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogTitle?: string
    ogDescription?: string
    ogImage?: any
    twitterTitle?: string
    twitterDescription?: string
    twitterImage?: any
  }
  title?: string
  heading?: string
}

interface SyncStats {
  total: number
  updated: number
  skipped: number
  errors: number
  imagesUploaded: number
}

/**
 * Fetch all documents from Sanity
 */
async function fetchDocuments(client: any, type?: string, slug?: string): Promise<SanityDocument[]> {
  const typeFilter = type ? `_type == "${type}" && ` : ''
  const slugFilter = slug ? `slug.current == "${slug}" && ` : ''

  // Only fetch document types that have public pages
  const validTypes = ['page', 'infoPage', 'casinoReview', 'loto', 'themedSlotsPage', 'game', 'post']
  const typeConstraint = type ? '' : `_type in [${validTypes.map(t => `"${t}"`).join(', ')}] && `

  const query = `*[${typeConstraint}${typeFilter}${slugFilter}defined(slug.current)] {
    _id,
    _type,
    slug,
    seo {
      metaTitle,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage
    },
    title,
    heading
  }`

  return await client.fetch(query)
}

/**
 * Build WordPress URL from document
 */
function buildWordPressUrl(doc: SanityDocument): string | null {
  const urlBuilder = DOCUMENT_TYPES[doc._type as keyof typeof DOCUMENT_TYPES]
  if (!urlBuilder) {
    console.warn(`  ⚠️  Unknown document type: ${doc._type}`)
    return null
  }

  return `${WORDPRESS_BASE_URL}${urlBuilder(doc.slug.current)}`
}

/**
 * Update Sanity document with scraped metadata
 */
async function updateDocument(
  client: any,
  doc: SanityDocument,
  metadata: ScrapedMetadata,
  dryRun: boolean
): Promise<{ updated: boolean; imagesUploaded: number }> {
  const updates: any = {}
  let imagesUploaded = 0

  // Prepare SEO object updates
  if (metadata.title) {
    updates['seo.metaTitle'] = metadata.title
  }

  if (metadata.metaDescription) {
    updates['seo.metaDescription'] = metadata.metaDescription
  }

  if (metadata.ogTitle) {
    updates['seo.ogTitle'] = metadata.ogTitle
  }

  if (metadata.ogDescription) {
    updates['seo.ogDescription'] = metadata.ogDescription
  }

  if (metadata.twitterTitle) {
    updates['seo.twitterTitle'] = metadata.twitterTitle
  }

  if (metadata.twitterDescription) {
    updates['seo.twitterDescription'] = metadata.twitterDescription
  }

  // Handle OG image
  if (metadata.ogImage) {
    const uploadedOgImage = await uploadImageToSanity(client, metadata.ogImage, dryRun)
    if (uploadedOgImage) {
      updates['seo.ogImage'] = uploadedOgImage
      imagesUploaded++
    }
  }

  // Handle Twitter image
  if (metadata.twitterImage && metadata.twitterImage !== metadata.ogImage) {
    const uploadedTwitterImage = await uploadImageToSanity(client, metadata.twitterImage, dryRun)
    if (uploadedTwitterImage) {
      updates['seo.twitterImage'] = uploadedTwitterImage
      imagesUploaded++
    }
  }

  // Check if there are any updates
  if (Object.keys(updates).length === 0) {
    return { updated: false, imagesUploaded: 0 }
  }

  if (dryRun) {
    console.log(`  📝 [DRY RUN] Would update:`)
    Object.entries(updates).forEach(([key, value]) => {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : value
      console.log(`    - ${key}: ${displayValue}`)
    })
    return { updated: false, imagesUploaded }
  }

  // Apply updates
  try {
    await client
      .patch(doc._id)
      .set(updates)
      .commit()

    console.log(`  ✅ Updated ${Object.keys(updates).length} field(s)`)
    return { updated: true, imagesUploaded }
  } catch (error) {
    console.error(`  ❌ Failed to update document:`, error instanceof Error ? error.message : 'Unknown error')
    return { updated: false, imagesUploaded: 0 }
  }
}

/**
 * Process a single document
 */
async function processDocument(
  client: any,
  doc: SanityDocument,
  stats: SyncStats,
  dryRun: boolean
): Promise<void> {
  const wpUrl = buildWordPressUrl(doc)
  if (!wpUrl) {
    console.log(`❌ [${stats.total}] ${doc._type}: ${doc.slug.current}`)
    console.log(`  ⚠️  Could not build WordPress URL`)
    stats.errors++
    return
  }

  const docTitle = doc.title || doc.heading || doc.slug.current
  console.log(`\n🔄 [${stats.total}/${stats.total}] ${doc._type}: ${docTitle}`)
  console.log(`  🔗 ${wpUrl}`)

  try {
    // Scrape metadata from WordPress
    const metadata = await scrapeMetadata(wpUrl)

    // Check if metadata was found
    if (!hasMetadata(metadata)) {
      console.log(`  ⚠️  No metadata found (page might not exist)`)
      stats.skipped++
      return
    }

    // Check if update is needed
    const currentMeta = {
      title: doc.seo?.metaTitle,
      metaDescription: doc.seo?.metaDescription,
      ogTitle: doc.seo?.ogTitle,
      ogDescription: doc.seo?.ogDescription,
      ogImage: doc.seo?.ogImage?.asset?._ref,
      twitterTitle: doc.seo?.twitterTitle,
      twitterDescription: doc.seo?.twitterDescription,
      twitterImage: doc.seo?.twitterImage?.asset?._ref,
    }

    if (!needsUpdate(currentMeta, metadata)) {
      console.log(`  ✓ Already up to date`)
      stats.skipped++
      return
    }

    // Update document
    const result = await updateDocument(client, doc, metadata, dryRun)
    if (result.updated) {
      stats.updated++
    } else {
      stats.skipped++
    }
    stats.imagesUploaded += result.imagesUploaded
  } catch (error) {
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    stats.errors++
  }
}

/**
 * Main sync function
 */
async function sync(options: {
  dryRun: boolean
  type?: string
  slug?: string
}) {
  const client = getCliClient()

  console.log(`\n🔄 Starting metadata sync from ${WORDPRESS_BASE_URL}...`)
  if (options.dryRun) {
    console.log(`🧪 DRY RUN MODE - No changes will be made\n`)
  }

  // Fetch documents
  console.log(`📋 Fetching documents from Sanity...`)
  const documents = await fetchDocuments(client, options.type, options.slug)

  if (documents.length === 0) {
    console.log(`❌ No documents found${options.slug ? ` with slug: ${options.slug}` : ''}`)
    return
  }

  console.log(`📋 Found ${documents.length} document(s) to sync\n`)

  const stats: SyncStats = {
    total: documents.length,
    updated: 0,
    skipped: 0,
    errors: 0,
    imagesUploaded: 0,
  }

  // Process each document
  for (let i = 0; i < documents.length; i++) {
    await processDocument(client, documents[i], stats, options.dryRun)

    // Add a small delay between requests to be nice to the WordPress server
    if (i < documents.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Print summary
  console.log(`\n📊 Sync Summary:`)
  console.log(`  Total documents: ${stats.total}`)
  console.log(`  Updated: ${stats.updated}`)
  console.log(`  Skipped (no changes): ${stats.skipped}`)
  console.log(`  Errors: ${stats.errors}`)
  console.log(`  Images uploaded: ${stats.imagesUploaded}`)

  if (options.dryRun) {
    console.log(`\n🧪 This was a DRY RUN. Run without --dry-run to apply changes.`)
  }

  console.log(`\n✅ Sync complete!\n`)
}

// Read options from environment variables
const options = {
  dryRun: process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1',
  type: process.env.TYPE,
  slug: process.env.SLUG,
}

// Run the sync
sync(options).catch((error) => {
  console.error(`\n❌ Fatal error:`, error)
  process.exit(1)
})
