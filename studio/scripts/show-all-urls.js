const {getCliClient} = require('sanity/cli')
const client = getCliClient()

async function getAllUrls() {
  const data = await client.fetch(`{
    "pages": *[_type == "page"]{"slug": slug.current},
    "infoPages": *[_type == "infoPage"]{"slug": slug.current},
    "casinoReviews": *[_type == "casinoReview"]{"slug": slug.current},
    "lotoPages": *[_type == "loto"]{"slug": slug.current},
    "themedSlotsPages": *[_type == "themedSlotsPage"]{"slug": slug.current},
    "posts": *[_type == "post"]{"slug": slug.current},
    "gamesCount": count(*[_type == "game"])
  }`)

  console.log('\n📊 URL STRUCTURE\n')
  console.log('cazinou.io/')
  console.log('├── / (homepage)')

  // Pages and Info Pages (same URL pattern)
  const allPages = [...(data.pages || []), ...(data.infoPages || [])]
  if (allPages.length > 0) {
    console.log(`├── /{slug} (${allPages.length} pages)`)
    allPages.forEach((p, i) => {
      const isLast = i === allPages.length - 1
      console.log(`│   ${isLast ? '└' : '├'}── /${p.slug}`)
    })
  }

  // Casino Reviews
  if (data.casinoReviews && data.casinoReviews.length > 0) {
    console.log(`├── /recenzii/{slug} (${data.casinoReviews.length} reviews)`)
    data.casinoReviews.forEach((p, i) => {
      const isLast = i === data.casinoReviews.length - 1
      console.log(`│   ${isLast ? '└' : '├'}── /recenzii/${p.slug}`)
    })
  }

  // Loto Pages
  if (data.lotoPages && data.lotoPages.length > 0) {
    console.log(`├── /loto-online/{slug} (${data.lotoPages.length} loto games)`)
    data.lotoPages.forEach((p, i) => {
      const isLast = i === data.lotoPages.length - 1
      console.log(`│   ${isLast ? '└' : '├'}── /loto-online/${p.slug}`)
    })
  }

  // Themed Slots Pages
  if (data.themedSlotsPages && data.themedSlotsPages.length > 0) {
    console.log(`├── /pacanele-gratis/{slug} (${data.themedSlotsPages.length} themed pages)`)
    data.themedSlotsPages.forEach((p, i) => {
      const isLast = i === data.themedSlotsPages.length - 1
      console.log(`│   ${isLast ? '└' : '├'}── /pacanele-gratis/${p.slug}`)
    })
  }

  // Posts
  if (data.posts && data.posts.length > 0) {
    console.log(`├── /posts/{slug} (${data.posts.length} posts)`)
    data.posts.forEach((p, i) => {
      const isLast = i === data.posts.length - 1
      console.log(`│   ${isLast ? '└' : '├'}── /posts/${p.slug}`)
    })
  }

  // Games
  if (data.gamesCount > 0) {
    console.log(`└── /pacanele/{id}-{slug} (${data.gamesCount} individual games)`)
  }

  const total = allPages.length +
                (data.casinoReviews?.length || 0) +
                (data.lotoPages?.length || 0) +
                (data.themedSlotsPages?.length || 0) +
                (data.posts?.length || 0) +
                (data.gamesCount || 0) +
                1 // homepage

  console.log(`\n✅ TOTAL URLs: ${total.toLocaleString()}\n`)
}

getAllUrls()
