const {createClient} = require('@sanity/client')
const fs = require('fs')

const client = createClient({
  projectId: '78bidtls',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'sk89tPZ2QFJGhsaCKiEAIsmQg8Qehe1kzxVwZ0M5xnk7uNkKd6TPhYTntOyyNOcmNrKp1Jzb64debWYPdDaoPqPjOXT5en0uOj97gNynaLfN9tp16GfeDJgEazi8ZmcvZZdxEsAwZmQt6uKb0Rm5e4pLdFE7SLXGchGpmuAtfZsTvuiKV2Vw',
})

async function compareUrls() {
  console.log('\n🔍 Comparing Live Site URLs with New Site Structure\n')
  console.log('='.repeat(80))

  // Load live URLs
  const mappedUrls = JSON.parse(fs.readFileSync('../mapped-urls.json', 'utf-8'))
  const livePaths = mappedUrls
    .map(item => item.url.replace('https://cazinou.io', ''))
    .filter(path => path && path !== '/' && !path.includes('.'))
    .sort()

  console.log(`📊 Live site: ${livePaths.length} URLs\n`)

  // Fetch all content from Sanity
  console.log('🔄 Fetching content from Sanity...\n')

  const [games, casinos, infoPages, lotoPages, themedPages] = await Promise.all([
    client.fetch(`*[_type == "game" && defined(slug.current)] { "slug": slug.current }`),
    client.fetch(`*[_type == "casinoReview" && defined(slug.current) && hidden != true] { "slug": slug.current }`),
    client.fetch(`*[_type == "infoPage" && defined(slug.current)] { "slug": slug.current }`),
    client.fetch(`*[_type == "loto" && defined(slug.current)] { "slug": slug.current }`),
    client.fetch(`*[_type == "themedSlotsPage" && defined(slug.current) && hidden != true] { "slug": slug.current }`),
  ])

  // Generate expected new site URLs
  const newSiteUrls = new Set([
    '/', // Homepage
    '/recenzii', // Casino reviews listing (moved from /casino)
    ...games.map(g => `/pacanele/${g.slug}`),
    ...casinos.map(c => `/casino/${c.slug}`),
    ...infoPages.map(p => `/${p.slug}`),
    ...lotoPages.map(l => `/loto/${l.slug}`),
    ...themedPages.map(t => `/pacanele-gratis/${t.slug}`),
  ])

  console.log(`📊 New site will have: ${newSiteUrls.size} URLs\n`)
  console.log(`  🎰 Games: ${games.length}`)
  console.log(`  🏢 Casinos: ${casinos.length}`)
  console.log(`  📄 Info pages: ${infoPages.length}`)
  console.log(`  🎲 Loto pages: ${lotoPages.length}`)
  console.log(`  🎯 Themed pages: ${themedPages.length}`)

  // Compare URLs
  console.log('\n\n🔍 URL Comparison Results:\n')
  console.log('='.repeat(80))

  // Filter live URLs to exclude non-essential paths
  const liveEssentialPaths = livePaths.filter(path => {
    return !path.startsWith('/author/') &&
           !path.startsWith('/blog') &&
           !path.startsWith('/bonusuri/') &&
           path !== '/casino' && // This now redirects to /recenzii
           !path.includes('/page/') &&
           !path.startsWith('/pacanele-gratis/page/')
  })

  console.log(`📊 Essential URLs on live site: ${liveEssentialPaths.length}\n`)

  // Find URLs on live site but not in new site
  const missingInNew = liveEssentialPaths.filter(path => !newSiteUrls.has(path))

  // Group missing URLs by type
  const missingByType = {
    games: missingInNew.filter(p => p.startsWith('/pacanele/')),
    casinos: missingInNew.filter(p => p.startsWith('/casino/')),
    loto: missingInNew.filter(p => p.startsWith('/loto/')),
    sport: missingInNew.filter(p => p.startsWith('/sport/')),
    info: missingInNew.filter(p => !p.startsWith('/pacanele/') && !p.startsWith('/casino/') && !p.startsWith('/loto/') && !p.startsWith('/sport/')),
  }

  console.log('⚠️  URLs on Live Site but Missing in New Site:\n')
  console.log(`  🎰 Games: ${missingByType.games.length}`)
  console.log(`  🏢 Casinos: ${missingByType.casinos.length}`)
  console.log(`  🎲 Loto: ${missingByType.loto.length}`)
  console.log(`  ⚽ Sport: ${missingByType.sport.length}`)
  console.log(`  📄 Info pages: ${missingByType.info.length}`)

  // Show details for critical missing URLs
  if (missingByType.games.length > 0) {
    console.log(`\n  Missing Game URLs (first 10):`)
    missingByType.games.slice(0, 10).forEach(url => console.log(`    ${url}`))
    if (missingByType.games.length > 10) {
      console.log(`    ... and ${missingByType.games.length - 10} more`)
    }
  }

  if (missingByType.casinos.length > 0) {
    console.log(`\n  Missing Casino URLs:`)
    missingByType.casinos.forEach(url => console.log(`    ${url}`))
  }

  if (missingByType.loto.length > 0) {
    console.log(`\n  Missing Loto URLs:`)
    missingByType.loto.forEach(url => console.log(`    ${url}`))
  }

  if (missingByType.sport.length > 0) {
    console.log(`\n  ⚠️  Sport URLs (not implemented in new site):`)
    missingByType.sport.slice(0, 5).forEach(url => console.log(`    ${url}`))
    if (missingByType.sport.length > 5) {
      console.log(`    ... and ${missingByType.sport.length - 5} more`)
    }
  }

  if (missingByType.info.length > 0) {
    console.log(`\n  Missing Info Pages (first 10):`)
    missingByType.info.slice(0, 10).forEach(url => console.log(`    ${url}`))
    if (missingByType.info.length > 10) {
      console.log(`    ... and ${missingByType.info.length - 10} more`)
    }
  }

  // Save detailed report
  const report = {
    summary: {
      liveUrls: liveEssentialPaths.length,
      newSiteUrls: newSiteUrls.size,
      missingInNew: missingInNew.length,
    },
    missingByType,
    allMissingUrls: missingInNew,
  }

  fs.writeFileSync('scripts/url-comparison-report.json', JSON.stringify(report, null, 2))

  console.log(`\n\n✅ Detailed report saved to scripts/url-comparison-report.json`)

  // Summary
  console.log(`\n\n📊 Summary:\n`)
  console.log('='.repeat(80))
  if (missingInNew.length === 0) {
    console.log('✅ All essential URLs from live site will exist in new site!')
  } else {
    console.log(`⚠️  ${missingInNew.length} URLs need attention before launch`)
    console.log(`\nBreakdown:`)
    console.log(`  🎰 ${missingByType.games.length} game URLs`)
    console.log(`  🏢 ${missingByType.casinos.length} casino URLs`)
    console.log(`  🎲 ${missingByType.loto.length} loto URLs`)
    console.log(`  ⚽ ${missingByType.sport.length} sport URLs (may need implementation)`)
    console.log(`  📄 ${missingByType.info.length} info page URLs`)
  }
  console.log('='.repeat(80))
}

compareUrls().catch(error => {
  console.error('\n❌ Comparison failed:', error.message)
  process.exit(1)
})
