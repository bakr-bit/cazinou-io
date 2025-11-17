import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// All URLs from sitemap (organized by type)
const SITEMAP = {
  casinoReviews: [
    'vavada-casino', 'velobet-casino', 'spinbetter-casino', 'gg-bet-casino',
    'fortune-jack', 'celsius-casino', 'bizzo-casino', 'fatpanda-casino',
    'flagman-casino', 'fgfox-casino', 'fairspin-casino', 'fast-slots-casino',
    'empire-casino', 'cryptobetsports-casino', 'cosmic-slot-casino', 'cosmobet-casino',
    'corgislot-casino', 'billionairespin-casino', 'betonred-casino', 'bluvegas-casino',
    'alibabet-casino', 'bc-game-casino', '22bet-casino', '888starz-casino',
    '20bet-casino', 'spinch-casino', 'rolletto-casino', 'hitnspin-casino',
    'gamblits-casino', 'megapari-casino', 'lex-casino', 'ivibet-casino',
    'gratowin-casino', 'monro-casino', 'playbet-casino', 'weissbet-casino',
    'trustdice-casino', 'hellspin-casino', 'national-casino', 'flush-casino',
    'wazbee-casino', 'jacktop-casino', 'wizebets-casino', 'rollino-casino',
    'snatch-casino', 'iwild-casino', 'wincasino-romania', 'ybets-casino',
    'onedun-casino', 'ohmyzino-casino', 'vulkan-vegas-casino', 'verde-casino',
    'ice-casino', 'hotline-casino', 'slotgems-casino', 'jettbet-casino',
    'fresh-casino', 'gamblezen-casino', 'casinojoy', 'paripesa-casino',
    'oscarspin-casino', 'immerion-casino', 'iwin-fortune-casino', 'netbet-casino'
  ],

  themedSlotsPages: [
    'pacanele-gratis', 'pacanele-clasice-77777-demo', 'pacanele-cu-femei',
    'pacanele-noi', 'pacanele-cu-speciale-demo', 'jocuri-gratis',
    'jocuri-cu-rtp-mare', 'jocuri-cu-zaruri-gratis', 'jocuri-mahjong-gratis',
    'poker-ca-la-aparate-gratis', 'fructe-demo', 'lozuri-razuibile-online',
    'plinko-online', 'sic-bo-demo', 'bingo-online', 'egt-jackpot-cards-demo',
    'roata-norocului-casino', 'pragmatic-play-demo', 'novomatic-demo',
    'endorphina-demo', 'wazdan-demo', 'gamomat-demo', 'play-n-go-demo',
    'playtech-demo', 'push-gaming-demo', 'smartsoft-demo', 'gaming-corps-demo',
    'games-global-demo', 'thunderkick-demo', 'habanero-demo', 'hacksaw-gaming-demo',
    'light-wonder-demo', 'amusnet-demo', '20-linii'
  ],

  infoPages: [
    'cazinouri-cu-cardul', 'metode-de-plata/cazinouri-cu-portofele-electronice',
    'metode-de-plata', 'cazinouri-online-care-platesc', 'casino-fara-verificare',
    'baccarat-live', 'ruleta-live', 'blackjack-live', 'casino-live', 'poker-live',
    'cazinouri-tron-trx', 'cazinouri-usdt-tether', 'cazinouri-ethereum',
    'cazinouri-anonime', 'crypto-casino', 'case-pariuri-crypto', 'valoare-ethereum',
    'turnee-sloturi', 'cod-bonus', 'bani-reali', 'bonus-de-bun-venit',
    'rotiri-gratuite', 'bonus-de-ziua-ta-casino', 'bonus-cashback-casino',
    'free-bet-pariuri', 'cazinouri-pe-mobil', 'cazinouri-noi',
    'lista-cazinouri-straine', 'cazinouri-online-irlanda', 'cazinouri-online-italia',
    'cazinouri-online-franta', 'cazinouri-online-olanda', 'cazinouri-online-belgia',
    'cazinouri-online-germania', 'case-de-pariuri-germania', 'case-de-pariuri-spania',
    'despre-noi', 'confidentialitate', 'sitemap'
  ],

  lotoPages: [
    'loto-canada-atlantic-bucko', 'colorado-cash-5', 'polonia-kaskada-12-24',
    'loto-irlanda', 'loto-norvegia', 'loto-italia-bari', 'loto-italia-napoli',
    'loto-italia-genova', 'loto-italia-florenta', 'loto-italia-cagliari',
    'loto-germania', 'loto-elvetia-6-42', 'loto-danemarca', 'loto-slovacia',
    'loto-turcia', 'loto-new-york-pick', 'spania-bono', 'letonia-20-62',
    'eurojackpot-euromillions', 'keno-loto-demo', 'loto-online-keno'
  ]
}

async function checkAllContent() {
  console.log('🔍 Checking all content types against sitemap...\n')

  // Fetch all content from Sanity
  const [casinoReviews, themedSlotsPages, infoPages, lotoPages] = await Promise.all([
    client.fetch(`*[_type == "casinoReview"]{slug}`),
    client.fetch(`*[_type == "themedSlotsPage"]{slug}`),
    client.fetch(`*[_type == "infoPage"]{slug}`),
    client.fetch(`*[_type == "loto"]{slug}`)
  ])

  console.log('📊 Content Summary:\n')
  console.log(`   Casino Reviews in Sanity: ${casinoReviews.length}`)
  console.log(`   Themed Slots Pages in Sanity: ${themedSlotsPages.length}`)
  console.log(`   Info Pages in Sanity: ${infoPages.length}`)
  console.log(`   Loto Pages in Sanity: ${lotoPages.length}`)
  console.log()
  console.log(`   Casino Reviews in Sitemap: ${SITEMAP.casinoReviews.length}`)
  console.log(`   Themed Slots in Sitemap: ${SITEMAP.themedSlotsPages.length}`)
  console.log(`   Info Pages in Sitemap: ${SITEMAP.infoPages.length}`)
  console.log(`   Loto Pages in Sitemap: ${SITEMAP.lotoPages.length}`)
  console.log('\n' + '='.repeat(70) + '\n')

  // Check each content type
  checkContentType('Casino Reviews', casinoReviews, SITEMAP.casinoReviews)
  checkContentType('Themed Slots Pages', themedSlotsPages, SITEMAP.themedSlotsPages)
  checkContentType('Info Pages', infoPages, SITEMAP.infoPages)
  checkContentType('Loto Pages', lotoPages, SITEMAP.lotoPages)
}

function checkContentType(name: string, sanityContent: any[], sitemapSlugs: string[]) {
  console.log(`\n📋 ${name}:`)
  console.log('─'.repeat(70))

  const sanitySlugs = sanityContent.map(c => c.slug?.current || c.slug).filter(Boolean)
  const sanitySet = new Set(sanitySlugs)
  const sitemapSet = new Set(sitemapSlugs)

  // Find content in Sanity but not in sitemap
  const notInSitemap = sanitySlugs.filter(slug => !sitemapSet.has(slug))

  // Find content in sitemap but not in Sanity
  const notInSanity = sitemapSlugs.filter(slug => !sanitySet.has(slug))

  // Count matches
  const matches = sanitySlugs.filter(slug => sitemapSet.has(slug)).length

  if (notInSitemap.length > 0) {
    console.log(`\n⚠️  ${notInSitemap.length} in Sanity but NOT in sitemap:`)
    notInSitemap.forEach(slug => console.log(`   - ${slug}`))
  }

  if (notInSanity.length > 0) {
    console.log(`\nℹ️  ${notInSanity.length} in sitemap but NOT in Sanity:`)
    notInSanity.slice(0, 10).forEach(slug => console.log(`   - ${slug}`))
    if (notInSanity.length > 10) {
      console.log(`   ... and ${notInSanity.length - 10} more`)
    }
  }

  console.log(`\n✅ ${matches} ${name.toLowerCase()} match between Sanity and sitemap`)

  if (notInSitemap.length === 0) {
    console.log(`✅ All Sanity ${name.toLowerCase()} are in the sitemap!`)
  }
}

checkAllContent().catch(console.error)
