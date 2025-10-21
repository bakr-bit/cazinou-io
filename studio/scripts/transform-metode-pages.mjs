#!/usr/bin/env node
/**
 * Transform metode-de-plata markdown pages to Sanity NDJSON format
 *
 * Handles 2 files from /import/new/metode/:
 * 1. cazinou.io_metode-de-plata_-improved.md → /metode-de-plata
 * 2. cazinou.io_metode-de-plata_cazinouri-cu-portofele-electronice_-improved.md
 *    → /metode-de-plata/cazinouri-cu-portofele-electronice
 */

import fs from 'fs/promises'
import path from 'path'
import {fileURLToPath} from 'url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const METODE_DIR = path.resolve(__dirname, '../../../import/new/metode')
const OUTPUT_FILE = path.join(__dirname, '../import-metode-pages.ndjson')

/**
 * Simple markdown to Portable Text conversion
 */
function markdownToPortableText(markdown) {
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
      continue
    }

    // Remove markdown formatting
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')

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

function generateId(prefix = 'doc') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

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
 * Map filename to proper slug
 */
function mapFilenameToSlug(filename) {
  const mapping = {
    'cazinou.io_metode-de-plata_-improved.md': 'metode-de-plata',
    'cazinou.io_metode-de-plata_cazinouri-cu-portofele-electronice_-improved.md':
      'metode-de-plata/cazinouri-cu-portofele-electronice',
  }

  return mapping[filename] || filename.replace('.md', '')
}

async function transformMetodePage(filePath, filename) {
  const slug = mapFilenameToSlug(filename)
  console.log(`\n📄 Processing: ${filename}`)
  console.log(`   Slug: ${slug}`)

  const content = await fs.readFile(filePath, 'utf-8')
  const {data: frontmatter, content: markdownContent} = matter(content)

  console.log(`   Title: ${frontmatter.title || 'No title'}`)

  const portableTextBlocks = markdownToPortableText(markdownContent)

  const faqSection = createFaqSection(frontmatter.faq)
  if (faqSection) {
    portableTextBlocks.push(faqSection)
    console.log(`   ✅ Added FAQ section with ${frontmatter.faq.length} items`)
  }

  return {
    _id: generateId('infoPage'),
    _type: 'infoPage',
    title: frontmatter.title || slug,
    slug: {
      _type: 'slug',
      current: slug,
    },
    heading: frontmatter.heading || frontmatter.title || slug,
    excerpt: frontmatter.excerpt || '',
    publishedAt: frontmatter.publishedAt || new Date().toISOString(),
    content: portableTextBlocks,
    seo: {
      metaTitle: frontmatter.seo?.metaTitle || frontmatter.title,
      metaDescription: frontmatter.seo?.metaDescription || frontmatter.excerpt || '',
      ogTitle: frontmatter.seo?.ogTitle,
      ogDescription: frontmatter.seo?.ogDescription,
    },
  }
}

async function main() {
  try {
    console.log('🚀 Transforming Metode-de-Plata Pages')
    console.log('='.repeat(50))

    // Check if directory exists
    try {
      await fs.access(METODE_DIR)
    } catch {
      console.error(`\n❌ Directory not found: ${METODE_DIR}`)
      process.exit(1)
    }

    const files = await fs.readdir(METODE_DIR)
    const mdFiles = files.filter(f => f.endsWith('.md'))

    console.log(`\nFound ${mdFiles.length} markdown files`)

    const documents = []

    for (const file of mdFiles) {
      const filePath = path.join(METODE_DIR, file)
      const doc = await transformMetodePage(filePath, file)
      documents.push(doc)
    }

    // Write NDJSON
    const ndjson = documents.map(doc => JSON.stringify(doc)).join('\n')
    await fs.writeFile(OUTPUT_FILE, ndjson, 'utf-8')

    console.log(`\n\n✅ Transformation Complete!`)
    console.log('='.repeat(50))
    console.log(`📊 Transformed ${documents.length} metode pages`)
    console.log(`\n📝 Output: ${path.basename(OUTPUT_FILE)}`)
    console.log(`\n📥 To import:`)
    console.log(`   cd studio`)
    console.log(`   sanity dataset import import-metode-pages.ndjson production`)

  } catch (error) {
    console.error('\n❌ Transformation failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
