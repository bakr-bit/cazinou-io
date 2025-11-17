import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Slugs from sitemap (as of the check)
const SITEMAP_SLUGS = [
  'vavada-casino',
  'velobet-casino',
  'spinbetter-casino',
  'gg-bet-casino',
  'fortune-jack',
  'celsius-casino',
  'bizzo-casino',
  'fatpanda-casino',
  'flagman-casino',
  'fgfox-casino',
  'fairspin-casino',
  'fast-slots-casino',
  'empire-casino',
  'cryptobetsports-casino',
  'cosmic-slot-casino',
  'cosmobet-casino',
  'corgislot-casino',
  'billionairespin-casino',
  'betonred-casino',
  'bluvegas-casino',
  'alibabet-casino',
  'bc-game-casino',
  '22bet-casino',
  '888starz-casino',
  '20bet-casino',
  'spinch-casino',
  'rolletto-casino',
  'hitnspin-casino',
  'gamblits-casino',
  'megapari-casino',
  'lex-casino',
  'ivibet-casino',
  'gratowin-casino',
  'monro-casino',
  'playbet-casino',
  'weissbet-casino',
  'trustdice-casino',
  'hellspin-casino',
  'national-casino',
  'flush-casino',
  'wazbee-casino',
  'jacktop-casino',
  'wizebets-casino',
  'rollino-casino',
  'snatch-casino',
  'iwild-casino',
  'wincasino-romania',
  'ybets-casino',
  'onedun-casino',
  'ohmyzino-casino',
  'vulkan-vegas-casino',
  'verde-casino',
  'ice-casino',
  'hotline-casino',
  'slotgems-casino',
  'jettbet-casino',
  'fresh-casino',
  'gamblezen-casino',
  'casinojoy',
  'paripesa-casino',
  'oscarspin-casino',
  'immerion-casino',
  'iwin-fortune-casino',
  'netbet-casino',
]

type CasinoReview = {
  _id: string
  title: string
  slug: {
    current: string
  }
  casino?: {
    name?: string
  }
}

async function fixReviewSlugs() {
  console.log('🔍 Fetching all casino reviews from Sanity...\n')

  const reviews = await client.fetch<CasinoReview[]>(`
    *[_type == "casinoReview"] {
      _id,
      title,
      slug,
      casino->{
        name
      }
    }
  `)

  console.log(`✅ Found ${reviews.length} casino reviews in Sanity\n`)

  const sitemapSlugsSet = new Set(SITEMAP_SLUGS)
  const sanitySlugMap = new Map<string, CasinoReview>()

  // Build a map of Sanity slugs for comparison
  reviews.forEach(review => {
    sanitySlugMap.set(review.slug.current, review)
  })

  console.log('📊 Analysis:\n')

  // Find reviews in Sanity but not in sitemap
  const notInSitemap = reviews.filter(r => !sitemapSlugsSet.has(r.slug.current))

  if (notInSitemap.length > 0) {
    console.log(`⚠️  ${notInSitemap.length} reviews in Sanity but NOT in sitemap:`)
    notInSitemap.forEach(r => {
      console.log(`   - ${r.slug.current} (${r.title})`)
    })
    console.log()
  }

  // Find reviews in sitemap but not in Sanity
  const notInSanity = SITEMAP_SLUGS.filter(slug => !sanitySlugMap.has(slug))

  if (notInSanity.length > 0) {
    console.log(`ℹ️  ${notInSanity.length} reviews in sitemap but NOT in Sanity:`)
    notInSanity.forEach(slug => {
      console.log(`   - ${slug}`)
    })
    console.log()
  }

  // Find exact matches
  const matches = reviews.filter(r => sitemapSlugsSet.has(r.slug.current))
  console.log(`✅ ${matches.length} reviews match exactly between Sanity and sitemap\n`)

  // Summary
  console.log('=' .repeat(70))
  console.log('📝 SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total in Sanity: ${reviews.length}`)
  console.log(`Total in Sitemap: ${SITEMAP_SLUGS.length}`)
  console.log(`Matching: ${matches.length}`)
  console.log(`In Sanity only: ${notInSitemap.length}`)
  console.log(`In Sitemap only: ${notInSanity.length}`)
  console.log('='.repeat(70))

  if (notInSitemap.length === 0) {
    console.log('\n✅ All Sanity reviews are in the sitemap!')
  }
}

fixReviewSlugs().catch(console.error)
