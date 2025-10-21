import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

const casinoCoreFields = /* groq */ `
  _id,
  name,
  slug,
  logo,
  featuredBanner,
  rating,
  welcomeBonus,
  affiliateLink,
  pros,
  cons,
  keyFeatures,
  legalEntity,
  crypto,
  mobile,
  liveCasino,
  numberOfGames,
  trustRating,
  bonusRating,
  paymentRating,
  withdrawalRating,
  minimumDeposit,
  maximumDeposit,
  paymentMethods,
  companyInfo {
    establishedYear,
    licenses[] {
      license,
      licenseNumber,
      licenseAuthority
    }
  }
`

export const homePageQuery = defineQuery(`
  *[_type == "homePage"][0]{
    _id,
    title,
    heroBanner,
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions
          }
        }
      },
      _type == "authorComment" => {
        ...,
        avatar {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          }
        }
      },
      _type == "topListObject" => {
        ...,
        displayOptions,
        listItems[]{
          ...,
          item->{
            _type,
            _id,
            name,
            slug,
            affiliateLink,
            logo,
            rating,
            welcomeBonus,
            "license": companyInfo.licenses[0].license,
            paymentMethods,
            keyFeatures,
            crypto,
            mobile,
            liveCasino,
            minimumDeposit,
            maximumDeposit,
            numberOfGames,
            companyInfo {
              establishedYear
            }
          }
        }
      },
      _type == "faqSection" => {
        ...,
        faqs[]{
          question,
          answer
        }
      },
      _type == "featuredCasino" => {
        ...,
        casino->{
          ${casinoCoreFields}
        }
      },
      _type == "featuredGame" => {
        ...,
        affiliateLink,
        game->{
          _id,
          name,
          slug,
          slotsLaunchSlug,
          slotsLaunchThumb,
          rating,
          mainImage,
          provider->{
            name
          }
        }
      },
      _type == "featuredGamesGrid" => {
        ...,
        games[]->{
          _id,
          name,
          slug,
          slotsLaunchSlug,
          slotsLaunchThumb,
          mainImage {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            },
            alt
          },
          provider->{
            name
          },
          rating
        }
      },
      _type == "callToAction" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current
          }
        }
      },
      _type == "bonusCalculator" => {
        ...
      },
      _type == "reviewMethodology" => {
        ...,
        criteria[]{
          _key,
          iconName,
          customIcon {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            },
            alt
          },
          title,
          description
        }
      },
      _type == "beginnersGuide" => {
        ...,
        topics[]{
          _key,
          iconName,
          customIcon {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            },
            alt
          },
          title,
          shortDescription,
          detailedExplanation,
          exampleValues,
          colorTheme
        }
      },
      _type == "authorIntroSection" => {
        ...,
        author->{
          _id,
          firstName,
          lastName,
          slug,
          picture {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            },
            alt
          },
          role,
          bio,
          expertise,
          yearsOfExperience,
          credentials,
          socialMedia
        }
      },
      markDefs[]{
        ...,
        _type == "link" => {
          ...,
          href
        }
      }
    },
    seo {
      metaTitle,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage
    }
  }
`)

const casinoReviewFields = /* groq */ `
  title,
  publishedAt,
  excerpt,
  seo,
  body,
  casino->{
    ${casinoCoreFields}
  }
`

const reviewFields = /* groq */ `
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  tldr,
  locale,
  content[] {
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions
        }
      }
    },
    _type == "authorComment" => {
      ...,
      avatar {
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions
          }
        }
      }
    }
  },
  faq[] {
    question,
    answer
  },
  seo {
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    modifiedAt
  },
  casino->{
    ${casinoCoreFields}
  },
  author->{
    _id,
    firstName,
    lastName,
    slug,
    picture {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions
        }
      },
      alt
    },
    role,
    bio,
    expertise,
    yearsOfExperience,
    credentials,
    socialMedia
  },
  "similarCasinos": *[_type == "casino" && _id != ^.casino._ref && (
    companyInfo.licenses[0].licenseAuthority == ^.casino->companyInfo.licenses[0].licenseAuthority ||
    (rating >= ^.casino->rating - 1.5 && rating <= ^.casino->rating + 1.5)
  )][0...4]{
    _id,
    name,
    slug,
    logo {
      asset->{
        url,
        metadata {
          lqip
        }
      },
      alt
    },
    rating,
    crypto,
    mobile,
    liveCasino,
    welcomeBonus
  }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ${linkFields},
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
      _type == "topListObject" => {
        ...,
        displayOptions,
        listItems[]{
          ...,
          item->{
            _type,
            _id,
            name,
            slug,
            affiliateLink,
            logo,
            rating,
            welcomeBonus,
            "license": companyInfo.licenses[0].license,
            paymentMethods,
            keyFeatures,
            crypto,
            mobile,
            liveCasino,
            minimumDeposit,
            maximumDeposit,
            numberOfGames,
            companyInfo {
              establishedYear
            }
          }
        }
      },
    },
  }
`)

export const casinoReviewQuery = defineQuery(`
  *[_type == "casinoReview" && slug.current == $slug][0]{
    ${casinoReviewFields}
  }
`)

export const casinoPageQuery = defineQuery(`
  *[_type == "casino" && slug.current == $slug][0]{
    ${casinoCoreFields},
    review->{
      ${casinoReviewFields}
    }
  }
`)

export const casinoSlugs = defineQuery(`
  *[_type == "casino" && defined(slug.current)]{
    "slug": slug.current
  }
`)

export const casinoBySlugQuery = defineQuery(`
  *[_type == "casino" && slug.current == $slug][0]{
    ${casinoCoreFields}
  }
`)

export const slotsPageSettingsQuery = defineQuery(`
  *[_type == "slotsPageSettings"][0]{
    featuredCasino->{
      ${casinoCoreFields}
    },
    featuredGamesGrid {
      title,
      description,
      games[]->{
        _id,
        name,
        slug,
        slotsLaunchSlug,
        slotsLaunchThumb,
        mainImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        },
        provider->{
          name
        },
        rating
      }
    },
    content
  }
`)

export const lotoPageSettingsQuery = defineQuery(`
  *[_type == "lotoPageSettings"][0]{
    heading,
    description,
    featuredCasino->{
      ${casinoCoreFields}
    },
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions
          }
        }
      },
      _type == "authorComment" => {
        ...,
        avatar {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          }
        }
      },
      _type == "topListObject" => {
        ...,
        displayOptions,
        listItems[]{
          ...,
          item->{
            ${casinoCoreFields}
          }
        }
      },
      _type == "faqSection" => {
        ...,
        faqs[]{
          question,
          answer
        }
      },
      _type == "featuredCasino" => {
        ...,
        casino->{
          ${casinoCoreFields}
        }
      },
      _type == "featuredGame" => {
        ...,
        affiliateLink,
        game->{
          _id,
          name,
          slug,
          slotsLaunchSlug,
          slotsLaunchThumb,
          rating,
          mainImage,
          provider->{
            name
          }
        }
      },
      _type == "callToAction" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current
          }
        }
      },
      _type == "bonusCalculator" => {
        ...
      },
      markDefs[]{
        ...,
        _type == "link" => {
          ...,
          href
        }
      }
    },
    seo {
      metaTitle,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage
    }
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" || _type == "casinoReview" || _type == "infoPage" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[(_type == "page" || _type == "infoPage") && defined(slug.current)]
  {"slug": slug.current}
`)

export const getPageOrInfoPageQuery = defineQuery(`
  *[(_type == "page" || _type == "infoPage") && slug.current == $slug][0]{
    _id,
    _type,
    _type == "page" => {
      name,
      slug,
      heading,
      subheading,
      "pageBuilder": pageBuilder[]{
        ...,
        _type == "callToAction" => {
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
          },
        },
        _type == "infoSection" => {
          content[]{
            ...,
            markDefs[]{
              ...,
              _type == "link" => {
                "page": page->slug.current,
                "post": post->slug.current
              }
            }
          }
        },
        _type == "topListObject" => {
          ...,
          displayOptions,
          listItems[]{
            ...,
            item->{
              _type,
              _id,
              name,
              slug,
              affiliateLink,
              logo,
              rating,
              welcomeBonus,
              "license": companyInfo.licenses[0].license,
              paymentMethods,
              keyFeatures,
              crypto,
              mobile,
              liveCasino,
              minimumDeposit,
              maximumDeposit,
              numberOfGames,
              companyInfo {
                establishedYear
              }
            }
          }
        },
      },
    },
    _type == "infoPage" => {
      title,
      slug,
      heading,
      subheading,
      excerpt,
      publishedAt,
      locale,
      author->{
        _id,
        firstName,
        lastName,
        slug,
        picture {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        },
        role,
        bio,
        expertise,
        yearsOfExperience,
        credentials,
        socialMedia
      },
      content[]{
        ...,
        _type == "image" => {
          ...,
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          }
        },
        _type == "authorComment" => {
          ...,
          avatar {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            }
          }
        },
        _type == "topListObject" => {
          ...,
          displayOptions,
          listItems[]{
            ...,
            item->{
              _type,
              _id,
              name,
              slug,
              affiliateLink,
              logo,
              rating,
              welcomeBonus,
              "license": companyInfo.licenses[0].license,
              paymentMethods,
              keyFeatures,
              crypto,
              mobile,
              liveCasino,
              minimumDeposit,
              maximumDeposit,
              numberOfGames,
              companyInfo {
                establishedYear
              }
            }
          }
        },
        _type == "faqSection" => {
          ...,
          faqs[]{
            question,
            answer
          }
        },
        _type == "featuredCasino" => {
          ...,
          casino->{
            ${casinoCoreFields}
          }
        },
        _type == "featuredGamesGrid" => {
          ...,
          games[]->{
            _id,
            name,
            slug,
            slotsLaunchSlug,
            slotsLaunchThumb,
            mainImage {
              asset->{
                _id,
                url,
                metadata {
                  lqip,
                  dimensions
                }
              },
              alt
            },
            provider->{
              name
            },
            rating
          }
        },
        _type == "callToAction" => {
          ...,
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current
            }
          }
        },
        _type == "bonusCalculator" => {
          ...
        },
        markDefs[]{
          ...,
          _type == "link" => {
            ...,
            href
          }
        }
      },
      seo {
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImage,
        twitterTitle,
        twitterDescription,
        twitterImage,
        modifiedAt
      }
    }
  }
`)

export const reviewBySlugQuery = defineQuery(`
  *[_type == "casinoReview" && slug.current == $slug][0]{
    ${reviewFields}
  }
`)

export const reviewSlugsQuery = defineQuery(`
  *[_type == "casinoReview" && defined(slug.current)]
  {"slug": slug.current}
`)

export const gameContentBySlugQuery = defineQuery(`
  *[_type == "game" && (slotsLaunchSlug == $slug || slotsLaunchId == $id)][0]{
    _id,
    name,
    slug,
    slotsLaunchId,
    slotsLaunchSlug,
    rating,
    mainImage {
      asset->{
        _id,
        url,
        metadata {
          lqip,
          dimensions
        }
      },
      alt
    },
    provider->{
      name
    },
    seoContent
  }
`)

export const infoPageBySlugQuery = defineQuery(`
  *[_type == "infoPage" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    slug,
    heading,
    subheading,
    excerpt,
    publishedAt,
    locale,
    author->{
      _id,
      firstName,
      lastName,
      slug,
      picture {
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions
          }
        },
        alt
      },
      role,
      bio,
      expertise,
      yearsOfExperience,
      credentials,
      socialMedia
    },
    content[]{
      ...,
      _type == "image" => {
        ...,
        asset->{
          _id,
          url,
          metadata {
            lqip,
            dimensions
          }
        }
      },
      _type == "authorComment" => {
        ...,
        avatar {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          }
        }
      },
      _type == "topListObject" => {
        ...,
        displayOptions,
        listItems[]{
          ...,
          item->{
            _type,
            _id,
            name,
            slug,
            affiliateLink,
            logo,
            rating,
            welcomeBonus,
            "license": companyInfo.licenses[0].license,
            paymentMethods,
            keyFeatures,
            crypto,
            mobile,
            liveCasino,
            minimumDeposit,
            maximumDeposit,
            numberOfGames,
            companyInfo {
              establishedYear
            }
          }
        }
      },
      _type == "faqSection" => {
        ...,
        faqs[]{
          question,
          answer
        }
      },
      _type == "featuredCasino" => {
        ...,
        casino->{
          ${casinoCoreFields}
        }
      },
      _type == "featuredGame" => {
        ...,
        affiliateLink,
        game->{
          _id,
          name,
          slug,
          slotsLaunchSlug,
          slotsLaunchThumb,
          rating,
          mainImage,
          provider->{
            name
          }
        }
      },
      _type == "featuredGamesGrid" => {
        ...,
        games[]->{
          _id,
          name,
          slug,
          slotsLaunchSlug,
          slotsLaunchThumb,
          mainImage {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            },
            alt
          },
          provider->{
            name
          },
          rating
        }
      },
      _type == "callToAction" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current
          }
        }
      },
      _type == "bonusCalculator" => {
        ...
      },
      markDefs[]{
        ...,
        _type == "link" => {
          ...,
          href
        }
      }
    },
    seo {
      metaTitle,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      modifiedAt
    }
  }
`)

export const infoPageSlugsQuery = defineQuery(`
  *[_type == "infoPage" && defined(slug.current)]
  {"slug": slug.current}
`)
