// lib/dev-cache.ts
import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.next', 'dev-cache')
const isDev = process.env.NODE_ENV === 'development'

/**
 * Simple file-based cache for development mode
 * Prevents hitting API rate limits during hot reloads
 */
export async function getDevCache<T>(
  key: string,
  ttlMinutes = 60
): Promise<T | null> {
  if (!isDev) return null

  try {
    const filePath = path.join(CACHE_DIR, `${key}.json`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const stats = fs.statSync(filePath)
    const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60

    // If cache is expired, delete and return null
    if (ageMinutes > ttlMinutes) {
      fs.unlinkSync(filePath)
      return null
    }

    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch (error) {
    console.warn(`Failed to read dev cache for ${key}:`, error)
    return null
  }
}

/**
 * Write data to dev cache
 */
export async function setDevCache<T>(key: string, data: T): Promise<void> {
  if (!isDev) return

  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true })
    }

    const filePath = path.join(CACHE_DIR, `${key}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.warn(`Failed to write dev cache for ${key}:`, error)
  }
}

/**
 * Clear all dev cache
 */
export async function clearDevCache(): Promise<void> {
  if (!isDev) return

  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR)
      files.forEach((file) => {
        fs.unlinkSync(path.join(CACHE_DIR, file))
      })
      console.log('✅ Dev cache cleared')
    }
  } catch (error) {
    console.warn('Failed to clear dev cache:', error)
  }
}
