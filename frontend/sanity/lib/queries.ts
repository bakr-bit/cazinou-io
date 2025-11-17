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
      },
  backgroundImage {
    asset->{
      _id,
      url,
      metadata {
        lqip,
        dimensions
      }
    },
    alt
  }
`

const casinoCoreFields = /* groq */ `
  _id,
  name,
  slug,
  logo {
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
  featuredBanner,
  rating,
  welcomeBonus,
  affiliateLink,
  "pros": coalesce(pros, []),
  "cons": coalesce(cons, []),
  "keyFeatures": coalesce(keyFeatures, []),
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
  "paymentMethods": coalesce(paymentMethods, []),
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
      _type == "linkableImage" => {
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
        "listItems": coalesce(listItems[]{
          ...,
          item->{
            _type,
            _id,
            name,
            slug,
            affiliateLink,
            logo {
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
            rating,
            welcomeBonus,
            "license": coalesce(companyInfo.licenses[0].license, ""),
            "paymentMethods": coalesce(paymentMethods, []),
            "keyFeatures": coalesce(keyFeatures, []),
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
        }, [])
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
        },
        backgroundImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        }
      },
      _type == "simpleButton" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current,
            "infoPage": infoPage->slug.current,
            "casinoReview": casinoReview->slug.current
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
      _type == "aboutUs" => {
        ...,
        items[]{
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
          content,
          colorTheme
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
    _type == "linkableImage" => {
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
        "listItems": coalesce(listItems[]{
          ...,
          item->{
            _type,
            _id,
            name,
            slug,
            affiliateLink,
            logo {
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
            rating,
            welcomeBonus,
            "license": coalesce(companyInfo.licenses[0].license, ""),
            "paymentMethods": coalesce(paymentMethods, []),
            "keyFeatures": coalesce(keyFeatures, []),
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
        }, [])
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
      _type == "linkableImage" => {
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
        "listItems": coalesce(listItems[]{
          ...,
          item->{
            ${casinoCoreFields}
          }
        }, [])
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
        },
        backgroundImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        }
      },
      _type == "simpleButton" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current,
            "infoPage": infoPage->slug.current,
            "casinoReview": casinoReview->slug.current
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

export const lotoSlugsQuery = defineQuery(`
  *[_type == "loto" && defined(slug.current)]
  {"slug": slug.current}
`)

export const lotoQuery = defineQuery(`
  *[_type == "loto" && slug.current == $slug][0]{
    _id,
    title,
    heading,
    excerpt,
    apiSlug,
    publishedAt,
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
      bio
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
      _type == "linkableImage" => {
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
        "listItems": coalesce(listItems[]{
          ...,
          item->{
            ${casinoCoreFields}
          }
        }, [])
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
        },
        backgroundImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        }
      },
      _type == "simpleButton" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current,
            "infoPage": infoPage->slug.current,
            "casinoReview": casinoReview->slug.current
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
      modifiedAt
    }
  }
`)

export const sitemapData = defineQuery(`
  *[
    (
      _type == "page" ||
      _type == "post" ||
      _type == "infoPage" ||
      _type == "loto" ||
      _type == "person" ||
      (_type == "casinoReview" && hidden != true) ||
      (_type == "themedSlotsPage" && hidden != true)
    ) && defined(slug.current)
  ] | order(_type asc) {
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
          backgroundImage {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            },
            alt
          }
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
              logo {
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
              rating,
              welcomeBonus,
              "license": coalesce(companyInfo.licenses[0].license, ""),
              "paymentMethods": coalesce(paymentMethods, []),
              "keyFeatures": coalesce(keyFeatures, []),
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
        _type == "linkableImage" => {
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
              logo {
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
              rating,
              welcomeBonus,
              "license": coalesce(companyInfo.licenses[0].license, ""),
              "paymentMethods": coalesce(paymentMethods, []),
              "keyFeatures": coalesce(keyFeatures, []),
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
          },
          backgroundImage {
            asset->{
              _id,
              url,
              metadata {
                lqip,
                dimensions
              }
            },
            alt
          }
        },
        _type == "simpleButton" => {
          ...,
          link {
            ...,
            _type == "link" => {
              "page": page->slug.current,
              "post": post->slug.current,
              "infoPage": infoPage->slug.current,
              "casinoReview": casinoReview->slug.current
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
      _type == "linkableImage" => {
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
        "listItems": coalesce(listItems[]{
          ...,
          item->{
            _type,
            _id,
            name,
            slug,
            affiliateLink,
            logo {
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
            rating,
            welcomeBonus,
            "license": coalesce(companyInfo.licenses[0].license, ""),
            "paymentMethods": coalesce(paymentMethods, []),
            "keyFeatures": coalesce(keyFeatures, []),
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
        }, [])
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
        },
        backgroundImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        }
      },
      _type == "simpleButton" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current,
            "infoPage": infoPage->slug.current,
            "casinoReview": casinoReview->slug.current
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

export const reviewsPageQuery = defineQuery(`
  *[_type == "reviewsPage"][0]{
    _id,
    title,
    heading,
    subheading,
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
      _type == "linkableImage" => {
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
      _type == "faqSection" => {
        ...,
        faqs[]{
          question,
          answer
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
        },
        backgroundImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
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
      ogImage
    }
  }
`)

export const allCasinoReviewsQuery = defineQuery(`
  *[_type == "casinoReview" && hidden != true] | order(publishedAt desc){
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    casino->{
      _id,
      name,
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
      welcomeBonus,
      affiliateLink
    },
    author->{
      firstName,
      lastName,
      picture {
        asset->{
          url,
          metadata {
            lqip
          }
        },
        alt
      }
    }
  }
`)

// Author Queries
export const allAuthorsQuery = defineQuery(`
  *[_type == "person"] | order(lastName asc, firstName asc){
    _id,
    firstName,
    lastName,
    slug,
    role,
    bio,
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
    expertise,
    yearsOfExperience
  }
`)

export const authorSlugsQuery = defineQuery(`
  *[_type == "person" && defined(slug.current)]
  {"slug": slug.current}
`)

export const authorBySlugQuery = defineQuery(`
  *[_type == "person" && slug.current == $slug][0]{
    _id,
    firstName,
    lastName,
    slug,
    role,
    bio,
    longBio[]{
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
      markDefs[]{
        ...,
        _type == "link" => {
          ...,
          href
        }
      }
    },
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
    expertise,
    yearsOfExperience,
    credentials,
    socialMedia
  }
`)

export const authorContentQuery = defineQuery(`
  {
    "reviews": *[_type == "casinoReview" && author._ref == $authorId] | order(publishedAt desc) [0...4]{
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      casino->{
        _id,
        name,
        logo {
          asset->{
            url,
            metadata {
              lqip
            }
          },
          alt
        },
        rating
      }
    },
    "posts": *[_type == "post" && author._ref == $authorId] | order(date desc) [0...4]{
      _id,
      title,
      slug,
      excerpt,
      date,
      coverImage
    },
    "infoPages": *[_type == "infoPage" && author._ref == $authorId] | order(publishedAt desc) [0...4]{
      _id,
      title,
      slug,
      excerpt,
      publishedAt
    },
    "lotoPages": *[_type == "loto" && author._ref == $authorId] | order(publishedAt desc) [0...4]{
      _id,
      title,
      slug,
      excerpt,
      publishedAt
    }
  }
`)

// Games Query
export const allGamesQuery = defineQuery(`
  *[_type == "game"] | order(name asc) {
    _id,
    name,
    slug,
    slotsLaunchId,
    slotsLaunchSlug,
    slotsLaunchThumb,
    rating,
    gameType,
    gameTypeSlug,
    themes,
    rtp,
    volatility,
    releaseDate,
    provider->{
      _id,
      name,
      slug
    }
  }
`)

// Themed Slots Page Queries
export const themedSlotsPageBySlugQuery = defineQuery(`
  *[_type == "themedSlotsPage" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    heading,
    description,
    filterType,
    filterValue,
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
      _type == "linkableImage" => {
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
        "listItems": coalesce(listItems[]{
          ...,
          item->{
            ${casinoCoreFields}
          }
        }, [])
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
        },
        backgroundImage {
          asset->{
            _id,
            url,
            metadata {
              lqip,
              dimensions
            }
          },
          alt
        }
      },
      _type == "simpleButton" => {
        ...,
        link {
          ...,
          _type == "link" => {
            "page": page->slug.current,
            "post": post->slug.current,
            "infoPage": infoPage->slug.current,
            "casinoReview": casinoReview->slug.current
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
      ogImage
    },
    publishedAt,
    "author": author->{
      firstName,
      lastName,
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
      }
    },
    hidden
  }
`)

export const themedSlotsPageSlugsQuery = defineQuery(`
  *[_type == "themedSlotsPage" && defined(slug.current) && hidden != true]
  {"slug": slug.current}
`)

export const allGameSlugsQuery = `
  *[_type == "game" && defined(slug.current)]
  {"slug": slug.current}
`
