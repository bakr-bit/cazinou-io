import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
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
    ]
  },
}

export default nextConfig
