import { Redis } from '@upstash/redis'

// Redis client for caching lottery results and other data
// Uses Upstash Redis REST API (works serverless on any platform)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Type-safe cache keys
export const CACHE_KEYS = {
  LOTTERY_RESULTS: 'lottery:results',
  LOTTERY_UPDATED: 'lottery:updated',
} as const
