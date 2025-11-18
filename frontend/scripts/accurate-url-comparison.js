const fs = require('fs')

// Missing URLs from live site
const missing = JSON.parse(fs.readFileSync('scripts/url-comparison-report.json', 'utf-8'))

// Pages that exist in Sanity but at different paths
const urlMappings = {
  // Provider demo pages - exist under /pacanele-gratis/ in new site
  '/amusnet-demo': '/pacanele-gratis/amusnet-demo',
  '/endorphina-demo': '/pacanele-gratis/endorphina-demo',
  '/fructe-demo': '/pacanele-gratis/fructe-demo',
  '/games-global-demo': '/pacanele-gratis/games-global-demo',
  '/gaming-corps-demo': '/pacanele-gratis/gaming-corps-demo',
  '/gamomat-demo': '/pacanele-gratis/gamomat-demo',
  '/habanero-demo': '/pacanele-gratis/habanero-demo',
  '/hacksaw-gaming-demo': '/pacanele-gratis/hacksaw-gaming-demo',
  '/keno-loto-demo': '/pacanele-gratis/keno-loto-demo',
  '/light-wonder-demo': '/pacanele-gratis/light-wonder-demo',
  '/novomatic-demo': '/pacanele-gratis/novomatic-demo',
  '/play-n-go-demo': '/pacanele-gratis/play-n-go-demo',
  '/playtech-demo': '/pacanele-gratis/playtech-demo',
  '/pragmatic-play-demo': '/pacanele-gratis/pragmatic-play-demo',
  '/push-gaming-demo': '/pacanele-gratis/push-gaming-demo',
  '/sic-bo-demo': '/pacanele-gratis/sic-bo-demo',
  '/smartsoft-demo': '/pacanele-gratis/smartsoft-demo',
  '/thunderkick-demo': '/pacanele-gratis/thunderkick-demo',
  '/wazdan-demo': '/pacanele-gratis/wazdan-demo',

  // Themed pages - exist under /pacanele-gratis/ in new site
  '/pacanele-clasice-77777-demo': '/pacanele-gratis/pacanele-clasice-77777-demo',
  '/pacanele-cu-femei': '/pacanele-gratis/pacanele-cu-femei',
  '/pacanele-cu-speciale-demo': '/pacanele-gratis/pacanele-cu-speciale-demo',
  '/pacanele-noi': '/pacanele-gratis/pacanele-noi',

  // Info pages - exist under /pacanele-gratis/ in new site
  '/jocuri-cu-rtp-mare': '/pacanele-gratis/jocuri-cu-rtp-mare',
  '/jocuri-cu-zaruri-gratis': '/pacanele-gratis/jocuri-cu-zaruri-gratis',
  '/jocuri-mahjong-gratis': '/pacanele-gratis/jocuri-mahjong-gratis',
  '/poker-ca-la-aparate-gratis': '/pacanele-gratis/poker-ca-la-aparate-gratis',

  // Payment method pages - exist under /metode-de-plata/ in new site
  '/cazinouri-cu-cardul': '/metode-de-plata/cazinouri-cu-cardul',
  '/cazinouri-cu-portofele-electronice': '/metode-de-plata/cazinouri-cu-portofele-electronice',

  // Loto pages with old structure - need redirect
  '/loto-online-keno': '/loto',
}

console.log('\n🔍 Accurate URL Mapping Analysis\n')
console.log('='.repeat(80))

const allMissing = missing.allMissingUrls
const needsRedirect = []
const trulyMissing = []
const canIgnore = []

allMissing.forEach(url => {
  if (urlMappings[url]) {
    needsRedirect.push({ from: url, to: urlMappings[url] })
  } else if (url.startsWith('/loto-online-keno/')) {
    // Old loto structure - redirect to new structure
    const newPath = url.replace('/loto-online-keno/', '/loto/')
    needsRedirect.push({ from: url, to: newPath })
  } else if (url.startsWith('/category/') || url === '/sitemap') {
    canIgnore.push(url)
  } else {
    trulyMissing.push(url)
  }
})

console.log('✅ URLs That Need 301 Redirects (content exists, different path):\n')
console.log(`   Total: ${needsRedirect.length} URLs\n`)
needsRedirect.slice(0, 10).forEach(({ from, to }) => {
  console.log(`   ${from} → ${to}`)
})
if (needsRedirect.length > 10) {
  console.log(`   ... and ${needsRedirect.length - 10} more`)
}

console.log('\n\n' + '='.repeat(80))
console.log('\n⚠️  URLs Truly Missing (need to be added or decided upon):\n')
console.log(`   Total: ${trulyMissing.length} URLs\n`)

// Group truly missing by type
const missingByType = {
  loto: trulyMissing.filter(u => u.startsWith('/loto/')),
  casinos: trulyMissing.filter(u => u.startsWith('/casino/')),
  guide: trulyMissing.filter(u => u.startsWith('/ghid/')),
  themed: trulyMissing.filter(u => u.startsWith('/pacanele-gratis/') && u !== '/pacanele-gratis'),
  other: trulyMissing.filter(u =>
    !u.startsWith('/loto/') &&
    !u.startsWith('/casino/') &&
    !u.startsWith('/ghid/') &&
    !u.startsWith('/pacanele-gratis/')
  ),
}

console.log(`  🎲 Loto pages: ${missingByType.loto.length}`)
missingByType.loto.forEach(u => console.log(`     ${u}`))

console.log(`\n  🏢 Casino reviews: ${missingByType.casinos.length}`)
missingByType.casinos.forEach(u => console.log(`     ${u}`))

console.log(`\n  📖 Guide pages: ${missingByType.guide.length}`)
missingByType.guide.forEach(u => console.log(`     ${u}`))

console.log(`\n  🎯 Themed pages: ${missingByType.themed.length}`)
missingByType.themed.forEach(u => console.log(`     ${u}`))

console.log(`\n  📄 Other pages: ${missingByType.other.length}`)
missingByType.other.forEach(u => console.log(`     ${u}`))

console.log('\n\n' + '='.repeat(80))
console.log('\n✅ Can Safely Ignore:\n')
console.log(`   Total: ${canIgnore.length} URLs\n`)
canIgnore.forEach(u => console.log(`   ${u}`))

// Summary
console.log('\n\n' + '='.repeat(80))
console.log('\n📊 SUMMARY:\n')
console.log('='.repeat(80))
console.log(`\n  Total URLs to handle: ${allMissing.length}`)
console.log(`  \n  ✅ Need 301 redirects (content exists): ${needsRedirect.length}`)
console.log(`  ⚠️  Truly missing (need to add): ${trulyMissing.length}`)
console.log(`  ✅ Can ignore: ${canIgnore.length}`)

console.log('\n\n📝 ACTION ITEMS:\n')
console.log('='.repeat(80))
console.log(`\n1. Set up ${needsRedirect.length} 301 redirects in next.config.js`)
console.log(`2. Add ${missingByType.loto.length} missing loto pages to Sanity`)
console.log(`3. Add ${missingByType.casinos.length} missing casino reviews to Sanity`)
console.log(`4. Add ${missingByType.guide.length} guide pages to Sanity`)
console.log(`5. Review ${missingByType.themed.length + missingByType.other.length} other pages\n`)

// Save redirect list
fs.writeFileSync('scripts/redirects-needed.json', JSON.stringify(needsRedirect, null, 2))
fs.writeFileSync('scripts/truly-missing-urls.json', JSON.stringify(missingByType, null, 2))

console.log('✅ Redirect list saved to: scripts/redirects-needed.json')
console.log('✅ Missing URLs saved to: scripts/truly-missing-urls.json')
console.log('='.repeat(80))
