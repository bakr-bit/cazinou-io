const {createClient} = require('@sanity/client')
const fs = require('fs')

// Load environment variables manually
const envContent = fs.readFileSync('.env.local', 'utf-8')
const tokenMatch = envContent.match(/SANITY_API_READ_TOKEN="?([^"\n]+)"?/)
const token = tokenMatch ? tokenMatch[1] : null

if (!token) {
  throw new Error('SANITY_API_READ_TOKEN not found in .env.local')
}

const client = createClient({
  projectId: '78bidtls',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token,
})

async function verifyUrlStructure() {
  console.log('\n🔍 Verifying URL Structure Matches Live Site\n')
  console.log('='.repeat(80))

  // Read the URLs that we previously identified as needing redirects
  const redirectsNeeded = JSON.parse(fs.readFileSync('scripts/redirects-needed.json', 'utf-8'))

  // Get all documents with slugs from Sanity
  const allDocs = await client.fetch(`
    *[(_type == "page" || _type == "infoPage" || _type == "themedSlotsPage") && defined(slug.current)] {
      _type,
      "slug": slug.current,
      title,
      heading,
      hidden
    }
  `)

  // Create a map of slugs to document types
  const slugMap = {}
  allDocs.forEach(doc => {
    slugMap[doc.slug] = {
      type: doc._type,
      title: doc.title || doc.heading,
      hidden: doc.hidden
    }
  })

  console.log('\n📊 URL Structure Verification:\n')

  const nowAccessible = []
  const stillNeedAction = []

  // Check each URL that previously needed a redirect
  redirectsNeeded.forEach(({from, to}) => {
    // Extract slug from the "from" path (e.g., "/amusnet-demo" => "amusnet-demo")
    const slug = from.replace('/', '')

    // Check if this slug exists in our document map
    if (slugMap[slug]) {
      const doc = slugMap[slug]
      if (doc.hidden) {
        stillNeedAction.push({
          url: from,
          reason: 'Document is hidden',
          type: doc.type
        })
      } else {
        nowAccessible.push({
          url: from,
          type: doc.type,
          title: doc.title
        })
      }
    } else {
      stillNeedAction.push({
        url: from,
        reason: 'Document not found with this slug',
        previousPath: to
      })
    }
  })

  console.log(`✅ Now Accessible at Root Level (${nowAccessible.length} URLs):\n`)
  nowAccessible.forEach(({url, type, title}) => {
    console.log(`   ${url}`)
    console.log(`      Type: ${type}`)
    console.log(`      Title: ${title}`)
    console.log()
  })

  console.log('\n' + '='.repeat(80))
  console.log(`\n⚠️  Still Need Action (${stillNeedAction.length} URLs):\n`)
  stillNeedAction.forEach(({url, reason, type, previousPath}) => {
    console.log(`   ${url}`)
    console.log(`      Reason: ${reason}`)
    if (type) console.log(`      Type: ${type}`)
    if (previousPath) console.log(`      Previously at: ${previousPath}`)
    console.log()
  })

  console.log('\n' + '='.repeat(80))
  console.log('\n📈 SUMMARY:\n')
  console.log('='.repeat(80))
  console.log(`\n  Total URLs checked: ${redirectsNeeded.length}`)
  console.log(`  ✅ Now accessible at root level: ${nowAccessible.length}`)
  console.log(`  ⚠️  Still need action: ${stillNeedAction.length}`)

  const percentage = ((nowAccessible.length / redirectsNeeded.length) * 100).toFixed(1)
  console.log(`\n  Success rate: ${percentage}%`)

  console.log('\n' + '='.repeat(80))

  // Save results
  const results = {
    totalChecked: redirectsNeeded.length,
    nowAccessible,
    stillNeedAction,
    successRate: percentage
  }

  fs.writeFileSync('scripts/url-structure-verification.json', JSON.stringify(results, null, 2))
  console.log('\n✅ Results saved to: scripts/url-structure-verification.json')
  console.log('='.repeat(80))
}

verifyUrlStructure().catch(error => {
  console.error('\n❌ Verification failed:', error.message)
  process.exit(1)
})
