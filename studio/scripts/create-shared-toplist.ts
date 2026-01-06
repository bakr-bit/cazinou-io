/**
 * Migration script: Create a shared toplist document from an existing inline toplist
 *
 * This script:
 * 1. Finds pages with toplists that have exactly 59 items (or specify a count)
 * 2. Shows which pages have matching toplists
 * 3. Creates a new toplist document from one of them
 *
 * Run with:
 *   npx sanity exec scripts/create-shared-toplist.ts --with-user-token -- --dry-run
 *   npx sanity exec scripts/create-shared-toplist.ts --with-user-token -- --source-id=<pageId>
 */

import {getCliClient} from 'sanity/cli'
import {nanoid} from 'nanoid'

const client = getCliClient()

type ListItem = {
  _key: string
  item?: {
    _ref: string
    _type: 'reference'
  }
  customDescription?: string
}

type DisplayOptions = {
  showRank?: boolean
  showLogo?: boolean
  showName?: boolean
  showBonus?: boolean
  showRating?: boolean
  showDescription?: boolean
  showLicense?: boolean
  showActions?: boolean
  showPaymentMethods?: boolean
  showKeyFeatures?: boolean
  showPlatformBadges?: boolean
  showDepositLimits?: boolean
  showGameCount?: boolean
  showEstablishedYear?: boolean
}

type TopListObject = {
  _type: 'topListObject'
  _key: string
  title?: string
  description?: string
  listItems?: ListItem[]
  displayOptions?: DisplayOptions
}

type DocumentWithToplist = {
  _id: string
  _type: string
  name?: string
  title?: string
  slug?: {current: string}
  content?: TopListObject[]
  pageBuilder?: TopListObject[]
}

// Default identifier for the new shared toplist
const DEFAULT_IDENTIFIER = 'main-casino-list'

async function findToplistsWithItemCount(itemCount: number = 59) {
  console.log(`\n🔍 Finding all toplists with ${itemCount} items...\n`)

  const query = `*[
    _type in ["homePage", "infoPage", "lotoPageSettings", "page", "loto", "themedSlotsPage"]
    && (
      count(content[_type == "topListObject" && count(listItems) == ${itemCount}]) > 0 ||
      count(pageBuilder[_type == "topListObject" && count(listItems) == ${itemCount}]) > 0
    )
  ] {
    _id,
    _type,
    name,
    title,
    slug,
    "toplists": content[_type == "topListObject" && count(listItems) == ${itemCount}] {
      _key,
      title,
      "itemCount": count(listItems)
    },
    "pageBuilderToplists": pageBuilder[_type == "topListObject" && count(listItems) == ${itemCount}] {
      _key,
      title,
      "itemCount": count(listItems)
    }
  }`

  const documents = await client.fetch<DocumentWithToplist[]>(query)

  console.log(`Found ${documents.length} documents with ${itemCount}-item toplists:\n`)

  for (const doc of documents) {
    const displayName = doc.name || doc.title || doc._id
    const slug = doc.slug?.current || 'no-slug'
    console.log(`📄 ${doc._type}: ${displayName}`)
    console.log(`   ID: ${doc._id}`)
    console.log(`   Slug: /${slug}`)

    const allToplists = [
      ...(doc.toplists || []).map(t => ({...t, field: 'content'})),
      ...(doc.pageBuilderToplists || []).map(t => ({...t, field: 'pageBuilder'})),
    ]

    for (const tl of allToplists) {
      console.log(`   - "${tl.title}" (${tl.itemCount} items) in ${tl.field}`)
    }
    console.log('')
  }

  return documents
}

async function getFullToplistData(docId: string, arrayField: 'content' | 'pageBuilder', toplistKey: string) {
  const query = `*[_id == $docId][0] {
    "${arrayField}": ${arrayField}[_type == "topListObject" && _key == $toplistKey][0] {
      _key,
      title,
      description,
      listItems[] {
        _key,
        item,
        customDescription
      },
      displayOptions
    }
  }`

  const result = await client.fetch(query, {docId, toplistKey})
  return result[arrayField] as TopListObject
}

async function createToplistDocument(
  sourceToplist: TopListObject,
  identifier: string = DEFAULT_IDENTIFIER
) {
  console.log(`\n📝 Creating new toplist document...`)
  console.log(`   Identifier: ${identifier}`)
  console.log(`   Title: ${sourceToplist.title}`)
  console.log(`   Items: ${sourceToplist.listItems?.length || 0}`)

  // Generate new _key values for listItems to avoid conflicts
  const listItemsWithNewKeys = sourceToplist.listItems?.map(item => ({
    ...item,
    _key: nanoid(12),
  }))

  const newDocument = {
    _type: 'toplist',
    identifier,
    title: sourceToplist.title || 'Main Casino List',
    description: sourceToplist.description,
    listItems: listItemsWithNewKeys,
    displayOptions: sourceToplist.displayOptions,
  }

  const created = await client.create(newDocument)

  console.log(`\n✅ Created toplist document!`)
  console.log(`   Document ID: ${created._id}`)
  console.log(`   Open in Studio: /structure/toplist;${created._id}`)

  return created
}

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const itemCountArg = args.find(a => a.startsWith('--count='))
  const sourceIdArg = args.find(a => a.startsWith('--source-id='))
  const identifierArg = args.find(a => a.startsWith('--identifier='))

  const itemCount = itemCountArg ? parseInt(itemCountArg.split('=')[1]) : 59
  const sourceId = sourceIdArg?.split('=')[1]
  const identifier = identifierArg?.split('=')[1] || DEFAULT_IDENTIFIER

  if (isDryRun) {
    console.log('='.repeat(60))
    console.log('DRY RUN MODE - No changes will be made')
    console.log('='.repeat(60))

    await findToplistsWithItemCount(itemCount)

    console.log('\n📋 To create a shared toplist from one of these, run:')
    console.log('   npx sanity exec scripts/create-shared-toplist.ts --with-user-token -- --source-id=<PAGE_ID>')
    console.log('\n   Options:')
    console.log('   --count=N         Find toplists with N items (default: 59)')
    console.log('   --identifier=NAME Set the identifier for the new document')
    return
  }

  if (!sourceId) {
    console.error('❌ Error: --source-id is required')
    console.log('\nUsage:')
    console.log('  First, run with --dry-run to see available toplists:')
    console.log('    npx sanity exec scripts/create-shared-toplist.ts --with-user-token -- --dry-run')
    console.log('')
    console.log('  Then, create the shared toplist:')
    console.log('    npx sanity exec scripts/create-shared-toplist.ts --with-user-token -- --source-id=<PAGE_ID>')
    process.exit(1)
  }

  // Find the toplist in the source document
  console.log(`\n🔍 Looking for toplist in document: ${sourceId}`)

  const query = `*[_id == $sourceId][0] {
    _id,
    _type,
    name,
    title,
    "contentToplists": content[_type == "topListObject"] {
      _key,
      title,
      "itemCount": count(listItems)
    },
    "pageBuilderToplists": pageBuilder[_type == "topListObject"] {
      _key,
      title,
      "itemCount": count(listItems)
    }
  }`

  const sourceDoc = await client.fetch(query, {sourceId})

  if (!sourceDoc) {
    console.error(`❌ Document not found: ${sourceId}`)
    process.exit(1)
  }

  const allToplists = [
    ...(sourceDoc.contentToplists || []).map((t: any) => ({...t, field: 'content' as const})),
    ...(sourceDoc.pageBuilderToplists || []).map((t: any) => ({...t, field: 'pageBuilder' as const})),
  ]

  if (allToplists.length === 0) {
    console.error(`❌ No toplists found in document: ${sourceId}`)
    process.exit(1)
  }

  // Use the first toplist with the target item count, or the first one
  const targetToplist = allToplists.find(t => t.itemCount === itemCount) || allToplists[0]

  console.log(`\n📄 Source document: ${sourceDoc.name || sourceDoc.title || sourceId}`)
  console.log(`   Using toplist: "${targetToplist.title}" (${targetToplist.itemCount} items)`)

  // Get full toplist data
  const fullToplist = await getFullToplistData(sourceId, targetToplist.field, targetToplist._key)

  if (!fullToplist) {
    console.error(`❌ Could not fetch full toplist data`)
    process.exit(1)
  }

  // Create the new document
  const created = await createToplistDocument(fullToplist, identifier)

  console.log('\n' + '='.repeat(60))
  console.log('NEXT STEPS:')
  console.log('='.repeat(60))
  console.log('1. Open Sanity Studio and verify the new toplist document')
  console.log(`2. Edit one of the pages with the 59-item toplist`)
  console.log(`3. Remove the inline topListObject block`)
  console.log(`4. Add a new "Toplist (Shared)" block and select "${identifier}"`)
  console.log(`5. Verify the page displays correctly`)
  console.log(`6. Repeat for remaining pages`)
  console.log('='.repeat(60))
}

main().catch(console.error)
