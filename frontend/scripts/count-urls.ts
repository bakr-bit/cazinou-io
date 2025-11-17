// Script to count all URLs in the site
import {client} from '../sanity/lib/client'

async function countUrls() {
  console.log('📊 Counting all URLs...\n')

  // Count different content types from Sanity
  const counts = await client.fetch(`{
    "pages": count(*[_type == "page"]),
    "infoPa": count(*[_type == "infoPage"]),
    "casinoReviews": count(*[_type == "casinoReview"]),
    "lotoPages": count(*[_type == "loto"]),
    "themedSlotsPages": count(*[_type == "themedSlotsPage"]),
    "posts": count(*[_type == "post"]),
    "games": count(*[_type == "game"])
  }`)

  console.log('Sanity Content:')
  console.log(`  Pages: ${counts.pages}`)
  console.log(`  Info Pages: ${counts.infoPa}`)
  console.log(`  Casino Reviews: ${counts.casinoReviews}`)
  console.log(`  Loto Pages: ${counts.lotoPages}`)
  console.log(`  Themed Slots Pages: ${counts.themedSlotsPages}`)
  console.log(`  Posts: ${counts.posts}`)
  console.log(`  Individual Games: ${counts.games}`)

  // Static pages
  const staticPages = 1 // homepage
  console.log(`\nStatic Pages: ${staticPages}`)

  // Calculate total
  const total =
    staticPages +
    counts.pages +
    counts.infoPa +
    counts.casinoReviews +
    counts.lotoPages +
    counts.themedSlotsPages +
    counts.posts +
    counts.games

  console.log(`\n✅ Total URLs: ${total.toLocaleString()}`)

  // Breakdown by URL pattern
  console.log(`\nURL Patterns:`)
  console.log(`  / (homepage): 1`)
  console.log(`  /{slug} (pages + info): ${counts.pages + counts.infoPa}`)
  console.log(`  /casino/{slug}: ${counts.casinoReviews}`)
  console.log(`  /loto-online/{slug}: ${counts.lotoPages}`)
  console.log(`  /pacanele-gratis/{slug}: ${counts.themedSlotsPages}`)
  console.log(`  /posts/{slug}: ${counts.posts}`)
  console.log(`  /pacanele/{id}-{slug}: ${counts.games}`)
}

countUrls().catch(console.error)
