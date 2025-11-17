import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// Slug corrections: [current_slug, correct_slug]
const CORRECTIONS = [
  ['888starz-casino-revie', '888starz-casino'],
  ['snatch-casino-review', 'snatch-casino'],
]

async function updateIncorrectSlugs() {
  console.log('🔧 Updating incorrect slugs in Sanity...\n')

  for (const [currentSlug, correctSlug] of CORRECTIONS) {
    console.log(`📝 Updating: ${currentSlug} → ${correctSlug}`)

    try {
      // Find the document
      const doc = await client.fetch(
        `*[_type == "casinoReview" && slug.current == $slug][0]{_id, title}`,
        { slug: currentSlug }
      )

      if (!doc) {
        console.log(`   ⚠️  Document not found: ${currentSlug}`)
        continue
      }

      // Update the slug
      await client
        .patch(doc._id)
        .set({ 'slug.current': correctSlug })
        .commit()

      console.log(`   ✅ Updated successfully: ${doc.title}`)
    } catch (error) {
      console.log(`   ❌ Error updating ${currentSlug}:`, (error as Error).message)
    }
  }

  console.log('\n✅ Done!\n')
}

updateIncorrectSlugs().catch(console.error)
