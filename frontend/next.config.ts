import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  // Use trailing slashes to match live site URL structure
  // This ensures consistency and prevents duplicate content issues
  trailingSlash: true,
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: 'false',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'slotslaunch.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.slotslaunch.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Removed/deleted pages
      {
        source: '/pacanele-gratis/pacanele-cu-femei',
        destination: '/pacanele-gratis/',
        permanent: true,
      },
      // Root-level loto URLs redirect to /loto-online-keno/ structure (matching live site)
      {
        source: '/loto-germania',
        destination: '/loto-online-keno/loto-germania',
        permanent: true,
      },
      {
        source: '/loto-irlanda',
        destination: '/loto-online-keno/loto-irlanda',
        permanent: true,
      },
      {
        source: '/loto-danemarca',
        destination: '/loto-online-keno/loto-danemarca',
        permanent: true,
      },
      {
        source: '/loto-elvetia-6-42',
        destination: '/loto-online-keno/loto-elvetia-6-42',
        permanent: true,
      },
      {
        source: '/loto-canada-atlantic-bucko',
        destination: '/loto-online-keno/loto-canada-atlantic-bucko',
        permanent: true,
      },
      {
        source: '/loto-italia-bari',
        destination: '/loto-online-keno/loto-italia-bari',
        permanent: true,
      },
      {
        source: '/loto-italia-cagliari',
        destination: '/loto-online-keno/loto-italia-cagliari',
        permanent: true,
      },
      {
        source: '/loto-italia-florenta',
        destination: '/loto-online-keno/loto-italia-florenta',
        permanent: true,
      },
      {
        source: '/loto-italia-genova',
        destination: '/loto-online-keno/loto-italia-genova',
        permanent: true,
      },
      {
        source: '/loto-italia-napoli',
        destination: '/loto-online-keno/loto-italia-napoli',
        permanent: true,
      },
      {
        source: '/loto-new-york-pick',
        destination: '/loto-online-keno/loto-new-york-pick',
        permanent: true,
      },
      {
        source: '/loto-norvegia',
        destination: '/loto-online-keno/loto-norvegia',
        permanent: true,
      },
      {
        source: '/loto-slovacia',
        destination: '/loto-online-keno/loto-slovacia',
        permanent: true,
      },
      {
        source: '/loto-turcia',
        destination: '/loto-online-keno/loto-turcia',
        permanent: true,
      },
      // Additional loto redirects from WordPress mapping
      {
        source: '/loto/keno-franta-20-70',
        destination: '/loto-online-keno/keno-franta-20-70',
        permanent: true,
      },
      {
        source: '/loto/belgia-6-45-si-keno-20-70',
        destination: '/loto-online-keno/belgia-6-45-si-keno-20-70',
        permanent: true,
      },
      {
        source: '/loto/keno-washington-daily-20-80',
        destination: '/loto-online-keno/keno-washington-daily-20-80',
        permanent: true,
      },
      {
        source: '/loto/ungaria-putto-8-20',
        destination: '/loto-online-keno/ungaria-putto-8-20',
        permanent: true,
      },
      {
        source: '/loto/cehia-keno-12-60',
        destination: '/loto-online-keno/cehia-keno-12-60',
        permanent: true,
      },
      {
        source: '/loto/finlanda-keno-20-70',
        destination: '/loto-online-keno/finlanda-keno-20-70',
        permanent: true,
      },
      {
        source: '/loto/wisconsin-badger-5-31',
        destination: '/loto-online-keno/wisconsin-badger-5-31',
        permanent: true,
      },
      {
        source: '/loto/pennsylvania-treasure-hunt',
        destination: '/loto-online-keno/pennsylvania-treasure-hunt',
        permanent: true,
      },
      // Payment method pages redirect to /metode-de-plata/ structure (matching live site)
      {
        source: '/cazinouri-cu-cardul',
        destination: '/metode-de-plata/cazinouri-cu-cardul',
        permanent: true,
      },
      {
        source: '/cazinouri-cu-portofele-electronice',
        destination: '/metode-de-plata/cazinouri-cu-portofele-electronice',
        permanent: true,
      },
      // Author pages: /autori/ → /author/ (for backward compatibility)
      {
        source: '/autori/:slug*',
        destination: '/author/:slug*',
        permanent: true,
      },
      // Blog content redirects (bonusuri, sport, ghid, categories)
      // Wildcard redirects for /blog/ prefix (WordPress URL rewriting)
      {
        source: '/blog/bonusuri/:slug*',
        destination: '/casino/:slug*/',
        permanent: true,
      },
      {
        source: '/blog/sport/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/',
        permanent: true,
      },
      // Bonus pages mapped to casino reviews
      {
        source: '/bonusuri/weissbet-bonus-casino',
        destination: '/casino/weissbet-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/rolletto-bonus-fara-depunere',
        destination: '/casino/rolletto-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/gamblezen-bonus-de-bun-venit',
        destination: '/casino/gamblezen-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/vavada-casino-bonus',
        destination: '/casino/vavada-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/spinbetter-bonus-casino',
        destination: '/casino/spinbetter-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/oscarspin-bonus',
        destination: '/casino/oscarspin-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/hitnspin-casino-bonus',
        destination: '/casino/hitnspin-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/rolletto-bonus-casino',
        destination: '/casino/rolletto-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/gratowin-bonus-50-rotiri-fara-verificare',
        destination: '/casino/gratowin-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/ice-casino-bonus',
        destination: '/casino/ice-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/megapari-100-rotiri',
        destination: '/casino/megapari-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/verde-casino-bonus',
        destination: '/casino/verde-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/fairspin-bonus',
        destination: '/casino/fairspin-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/20bet-bonus-casino',
        destination: '/casino/20bet-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/vulkan-vegas-bonus',
        destination: '/casino/vulkan-vegas-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/megapari-bonus-casino',
        destination: '/casino/megapari-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/wizebets-bonus-casino',
        destination: '/casino/wizebets-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/velobet-bonus-de-bun-venit',
        destination: '/casino/velobet-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/chipz-casino-bonus',
        destination: '/casino/chipz-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/betify-casino-bonus',
        destination: '/casino/betify-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/casinia-casino-bonus',
        destination: '/casino/casinia-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/boomerang-bet-casino-bonus',
        destination: '/casino/boomerang-casino/',
        permanent: true,
      },
      {
        source: '/bonusuri/spinrollz-casino-bonus',
        destination: '/casino/spinrollz-casino/',
        permanent: true,
      },
      // Generic bonus pages to homepage
      {
        source: '/bonusuri/50-rotiri-gratuite-fara-depunere',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bonusuri/300-rotiri-gratuite-fara-depunere',
        destination: '/',
        permanent: true,
      },
      {
        source: '/bonusuri/150-rotiri-gratuite-fara-verificare-hotline',
        destination: '/',
        permanent: true,
      },
      // Sport content to homepage
      {
        source: '/sport/calendar-sportiv-2025',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/cei-mai-buni-jucatori-de-tenis-romani',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/pariuri-darts',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/cat-dureaza-un-meci-de-volei',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/cat-dureaza-un-meci-de-hochei',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/ce-inseamna-play-off',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/ce-inseamna-gg3-la-pariuri',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/pariuri-pe-cornere',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/cat-dureaza-un-meci-de-baschet',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/ce-inseamna-psf-la-pariuri',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/pariuri-cartonase',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/cat-dureaza-un-meci-de-handbal',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/competitii-romania-2025',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/pariuri-handicap-asiatic-european',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sport/calculator-cote-pariuri',
        destination: '/',
        permanent: true,
      },
      // Guide pages to homepage
      {
        source: '/ghid/reguli-razboi',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ghid/cum-sa-castigi-la-aparate',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ghid/cat-castigi-cu-o-linie-de-septari',
        destination: '/',
        permanent: true,
      },
      // Category archives
      {
        source: '/category/bonusuri',
        destination: '/',
        permanent: true,
      },
      {
        source: '/category/sport/page/2',
        destination: '/',
        permanent: true,
      },
      {
        source: '/category/loto',
        destination: '/loto-online-keno/',
        permanent: true,
      },
      {
        source: '/category/ghid',
        destination: '/',
        permanent: true,
      },
      {
        source: '/category/bonusuri/page/3',
        destination: '/',
        permanent: true,
      },
      // Blog pagination
      {
        source: '/blog/page/2',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/page/3',
        destination: '/',
        permanent: true,
      },
      // Author pagination to author page
      {
        source: '/author/cristinar/page/:page',
        destination: '/author/cristinar/',
        permanent: true,
      },
      {
        source: '/author/:slug/page/:page',
        destination: '/author/:slug/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
