const {createClient} = require('@sanity/client')

const client = createClient({
  projectId: '78bidtls',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk89tPZ2QFJGhsaCKiEAIsmQg8Qehe1kzxVwZ0M5xnk7uNkKd6TPhYTntOyyNOcmNrKp1Jzb64debWYPdDaoPqPjOXT5en0uOj97gNynaLfN9tp16GfeDJgEazi8ZmcvZZdxEsAwZmQt6uKb0Rm5e4pLdFE7SLXGchGpmuAtfZsTvuiKV2Vw',
})

async function checkAllContent() {
  console.log('\n🔍 Comprehensive Sanity Content Audit\n')
  console.log('='.repeat(80))

  // Get all document types
  const allDocs = await client.fetch(`
    *[defined(slug.current)] {
      _type,
      "slug": slug.current,
      title,
      name,
      heading
    }
  `)

  // Group by type
  const byType = {}
  allDocs.forEach(doc => {
    if (!byType[doc._type]) byType[doc._type] = []
    byType[doc._type].push(doc)
  })

  console.log('📊 Documents by Type:\n')
  Object.keys(byType).sort().forEach(type => {
    console.log(`  ${type}: ${byType[type].length} documents`)
  })

  console.log('\n\n' + '='.repeat(80))
  console.log('\n🎯 Themed Slots Pages (themedSlotsPage):\n')
  if (byType.themedSlotsPage) {
    byType.themedSlotsPage.forEach(page => {
      console.log(`  /pacanele-gratis/${page.slug} - ${page.title || page.heading}`)
    })
  } else {
    console.log('  (None found)')
  }

  console.log('\n\n' + '='.repeat(80))
  console.log('\n📄 Info Pages (infoPage):\n')
  if (byType.infoPage) {
    byType.infoPage.forEach(page => {
      console.log(`  /${page.slug} - ${page.title || page.heading}`)
    })
  } else {
    console.log('  (None found)')
  }

  console.log('\n\n' + '='.repeat(80))
  console.log('\n🎲 Loto Pages:\n')
  if (byType.loto) {
    byType.loto.forEach(page => {
      console.log(`  /loto/${page.slug} - ${page.title || page.heading}`)
    })
  } else {
    console.log('  (None found)')
  }

  // Generate ALL possible URLs from Sanity
  const allUrls = new Set()

  // Add homepage
  allUrls.add('/')

  // Add special pages
  allUrls.add('/recenzii')
  allUrls.add('/pacanele-gratis')

  // Add all documents with slugs
  if (byType.game) {
    byType.game.forEach(doc => allUrls.add(`/pacanele/${doc.slug}`))
  }
  if (byType.casinoReview) {
    byType.casinoReview.forEach(doc => allUrls.add(`/casino/${doc.slug}`))
  }
  if (byType.infoPage) {
    byType.infoPage.forEach(doc => allUrls.add(`/${doc.slug}`))
  }
  if (byType.loto) {
    byType.loto.forEach(doc => allUrls.add(`/loto/${doc.slug}`))
  }
  if (byType.themedSlotsPage) {
    byType.themedSlotsPage.forEach(doc => allUrls.add(`/pacanele-gratis/${doc.slug}`))
  }
  if (byType.person) {
    byType.person.forEach(doc => allUrls.add(`/autori/${doc.slug}`))
  }
  if (byType.post) {
    byType.post.forEach(doc => allUrls.add(`/blog/${doc.slug}`))
  }

  console.log('\n\n' + '='.repeat(80))
  console.log(`\n📊 Total URLs in New Site: ${allUrls.size}\n`)
  console.log('='.repeat(80))

  return { byType, allUrls }
}

checkAllContent().catch(error => {
  console.error('\n❌ Check failed:', error.message)
  process.exit(1)
})
