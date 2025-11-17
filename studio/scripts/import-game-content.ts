import {getCliClient} from 'sanity/cli'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const client = getCliClient()

// Path to markdown files
const CONTENT_DIR = '/Users/simon/cazino-all/cazinou-io/md content/pacanele-improved(additional content for demos)'

function generateKey() {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Parse inline markdown formatting (bold, italic, links)
 */
function parseInlineMarks(text: string): Array<{_type: 'span'; _key: string; text: string; marks: string[]}> {
  const spans: Array<{_type: 'span'; _key: string; text: string; marks: string[]}> = []

  // Simple regex-based parsing for bold and italic
  // This handles **bold**, *italic*, and [link](url) patterns

  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_)/g)

  for (const part of parts) {
    if (!part) continue

    const marks: string[] = []
    let cleanText = part

    // Check for bold
    if (part.startsWith('**') && part.endsWith('**')) {
      marks.push('strong')
      cleanText = part.slice(2, -2)
    }
    // Check for italic
    else if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      marks.push('em')
      cleanText = part.slice(1, -1)
    }

    // Remove links for now - just keep the text
    cleanText = cleanText.replace(/\[(.*?)\]\(.*?\)/g, '$1')

    if (cleanText) {
      spans.push({
        _type: 'span',
        _key: generateKey(),
        text: cleanText,
        marks,
      })
    }
  }

  // If no special formatting found, return simple span
  if (spans.length === 0) {
    // Remove links
    const cleanText = text.replace(/\[(.*?)\]\(.*?\)/g, '$1')
    return [{
      _type: 'span',
      _key: generateKey(),
      text: cleanText,
      marks: [],
    }]
  }

  return spans
}

/**
 * Convert markdown to Portable Text blocks
 */
function markdownToPortableText(markdown: string) {
  // Remove HTML comments
  markdown = markdown.replace(/<!--[\s\S]*?-->/g, '')

  // Split into lines
  const lines = markdown.trim().split('\n')
  const blocks: any[] = []

  let currentList: any = null
  let i = 0

  while (i < lines.length) {
    let line = lines[i].trim()

    // Skip empty lines
    if (!line) {
      // Close current list if any
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      i++
      continue
    }

    // Check for headings
    if (line.startsWith('####')) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'h4',
        markDefs: [],
        children: parseInlineMarks(line.substring(4).trim()),
      })
    } else if (line.startsWith('###')) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'h3',
        markDefs: [],
        children: parseInlineMarks(line.substring(3).trim()),
      })
    } else if (line.startsWith('##')) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'h2',
        markDefs: [],
        children: parseInlineMarks(line.substring(2).trim()),
      })
    } else if (line.startsWith('#')) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'h1',
        markDefs: [],
        children: parseInlineMarks(line.substring(1).trim()),
      })
    }
    // Check for list items
    else if (line.startsWith('–') || line.startsWith('-') || line.startsWith('*')) {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      // Create list item block
      const listText = line.replace(/^[–\-\*]\s*/, '')
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        listItem: 'bullet',
        markDefs: [],
        children: parseInlineMarks(listText),
      })
    }
    // Normal paragraph
    else {
      if (currentList) {
        blocks.push(currentList)
        currentList = null
      }
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        markDefs: [],
        children: parseInlineMarks(line),
      })
    }

    i++
  }

  // Add any remaining list
  if (currentList) {
    blocks.push(currentList)
  }

  return blocks
}

/**
 * Extract game slug from filename
 * e.g., "age-of-troy-demo-improved.md" -> "age-of-troy"
 */
function extractGameSlug(filename: string): string {
  return filename
    .replace('-demo-improved.md', '')
    .replace('-improved.md', '')
}

/**
 * Import content for a single game
 */
async function importGameContent(filePath: string, filename: string) {
  console.log(`\n📄 Processing: ${filename}`)

  // Read and parse the markdown file
  const content = await fs.readFile(filePath, 'utf-8')
  const {data: frontmatter, content: markdownContent} = matter(content)

  // Extract game slug from filename
  const gameSlug = extractGameSlug(filename)
  console.log(`   Game slug: ${gameSlug}`)

  // Find the game in Sanity by slotsLaunchSlug
  const game = await client.fetch(
    `*[_type == "game" && slotsLaunchSlug == $slug][0]{
      _id,
      name,
      slotsLaunchSlug,
      "hasContent": defined(seoContent)
    }`,
    {slug: gameSlug}
  )

  if (!game) {
    console.log(`   ⚠️  Game not found in Sanity: ${gameSlug}`)
    return {success: false, reason: 'not_found'}
  }

  console.log(`   ✅ Found game: ${game.name}`)

  if (game.hasContent) {
    console.log(`   ℹ️  Game already has content, skipping...`)
    return {success: false, reason: 'already_has_content'}
  }

  // Convert markdown to Portable Text
  console.log(`   🔄 Converting markdown to Portable Text...`)
  const portableTextBlocks = markdownToPortableText(markdownContent)

  console.log(`   ✅ Created ${portableTextBlocks.length} content blocks`)

  // Update the game with the content
  await client
    .patch(game._id)
    .set({seoContent: portableTextBlocks})
    .commit()

  console.log(`   ✅ Updated game with SEO content`)

  return {success: true, gameId: game._id, gameName: game.name}
}

/**
 * Main import function
 */
async function importAllGameContent() {
  console.log('🚀 Starting Game Content Import\n')
  console.log('='.repeat(70))

  // Check if directory exists
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    console.error(`\n❌ Content directory not found: ${CONTENT_DIR}`)
    process.exit(1)
  }

  // Read all markdown files
  const files = await fs.readdir(CONTENT_DIR)
  const mdFiles = files.filter(f => f.endsWith('-improved.md'))

  console.log(`\n📊 Found ${mdFiles.length} markdown files\n`)

  const results = {
    success: 0,
    notFound: 0,
    alreadyHasContent: 0,
    errors: 0,
  }

  // Process each file
  for (const file of mdFiles) {
    const filePath = path.join(CONTENT_DIR, file)

    try {
      const result = await importGameContent(filePath, file)

      if (result.success) {
        results.success++
      } else if (result.reason === 'not_found') {
        results.notFound++
      } else if (result.reason === 'already_has_content') {
        results.alreadyHasContent++
      }
    } catch (error) {
      console.log(`   ❌ Error: ${(error as Error).message}`)
      results.errors++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 Import Summary:\n')
  console.log(`   Total files: ${mdFiles.length}`)
  console.log(`   ✅ Successfully imported: ${results.success}`)
  console.log(`   ⚠️  Games not found in Sanity: ${results.notFound}`)
  console.log(`   ℹ️  Games already had content: ${results.alreadyHasContent}`)
  console.log(`   ❌ Errors: ${results.errors}`)
  console.log('='.repeat(70))
}

// Run the import
importAllGameContent().catch(error => {
  console.error('\n❌ Import failed:', error.message)
  console.error(error)
  process.exit(1)
})
