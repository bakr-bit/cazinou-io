// studio/scripts/lib/image-uploader.ts
// Utility to download images from WordPress and upload to Sanity

import {type SanityClient} from '@sanity/client'
import crypto from 'crypto'

interface UploadedImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

// Cache to avoid re-uploading the same image
const imageCache = new Map<string, UploadedImage>()

/**
 * Generate a hash for an image URL to use as cache key
 */
function hashUrl(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex')
}

/**
 * Download image from URL
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MetadataSync/1.0)',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to download image: HTTP ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Extract filename and extension from URL
 */
function getFilenameFromUrl(url: string): { filename: string; ext: string } {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const parts = pathname.split('/')
    const filenameWithExt = parts[parts.length - 1] || 'image'

    const lastDotIndex = filenameWithExt.lastIndexOf('.')
    if (lastDotIndex === -1) {
      return { filename: filenameWithExt, ext: 'jpg' }
    }

    const filename = filenameWithExt.substring(0, lastDotIndex)
    const ext = filenameWithExt.substring(lastDotIndex + 1).toLowerCase()

    return { filename, ext }
  } catch {
    return { filename: 'image', ext: 'jpg' }
  }
}

/**
 * Get MIME type from extension
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }

  return mimeTypes[ext.toLowerCase()] || 'image/jpeg'
}

/**
 * Upload image to Sanity and return image reference
 */
export async function uploadImageToSanity(
  client: SanityClient,
  imageUrl: string,
  dryRun = false
): Promise<UploadedImage | null> {
  try {
    // Check cache first
    const cacheKey = hashUrl(imageUrl)
    if (imageCache.has(cacheKey)) {
      console.log(`  💾 Using cached image for ${imageUrl}`)
      return imageCache.get(cacheKey)!
    }

    if (dryRun) {
      console.log(`  🖼️  [DRY RUN] Would upload image from ${imageUrl}`)
      return null
    }

    console.log(`  📥 Downloading image from ${imageUrl}...`)
    const imageBuffer = await downloadImage(imageUrl)

    const { filename, ext } = getFilenameFromUrl(imageUrl)
    const mimeType = getMimeType(ext)

    console.log(`  ⬆️  Uploading ${filename}.${ext} to Sanity...`)

    // Upload to Sanity
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: `${filename}.${ext}`,
      contentType: mimeType,
    })

    const uploadedImage: UploadedImage = {
      _type: 'image',
      asset: {
        _ref: asset._id,
        _type: 'reference',
      },
    }

    // Cache the result
    imageCache.set(cacheKey, uploadedImage)

    console.log(`  ✅ Uploaded image: ${asset._id}`)

    return uploadedImage
  } catch (error) {
    console.error(`  ❌ Failed to upload image ${imageUrl}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

/**
 * Clear the image cache
 */
export function clearImageCache() {
  imageCache.clear()
}

/**
 * Get cache statistics
 */
export function getImageCacheStats() {
  return {
    size: imageCache.size,
    entries: Array.from(imageCache.keys()),
  }
}
