const fs = require('fs')
const path = require('path')

// Read mapped URLs from Firecrawl
const mappedUrls = JSON.parse(fs.readFileSync('../mapped-urls.json', 'utf-8'))

// Extract URL paths (remove domain)
const livePaths = mappedUrls
  .map(item => item.url.replace('https://cazinou.io', ''))
  .filter(path => path && path !== '/')
  .sort()

console.log(`\n📊 Live Site URL Analysis\n`)
console.log('='.repeat(80))
console.log(`Total URLs: ${livePaths.length}\n`)

// Group URLs by type
const urlGroups = {
  games: livePaths.filter(p => p.startsWith('/pacanele/')),
  casinos: livePaths.filter(p => p.startsWith('/casino/')),
  loto: livePaths.filter(p => p.startsWith('/loto/')),
  info: livePaths.filter(p => p.startsWith('/') && !p.startsWith('/pacanele/') && !p.startsWith('/casino/') && !p.startsWith('/loto/') && !p.startsWith('/sport/') && !p.includes('.')),
  sport: livePaths.filter(p => p.startsWith('/sport/')),
  other: livePaths.filter(p => p.includes('.') || (!p.startsWith('/pacanele/') && !p.startsWith('/casino/') && !p.startsWith('/loto/') && !p.startsWith('/sport/') && p !== '/' && !p.match(/^\/[^\/]+$/))),
}

console.log('📋 URL Breakdown by Type:\n')
console.log(`  🎰 Games (/pacanele/*): ${urlGroups.games.length}`)
console.log(`  🏢 Casinos (/casino/*): ${urlGroups.casinos.length}`)
console.log(`  🎲 Loto (/loto/*): ${urlGroups.loto.length}`)
console.log(`  ⚽ Sport (/sport/*): ${urlGroups.sport.length}`)
console.log(`  📄 Info pages: ${urlGroups.info.length}`)
console.log(`  📑 Other (sitemaps, etc): ${urlGroups.other.length}`)

// Check for specific patterns that might indicate URL structure differences
console.log(`\n\n🔍 Checking for URL Pattern Issues:\n`)
console.log('='.repeat(80))

// Check casino URLs (should redirect /casino to /recenzii but keep /casino/[slug])
const casinoListingUrls = urlGroups.casinos.filter(p => p === '/casino' || p === '/casino/')
if (casinoListingUrls.length > 0) {
  console.log(`⚠️  Casino listing URL found: ${casinoListingUrls[0]}`)
  console.log(`   ✅ This correctly redirects to /recenzii in new site`)
}

// Check for -demo suffix games
const demoGames = urlGroups.games.filter(p => p.includes('-demo'))
const nonDemoGames = urlGroups.games.filter(p => !p.includes('-demo'))

console.log(`\n📊 Game URL Analysis:`)
console.log(`  Total game URLs: ${urlGroups.games.length}`)
console.log(`  With -demo suffix: ${demoGames.length}`)
console.log(`  Without -demo suffix: ${nonDemoGames.length}`)

if (demoGames.length > 0) {
  console.log(`\n  Sample -demo URLs:`)
  demoGames.slice(0, 5).forEach(url => console.log(`    ${url}`))
}

// Save detailed analysis
const analysis = {
  totalUrls: livePaths.length,
  urlsByType: {
    games: urlGroups.games.length,
    casinos: urlGroups.casinos.length,
    loto: urlGroups.loto.length,
    sport: urlGroups.sport.length,
    info: urlGroups.info.length,
    other: urlGroups.other.length,
  },
  allGameUrls: urlGroups.games,
  allCasinoUrls: urlGroups.casinos,
  allLotoUrls: urlGroups.loto,
  allSportUrls: urlGroups.sport,
  allInfoUrls: urlGroups.info,
  demoGames: demoGames,
  nonDemoGames: nonDemoGames,
}

fs.writeFileSync('scripts/url-analysis.json', JSON.stringify(analysis, null, 2))
console.log(`\n\n✅ Detailed analysis saved to scripts/url-analysis.json`)

console.log(`\n\n🎯 Next Steps:\n`)
console.log('='.repeat(80))
console.log(`1. Review game URLs with -demo suffix`)
console.log(`2. Verify all casino review URLs match pattern /casino/[slug]`)
console.log(`3. Check that info pages, loto pages, and sport pages exist in Sanity`)
console.log(`4. Compare with sitemap.ts to ensure all URLs will be generated`)
console.log('='.repeat(80))
