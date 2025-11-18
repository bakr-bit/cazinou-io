const fs = require('fs')

const report = JSON.parse(fs.readFileSync('scripts/url-comparison-report.json', 'utf-8'))

console.log('\n📊 Detailed Analysis of Missing Content\n')
console.log('='.repeat(80))

// Categorize info pages
const infoPages = report.missingByType.info

const categories = {
  categoryPages: infoPages.filter(p => p.startsWith('/category/')),
  providerDemoPages: infoPages.filter(p => p.endsWith('-demo') && !p.startsWith('/pacanele-')),
  themedSlotPages: infoPages.filter(p => p.startsWith('/pacanele-') || p === '/pacanele-gratis'),
  lotoPages: infoPages.filter(p => (p.startsWith('/loto-') || p.startsWith('/loto-online-keno/')) && !p.startsWith('/loto/')),
  guidePages: infoPages.filter(p => p.startsWith('/ghid/')),
  otherPages: infoPages.filter(p =>
    !p.startsWith('/category/') &&
    !(p.endsWith('-demo') && !p.startsWith('/pacanele-')) &&
    !p.startsWith('/pacanele-') &&
    p !== '/pacanele-gratis' &&
    !(p.startsWith('/loto-') || p.startsWith('/loto-online-keno/')) &&
    !p.startsWith('/ghid/')
  ),
}

console.log('📄 MISSING INFO PAGES (79 total)\n')
console.log('='.repeat(80))

console.log(`\n1️⃣  WordPress Category Pages (${categories.categoryPages.length})`)
console.log('   These are WordPress archive pages that may not be needed:\n')
categories.categoryPages.forEach(p => console.log(`   ${p}`))

console.log(`\n\n2️⃣  Provider Demo Pages (${categories.providerDemoPages.length})`)
console.log('   Pages for specific game providers:\n')
categories.providerDemoPages.forEach(p => console.log(`   ${p}`))

console.log(`\n\n3️⃣  Themed Slot Pages (${categories.themedSlotPages.length})`)
console.log('   Landing pages for slot themes:\n')
categories.themedSlotPages.forEach(p => console.log(`   ${p}`))

console.log(`\n\n4️⃣  Loto Country Pages (${categories.lotoPages.length})`)
console.log('   Individual country loto pages (some duplicates with /loto/ prefix):\n')
categories.lotoPages.forEach(p => console.log(`   ${p}`))

console.log(`\n\n5️⃣  Guide Pages (${categories.guidePages.length})`)
console.log('   How-to guides:\n')
categories.guidePages.forEach(p => console.log(`   ${p}`))

console.log(`\n\n6️⃣  Other Info Pages (${categories.otherPages.length})`)
console.log('   Miscellaneous informational pages:\n')
categories.otherPages.forEach(p => console.log(`   ${p}`))

console.log('\n\n' + '='.repeat(80))
console.log('\n🎲 MISSING LOTO PAGES (8 total)\n')
console.log('='.repeat(80) + '\n')
report.missingByType.loto.forEach(p => console.log(`   ${p}`))

console.log('\n\n' + '='.repeat(80))
console.log('\n🏢 MISSING CASINO REVIEWS (3 total)\n')
console.log('='.repeat(80) + '\n')
report.missingByType.casinos.forEach(p => console.log(`   ${p}`))

console.log('\n\n' + '='.repeat(80))
console.log('\n📊 SUMMARY & RECOMMENDATIONS\n')
console.log('='.repeat(80))

console.log(`\n✅ Can be safely ignored (WordPress artifacts):`)
console.log(`   - Category pages: ${categories.categoryPages.length}`)
console.log(`   - Sitemap: 1`)

console.log(`\n⚠️  Need to be added to Sanity:`)
console.log(`   - Provider demo pages: ${categories.providerDemoPages.length}`)
console.log(`   - Themed slot pages: ${categories.themedSlotPages.length}`)
console.log(`   - Loto pages (under /loto/): 8`)
console.log(`   - Loto country pages: ${categories.lotoPages.length}`)
console.log(`   - Guide pages: ${categories.guidePages.length}`)
console.log(`   - Casino reviews: 3`)
console.log(`   - Other info pages: ${categories.otherPages.length}`)

console.log(`\n🔍 Duplicate loto pages detected:`)
console.log(`   The same loto games appear under both:`)
console.log(`   - /loto/[slug] (8 pages - missing in Sanity)`)
console.log(`   - /loto-online-keno/[slug] (${categories.lotoPages.filter(p => p.startsWith('/loto-online-keno/')).length} pages)`)
console.log(`   Recommendation: Add to /loto/ path, redirect old /loto-online-keno/ paths`)

const totalToAdd = categories.providerDemoPages.length +
                   categories.themedSlotPages.length +
                   8 + // loto pages under /loto/
                   categories.guidePages.length +
                   3 + // casinos
                   categories.otherPages.length

console.log(`\n📈 Total pages to add: ~${totalToAdd}`)
console.log('='.repeat(80))
