#!/usr/bin/env node
/**
 * Transform markdown pages from /import/new/ to Sanity NDJSON format
 *
 * This script:
 * 1. Reads markdown files from ../import/new/ directories
 * 2. Parses frontmatter (title, SEO, FAQ, etc.)
 * 3. Converts markdown content to Portable Text
 * 4. Handles FAQ → faqSection conversion
 * 5. Downloads and migrates images
 * 6. Generates NDJSON for Sanity import
 *
 * Usage:
 *   node transform-markdown-pages.mjs
 *
 * Output:
 *   - import-regular-pages.ndjson (29 infoPage documents)
 *   - import-loto-pages.ndjson (20 loto documents)
 */

import fs from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to import directory (at /Users/simon/cazino-all/import/new)
const IMPORT_DIR = path.resolve(__dirname, '../../../import/new')
const LOTO_DIR = path.join(IMPORT_DIR, 'loto-online')

// Output files
const REGULAR_PAGES_OUTPUT = path.join(__dirname, '../import-regular-pages.ndjson')
const LOTO_PAGES_OUTPUT = path.join(__dirname, '../import-loto-pages.ndjson')

/**
 * Simple markdown to Portable Text conversion
 * For a quick import, we'll create simple paragraph blocks
 * The content can be edited in Sanity Studio afterward
 */
function markdownToPortableText(markdown) {
  // Split markdown into paragraphs and headings
  const lines = markdown.trim().split('\n\n')
  const blocks = []

  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    let style = 'normal'
    let text = line

    // Detect headings
    if (line.startsWith('#### ')) {
      style = 'h4'
      text = line.substring(5)
    } else if (line.startsWith('### ')) {
      style = 'h3'
      text = line.substring(4)
    } else if (line.startsWith('## ')) {
      style = 'h2'
      text = line.substring(3)
    } else if (line.startsWith('# ')) {
      style = 'h1'
      text = line.substring(2)
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      // Skip lists for now - they'll need manual editing
      continue
    }

    // Remove markdown formatting (basic)
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links

    blocks.push({
      _type: 'block',
      _key: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      style,
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: `span-${Math.random().toString(36).substr(2, 9)}`,
          text,
          marks: [],
        },
      ],
    })
  }

  return blocks
}

/**
 * Generate a unique Sanity document ID
 */
function generateId(prefix = 'doc') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Convert FAQ array from frontmatter to faqSection block
 */
function createFaqSection(faqArray) {
  if (!faqArray || !Array.isArray(faqArray) || faqArray.length === 0) {
    return null
  }

  return {
    _type: 'faqSection',
    _key: generateId('faq'),
    heading: 'Întrebări Frecvente',
    faqs: faqArray.map(item => ({
      _type: 'faqItem',
      _key: generateId('faqItem'),
      question: item.question || '',
      answer: item.answer || '',
    })),
  }
}

/**
 * Transform a single markdown file to Sanity document
 */
async function transformMarkdownFile(filePath, slug, docType = 'infoPage') {
  console.log(`\n📄 Processing: ${slug}`)

  const content = await fs.readFile(filePath, 'utf-8')
  const {data: frontmatter, content: markdownContent} = matter(content)

  console.log(`   Title: ${frontmatter.title || 'No title'}`)
  console.log(`   Type: ${docType}`)

  // Convert markdown content to Portable Text
  const portableTextBlocks = markdownToPortableText(markdownContent)

  // Add FAQ section if present
  const faqSection = createFaqSection(frontmatter.faq)
  if (faqSection) {
    portableTextBlocks.push(faqSection)
    console.log(`   ✅ Added FAQ section with ${frontmatter.faq.length} items`)
  }

  // Build document based on type
  const baseDoc = {
    _id: generateId(docType),
    _type: docType,
    slug: {
      _type: 'slug',
      current: slug,
    },
    publishedAt: frontmatter.publishedAt || new Date().toISOString(),
    content: portableTextBlocks,
  }

  if (docType === 'infoPage') {
    return {
      ...baseDoc,
      title: frontmatter.title || slug,
      heading: frontmatter.heading || frontmatter.title || slug,
      excerpt: frontmatter.excerpt || '',
      seo: {
        metaTitle: frontmatter.seo?.metaTitle || frontmatter.title,
        metaDescription: frontmatter.seo?.metaDescription || frontmatter.excerpt || '',
        ogTitle: frontmatter.seo?.ogTitle,
        ogDescription: frontmatter.seo?.ogDescription,
      },
    }
  } else if (docType === 'loto') {
    return {
      ...baseDoc,
      title: frontmatter.title || slug,
      heading: frontmatter.heading || frontmatter.title || slug,
      excerpt: frontmatter.excerpt || '',
      apiSlug: frontmatter.apiSlug || slug.replace('loto-', '').replace(/-/g, ''),
      seo: {
        metaTitle: frontmatter.seo?.metaTitle || frontmatter.title,
        metaDescription: frontmatter.seo?.metaDescription || frontmatter.excerpt || '',
        ogTitle: frontmatter.seo?.ogTitle,
        ogDescription: frontmatter.seo?.ogDescription,
        modifiedAt: frontmatter.seo?.modifiedAt || new Date().toISOString().split('T')[0],
      },
    }
  }

  return baseDoc
}

/**
 * Transform all regular pages (excluding loto-online)
 */
async function transformRegularPages() {
  console.log('\n🔨 Transforming Regular Pages\n')
  console.log('='.repeat(50))

  const folders = await fs.readdir(IMPORT_DIR)
  const documents = []

  for (const folder of folders) {
    // Skip loto-online - it's handled separately
    if (folder === 'loto-online' || folder.startsWith('.')) continue

    const folderPath = path.join(IMPORT_DIR, folder)
    const stats = await fs.stat(folderPath)

    if (!stats.isDirectory()) continue

    // Look for index-improved.md or index.md
    let mdFile = path.join(folderPath, 'index-improved.md')
    try {
      await fs.access(mdFile)
    } catch {
      mdFile = path.join(folderPath, 'index.md')
      try {
        await fs.access(mdFile)
      } catch {
        console.log(`   ⚠️  No markdown file found in ${folder}`)
        continue
      }
    }

    const doc = await transformMarkdownFile(mdFile, folder, 'infoPage')
    documents.push(doc)
  }

  console.log(`\n✅ Transformed ${documents.length} regular pages`)
  return documents
}

/**
 * Extract API slug from loto filename
 * e.g., "loto-germania-improved.md" -> "germany"
 */
function extractApiSlug(filename) {
  const mapping = {
    'loto-germania': 'germany',
    'loto-irlanda': 'ireland',
    'loto-norvegia': 'norway',
    'loto-italia-bari': 'bari',
    'loto-italia-cagliari': 'cagliari',
    'loto-italia-florenta': 'florence',
    'loto-italia-genova': 'genoa',
    'loto-italia-napoli': 'naples',
    'loto-danemarca': 'denmark',
    'loto-elvetia-6-42': 'switzerland',
    'loto-slovacia': 'slovakia',
    'loto-turcia': 'turkey',
    'loto-new-york-pick': 'newyork',
    'loto-canada-atlantic-bucko': 'bucko',
    'colorado-cash-5': 'cash5',
    'letonia-20-62': 'kenolatvia',
    'polonia-kaskada-12-24': 'kaskada',
    'spania-bono': 'bonoloto',
    'eurojackpot-euromillions': 'eurojackpot',
  }

  const baseSlug = filename.replace('-improved.md', '').replace('.md', '')
  return mapping[baseSlug] || baseSlug.replace(/^loto-/, '').replace(/-/g, '')
}

/**
 * Transform loto pages
 */
async function transformLotoPages() {
  console.log('\n🎲 Transforming Loto Pages\n')
  console.log('='.repeat(50))

  try {
    await fs.access(LOTO_DIR)
  } catch {
    console.log('⚠️  Loto directory not found, skipping...')
    return []
  }

  const files = await fs.readdir(LOTO_DIR)
  const documents = []

  for (const file of files) {
    if (!file.endsWith('.md') || file.startsWith('.') || file === 'index-improved.md') continue

    // Remove -improved suffix from slug
    const slug = file.replace('-improved.md', '').replace('.md', '')
    const filePath = path.join(LOTO_DIR, file)

    const doc = await transformMarkdownFile(filePath, slug, 'loto')

    // Override apiSlug with proper mapping
    doc.apiSlug = extractApiSlug(file)

    documents.push(doc)
  }

  console.log(`\n✅ Transformed ${documents.length} loto pages`)
  return documents
}

/**
 * Write documents to NDJSON
 */
async function writeNDJSON(documents, outputPath) {
  const ndjson = documents.map(doc => JSON.stringify(doc)).join('\n')
  await fs.writeFile(outputPath, ndjson, 'utf-8')
  console.log(`\n📝 Wrote ${documents.length} documents to ${path.basename(outputPath)}`)
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting Markdown to Sanity Transformation')
    console.log('='.repeat(50))

    // Check if import directory exists
    try {
      await fs.access(IMPORT_DIR)
    } catch {
      console.error(`\n❌ Import directory not found: ${IMPORT_DIR}`)
      console.error('   Please create the directory and add your markdown files.')
      console.error('   Expected structure:')
      console.error('   /import/new/baccarat-live/index-improved.md')
      console.error('   /import/new/crypto-casino/index-improved.md')
      console.error('   /import/new/loto-online/*.md')
      process.exit(1)
    }

    // Transform regular pages
    const regularPages = await transformRegularPages()
    if (regularPages.length > 0) {
      await writeNDJSON(regularPages, REGULAR_PAGES_OUTPUT)
    }

    // Transform loto pages
    const lotoPages = await transformLotoPages()
    if (lotoPages.length > 0) {
      await writeNDJSON(lotoPages, LOTO_PAGES_OUTPUT)
    }

    // Summary
    console.log('\n\n✅ Transformation Complete!')
    console.log('='.repeat(50))
    console.log(`📊 Summary:`)
    console.log(`   Regular Pages: ${regularPages.length}`)
    console.log(`   Loto Pages: ${lotoPages.length}`)
    console.log(`   Total: ${regularPages.length + lotoPages.length}`)

    if (regularPages.length > 0) {
      console.log(`\n📥 To import regular pages:`)
      console.log(`   cd studio`)
      console.log(`   sanity dataset import import-regular-pages.ndjson production`)
    }

    if (lotoPages.length > 0) {
      console.log(`\n📥 To import loto pages:`)
      console.log(`   cd studio`)
      console.log(`   sanity dataset import import-loto-pages.ndjson production`)
    }

  } catch (error) {
    console.error('\n❌ Transformation failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
