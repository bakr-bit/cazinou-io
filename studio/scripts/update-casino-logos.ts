// studio/scripts/update-casino-logos.ts
// Script to update casino logos from webp files in public/images/casino
// Usage:
//   Dry run: npx sanity exec scripts/update-casino-logos.ts --with-user-token
//   Apply:   npx sanity exec scripts/update-casino-logos.ts --with-user-token -- --apply

import {getCliClient} from 'sanity/cli'
import * as fs from 'fs'
import * as path from 'path'

const LOGOS_DIR = path.resolve(__dirname, '../../frontend/public/images/casino')
const APPLY_FLAG = process.argv.includes('--apply')

type Casino = {
  _id: string
  name: string
  slug: {current: string}
  logo?: {
    asset?: {
      _ref: string
    }
  }
}

type LogoFile = {
  filename: string
  filepath: string
  slug: string
}

/**
 * Extract slug from filename
 * Examples:
 *   20bet-casino.webp -> 20bet-casino
 *   casinojoy.webp -> casinojoy
 *   wincasino-romania.webp -> wincasino-romania
 */
function extractSlug(filename: string): string {
  // Remove .webp extension only
  const slug = filename.replace(/\.webp$/i, '')

  return slug
}

/**
 * Read all webp files from logos directory
 */
function getLogoFiles(): LogoFile[] {
  if (!fs.existsSync(LOGOS_DIR)) {
    console.error(`❌ Logos directory not found: ${LOGOS_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(LOGOS_DIR)
  const webpFiles = files.filter(f => f.toLowerCase().endsWith('.webp'))

  return webpFiles.map(filename => ({
    filename,
    filepath: path.join(LOGOS_DIR, filename),
    slug: extractSlug(filename),
  }))
}

/**
 * Fetch all casino documents from Sanity
 */
async function fetchCasinos(client: any): Promise<Casino[]> {
  const casinos = await client.fetch<Casino[]>(`
    *[_type == "casino"] | order(name asc) {
      _id,
      name,
      slug,
      logo {
        asset->{_ref}
      }
    }
  `)

  return casinos
}

/**
 * Match logo files to casino documents
 */
function matchLogosToCasinos(logoFiles: LogoFile[], casinos: Casino[]) {
  const matches: Array<{logo: LogoFile; casino: Casino}> = []
  const unmatchedLogos: LogoFile[] = []
  const unmatchedCasinos: Casino[] = [...casinos]

  for (const logo of logoFiles) {
    const casino = casinos.find(c => c.slug.current === logo.slug)

    if (casino) {
      matches.push({logo, casino})
      const index = unmatchedCasinos.findIndex(c => c._id === casino._id)
      if (index > -1) unmatchedCasinos.splice(index, 1)
    } else {
      unmatchedLogos.push(logo)
    }
  }

  return {matches, unmatchedLogos, unmatchedCasinos}
}

/**
 * Upload webp file to Sanity and update casino logo
 */
async function uploadAndUpdateLogo(
  client: any,
  casino: Casino,
  logoFile: LogoFile,
  dryRun: boolean
): Promise<void> {
  if (dryRun) {
    console.log(`   Would update: ${casino.name} (${casino.slug.current})`)
    console.log(`   File: ${logoFile.filename}`)
    return
  }

  try {
    // Read file as buffer
    const fileBuffer = fs.readFileSync(logoFile.filepath)

    // Upload to Sanity
    console.log(`   📤 Uploading ${logoFile.filename}...`)
    const asset = await client.assets.upload('image', fileBuffer, {
      filename: `${logoFile.slug}-logo.webp`,
      contentType: 'image/webp',
    })

    // Update casino document
    console.log(`   💾 Updating ${casino.name}...`)
    await client
      .patch(casino._id)
      .set({
        logo: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
      })
      .commit()

    console.log(`   ✅ Updated ${casino.name}`)
  } catch (error) {
    console.error(`   ❌ Failed to update ${casino.name}:`, error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🎨 Casino Logo Update Script\n')
  console.log(`Mode: ${APPLY_FLAG ? '🔴 APPLY (will make changes)' : '🟡 DRY RUN (preview only)'}\n`)

  const client = getCliClient()

  // Step 1: Get logo files
  console.log('📁 Reading logo files...')
  const logoFiles = getLogoFiles()
  console.log(`   Found ${logoFiles.length} webp files\n`)

  // Step 2: Fetch casinos
  console.log('🎰 Fetching casino documents...')
  const casinos = await fetchCasinos(client)
  console.log(`   Found ${casinos.length} casino documents\n`)

  // Step 3: Match logos to casinos
  console.log('🔗 Matching logos to casinos...')
  const {matches, unmatchedLogos, unmatchedCasinos} = matchLogosToCasinos(logoFiles, casinos)

  console.log(`   ✅ Matched: ${matches.length}`)
  console.log(`   ⚠️  Unmatched logos: ${unmatchedLogos.length}`)
  console.log(`   ⚠️  Unmatched casinos: ${unmatchedCasinos.length}\n`)

  // Report unmatched items
  if (unmatchedLogos.length > 0) {
    console.log('⚠️  Logo files without matching casino:')
    unmatchedLogos.forEach(logo => {
      console.log(`   - ${logo.filename} (extracted slug: "${logo.slug}")`)
    })
    console.log('')
  }

  if (unmatchedCasinos.length > 0) {
    console.log('⚠️  Casinos without matching logo file:')
    unmatchedCasinos.forEach(casino => {
      console.log(`   - ${casino.name} (slug: "${casino.slug.current}")`)
    })
    console.log('')
  }

  if (matches.length === 0) {
    console.log('❌ No matches found. Please check filenames and casino slugs.')
    process.exit(1)
  }

  // Step 4: Process matches
  console.log(`${APPLY_FLAG ? '🚀 Updating' : '👀 Preview of'} ${matches.length} casino logos:\n`)

  let successCount = 0
  let errorCount = 0

  for (const {logo, casino} of matches) {
    try {
      await uploadAndUpdateLogo(client, casino, logo, !APPLY_FLAG)
      successCount++
    } catch (error) {
      errorCount++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`   Total matches: ${matches.length}`)
  console.log(`   Successful: ${successCount}`)
  console.log(`   Errors: ${errorCount}`)
  console.log('='.repeat(60) + '\n')

  if (!APPLY_FLAG) {
    console.log('💡 This was a DRY RUN. No changes were made.')
    console.log('💡 To apply changes, run with --apply flag:\n')
    console.log('   npx sanity exec scripts/update-casino-logos.ts --with-user-token -- --apply\n')
  } else {
    console.log('✅ Logo update complete!\n')
  }
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Script failed:', error)
  process.exit(1)
})
