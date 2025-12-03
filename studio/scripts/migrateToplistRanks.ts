/**
 * Migration script: Remove rank field from toplist items
 *
 * This script:
 * 1. Finds all documents containing topListObject
 * 2. Sorts listItems by their current rank
 * 3. Removes the rank field (array order becomes the rank)
 *
 * Run with: npx sanity exec scripts/migrateToplistRanks.ts --with-user-token
 */

import {getCliClient} from 'sanity/cli'

const client = getCliClient()

type ListItem = {
  _key: string
  rank?: number
  item?: {
    _ref: string
  }
  customDescription?: string
}

type TopListObject = {
  _type: 'topListObject'
  _key: string
  title?: string
  listItems?: ListItem[]
}

type DocumentWithContent = {
  _id: string
  _type: string
  content?: TopListObject[]
  pageBuilder?: TopListObject[]
}

async function migrateToplistRanks() {
  console.log('🔍 Finding all documents with toplists...\n')

  // Query for documents that might contain toplists
  // These are embedded in content arrays or pageBuilder arrays
  const query = `*[
    _type in ["homePage", "infoPage", "lotoPageSettings", "page", "loto", "themedSlotsPage"]
    && (
      count(content[_type == "topListObject"]) > 0 ||
      count(pageBuilder[_type == "topListObject"]) > 0
    )
  ] {
    _id,
    _type,
    content[_type == "topListObject"] {
      _type,
      _key,
      title,
      listItems
    },
    pageBuilder[_type == "topListObject"] {
      _type,
      _key,
      title,
      listItems
    }
  }`

  const documents = await client.fetch<DocumentWithContent[]>(query)

  console.log(`✅ Found ${documents.length} documents with toplists\n`)

  if (documents.length === 0) {
    console.log('No documents to migrate.')
    return
  }

  let totalToplists = 0
  let totalItemsSorted = 0

  for (const doc of documents) {
    console.log(`\n📄 Processing ${doc._type}: ${doc._id}`)

    // Process content array
    if (doc.content && doc.content.length > 0) {
      for (const toplist of doc.content) {
        if (toplist._type === 'topListObject' && toplist.listItems) {
          const result = await processToplist(doc._id, 'content', toplist)
          if (result) {
            totalToplists++
            totalItemsSorted += result.itemCount
          }
        }
      }
    }

    // Process pageBuilder array
    if (doc.pageBuilder && doc.pageBuilder.length > 0) {
      for (const toplist of doc.pageBuilder) {
        if (toplist._type === 'topListObject' && toplist.listItems) {
          const result = await processToplist(doc._id, 'pageBuilder', toplist)
          if (result) {
            totalToplists++
            totalItemsSorted += result.itemCount
          }
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ MIGRATION COMPLETE')
  console.log('='.repeat(60))
  console.log(`Documents processed: ${documents.length}`)
  console.log(`Toplists migrated: ${totalToplists}`)
  console.log(`Total items sorted: ${totalItemsSorted}`)
  console.log('='.repeat(60))
}

async function processToplist(
  docId: string,
  arrayField: 'content' | 'pageBuilder',
  toplist: TopListObject
): Promise<{itemCount: number} | null> {
  if (!toplist.listItems || toplist.listItems.length === 0) {
    console.log(`   ⏭️  Skipping "${toplist.title}" - no items`)
    return null
  }

  // Check if any items have rank field
  const hasRanks = toplist.listItems.some(item => typeof item.rank === 'number')

  if (!hasRanks) {
    console.log(`   ⏭️  Skipping "${toplist.title}" - already migrated (no ranks)`)
    return null
  }

  console.log(`   📝 Migrating "${toplist.title}" (${toplist.listItems.length} items)`)

  // Sort by rank (items without rank go to the end)
  const sortedItems = [...toplist.listItems].sort((a, b) => {
    const rankA = a.rank ?? Infinity
    const rankB = b.rank ?? Infinity
    return rankA - rankB
  })

  // Remove rank field from each item
  const migratedItems = sortedItems.map(item => {
    const {rank, ...rest} = item
    return rest
  })

  // Log the reordering
  console.log(`      Original order: ${toplist.listItems.map(i => i.rank ?? '?').join(', ')}`)
  console.log(`      New order: items sorted, ranks removed`)

  // Build the patch to update this specific toplist in the array
  // We need to find the toplist by _key and update its listItems
  try {
    await client
      .patch(docId)
      .set({
        [`${arrayField}[_key == "${toplist._key}"].listItems`]: migratedItems
      })
      .commit()

    console.log(`      ✅ Saved`)
    return {itemCount: migratedItems.length}
  } catch (error) {
    console.error(`      ❌ Error saving:`, error)
    return null
  }
}

// Dry run mode - just shows what would be changed
async function dryRun() {
  console.log('🔍 DRY RUN - Finding all documents with toplists...\n')

  const query = `*[
    _type in ["homePage", "infoPage", "lotoPageSettings", "page", "loto", "themedSlotsPage"]
    && (
      count(content[_type == "topListObject"]) > 0 ||
      count(pageBuilder[_type == "topListObject"]) > 0
    )
  ] {
    _id,
    _type,
    content[_type == "topListObject"] {
      _type,
      _key,
      title,
      "itemCount": count(listItems),
      "ranks": listItems[].rank
    },
    pageBuilder[_type == "topListObject"] {
      _type,
      _key,
      title,
      "itemCount": count(listItems),
      "ranks": listItems[].rank
    }
  }`

  const documents = await client.fetch(query)

  console.log(`Found ${documents.length} documents with toplists:\n`)

  for (const doc of documents) {
    console.log(`📄 ${doc._type}: ${doc._id}`)

    const toplists = [...(doc.content || []), ...(doc.pageBuilder || [])]
    for (const tl of toplists) {
      const hasRanks = tl.ranks?.some((r: number | null) => r !== null)
      console.log(`   - "${tl.title}" (${tl.itemCount} items) ${hasRanks ? '⚠️ has ranks' : '✅ no ranks'}`)
      if (hasRanks && tl.ranks) {
        console.log(`     Current ranks: ${tl.ranks.join(', ')}`)
      }
    }
  }
}

// Check command line args
const args = process.argv.slice(2)
if (args.includes('--dry-run')) {
  dryRun().catch(console.error)
} else {
  migrateToplistRanks().catch(console.error)
}
