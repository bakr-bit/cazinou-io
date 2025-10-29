import {getCliClient} from 'sanity/cli'
import {JSDOM} from 'jsdom'

const client = getCliClient()

// Configuration
const LIVE_SITE_BASE = 'https://cazinou.io'
const DOCUMENT_TYPE = 'casinoReview'
const URL_PATH_PREFIX = '/casino'
const RATE_LIMIT_MS = 500 // Wait 500ms between requests

// Parse CLI arguments
const args = process.argv.slice(2)
const APPLY_CHANGES = args.includes('--apply')
const DRY_RUN = !APPLY_CHANGES

interface CasinoReviewDoc {
  _id: string
  title: string
  slug: {
    current: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogTitle?: string
    ogDescription?: string
    twitterTitle?: string
    twitterDescription?: string
    modifiedAt?: string
  }
}

interface ScrapedMetadata {
  metaTitle: string | null
  metaDescription: string | null
  ogTitle: string | null
  ogDescription: string | null
  twitterTitle: string | null
  twitterDescription: string | null
}

interface UpdateResult {
  _id: string
  slug: string
  url: string
  status: 'updated' | 'skipped' | 'error'
  message: string
  oldMetadata?: any
  newMetadata?: any
}

/**
 * Fetch HTML from URL and extract metadata
 */
async function scrapeMetadata(url: string): Promise<ScrapedMetadata | null> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.log(`   ⚠️  HTTP ${response.status} for ${url}`)
      return null
    }

    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Helper to get meta content
    const getMeta = (selector: string): string | null => {
      const element = document.querySelector(selector)
      return element?.getAttribute('content') || null
    }

    // Extract metadata
    const metadata: ScrapedMetadata = {
      metaTitle: document.querySelector('title')?.textContent?.trim() || null,
      metaDescription: getMeta('meta[name="description"]'),
      ogTitle: getMeta('meta[property="og:title"]'),
      ogDescription: getMeta('meta[property="og:description"]'),
      twitterTitle: getMeta('meta[name="twitter:title"]'),
      twitterDescription: getMeta('meta[name="twitter:description"]'),
    }

    return metadata
  } catch (error) {
    console.log(`   ❌ Failed to fetch ${url}:`, (error as Error).message)
    return null
  }
}

/**
 * Compare old and new metadata and show differences
 */
function showComparison(doc: CasinoReviewDoc, scraped: ScrapedMetadata): boolean {
  const old = doc.seo || {}
  let hasChanges = false

  console.log(`\n   📊 Comparison for: ${doc.title}`)
  console.log(`   ${'-'.repeat(60)}`)

  const fields: Array<{key: keyof ScrapedMetadata; label: string}> = [
    {key: 'metaTitle', label: 'Meta Title'},
    {key: 'metaDescription', label: 'Meta Description'},
    {key: 'ogTitle', label: 'OG Title'},
    {key: 'ogDescription', label: 'OG Description'},
    {key: 'twitterTitle', label: 'Twitter Title'},
    {key: 'twitterDescription', label: 'Twitter Description'},
  ]

  for (const {key, label} of fields) {
    const oldValue = old[key] || '(empty)'
    const newValue = scraped[key] || '(empty)'

    if (oldValue !== newValue) {
      hasChanges = true
      console.log(`   📝 ${label}:`)
      console.log(`      OLD: ${oldValue}`)
      console.log(`      NEW: ${newValue}`)
    }
  }

  if (!hasChanges) {
    console.log(`   ✅ No changes needed - metadata already matches`)
  }

  return hasChanges
}

/**
 * Update a single document in Sanity
 */
async function updateDocument(
  doc: CasinoReviewDoc,
  metadata: ScrapedMetadata,
): Promise<void> {
  const updates: any = {}

  // Only set non-null values
  if (metadata.metaTitle) updates['seo.metaTitle'] = metadata.metaTitle
  if (metadata.metaDescription) updates['seo.metaDescription'] = metadata.metaDescription
  if (metadata.ogTitle) updates['seo.ogTitle'] = metadata.ogTitle
  if (metadata.ogDescription) updates['seo.ogDescription'] = metadata.ogDescription
  if (metadata.twitterTitle) updates['seo.twitterTitle'] = metadata.twitterTitle
  if (metadata.twitterDescription)
    updates['seo.twitterDescription'] = metadata.twitterDescription

  // Set modified timestamp
  updates['seo.modifiedAt'] = new Date().toISOString()

  if (Object.keys(updates).length > 0) {
    await client.patch(doc._id).set(updates).commit()
  }
}

/**
 * Process a single document
 */
async function processDocument(doc: CasinoReviewDoc): Promise<UpdateResult> {
  const slug = doc.slug.current
  const url = `${LIVE_SITE_BASE}${URL_PATH_PREFIX}/${slug}`

  console.log(`\n🔍 Processing: ${slug}`)
  console.log(`   URL: ${url}`)

  // Scrape metadata from live site
  const metadata = await scrapeMetadata(url)

  if (!metadata) {
    return {
      _id: doc._id,
      slug,
      url,
      status: 'skipped',
      message: 'Page not found or failed to fetch',
    }
  }

  // Show comparison
  const hasChanges = showComparison(doc, metadata)

  if (!hasChanges) {
    return {
      _id: doc._id,
      slug,
      url,
      status: 'skipped',
      message: 'No changes needed',
    }
  }

  // Update if not in dry-run mode
  if (APPLY_CHANGES) {
    try {
      await updateDocument(doc, metadata)
      console.log(`   ✅ Updated successfully`)
      return {
        _id: doc._id,
        slug,
        url,
        status: 'updated',
        message: 'Updated successfully',
        oldMetadata: doc.seo,
        newMetadata: metadata,
      }
    } catch (error) {
      console.log(`   ❌ Failed to update:`, (error as Error).message)
      return {
        _id: doc._id,
        slug,
        url,
        status: 'error',
        message: (error as Error).message,
      }
    }
  } else {
    console.log(`   🔸 Would update (dry-run mode)`)
    return {
      _id: doc._id,
      slug,
      url,
      status: 'skipped',
      message: 'Dry-run mode - would update',
      newMetadata: metadata,
    }
  }
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🚀 Bulk Metadata Update from Live Site')
  console.log('='.repeat(70))
  console.log(`📍 Live site: ${LIVE_SITE_BASE}`)
  console.log(`📄 Document type: ${DOCUMENT_TYPE}`)
  console.log(`🔧 Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'APPLY CHANGES'}`)
  console.log('='.repeat(70))

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made to Sanity')
    console.log('💡 Use --apply flag to actually update documents\n')
  }

  // Fetch all casinoReview documents
  console.log('\n📥 Fetching documents from Sanity...')
  const documents = await client.fetch<CasinoReviewDoc[]>(`
    *[_type == $docType] | order(title asc) {
      _id,
      title,
      slug,
      seo
    }
  `, {docType: DOCUMENT_TYPE})

  console.log(`✅ Found ${documents.length} documents\n`)

  if (documents.length === 0) {
    console.log('No documents found. Exiting.')
    return
  }

  // Process each document
  const results: UpdateResult[] = []

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    console.log(`\n[${ i + 1}/${documents.length}]`)

    try {
      const result = await processDocument(doc)
      results.push(result)
    } catch (error) {
      console.error(`❌ Unexpected error processing ${doc.slug.current}:`, error)
      results.push({
        _id: doc._id,
        slug: doc.slug.current,
        url: `${LIVE_SITE_BASE}${URL_PATH_PREFIX}/${doc.slug.current}`,
        status: 'error',
        message: (error as Error).message,
      })
    }

    // Rate limiting
    if (i < documents.length - 1) {
      await sleep(RATE_LIMIT_MS)
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 SUMMARY')
  console.log('='.repeat(70))

  const updated = results.filter((r) => r.status === 'updated').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const errors = results.filter((r) => r.status === 'error').length

  console.log(`✅ Updated: ${updated}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`📦 Total: ${results.length}`)

  // Show errors if any
  if (errors > 0) {
    console.log('\n⚠️  Documents with errors:')
    results
      .filter((r) => r.status === 'error')
      .forEach((r) => {
        console.log(`   - ${r.slug}: ${r.message}`)
      })
  }

  // Show skipped if any
  const skippedDocs = results.filter(
    (r) => r.status === 'skipped' && r.message.includes('not found'),
  )
  if (skippedDocs.length > 0) {
    console.log('\n⏭️  Documents not found on live site:')
    skippedDocs.forEach((r) => {
      console.log(`   - ${r.slug}`)
    })
  }

  console.log('\n' + '='.repeat(70))

  if (DRY_RUN && updated === 0) {
    const wouldUpdate = results.filter((r) => r.message.includes('would update')).length
    if (wouldUpdate > 0) {
      console.log(`\n💡 Run with --apply flag to update ${wouldUpdate} documents`)
    }
  }

  console.log('\n✅ Done!\n')
}

// Execute
main().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
