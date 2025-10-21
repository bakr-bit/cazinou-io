// app/api/lotto/[game]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { GAMES } from "@/lib/lotto/registry";
import type { LottoResult } from "@/lib/lotto/types";

export const runtime = "edge";

/**
 * Upstash Redis client
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * GET /api/lotto/[game]
 * Returns cached lottery results for a specific game
 *
 * Examples:
 *   /api/lotto/ireland
 *   /api/lotto/keno_latvia
 *   /api/lotto/norway
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params;
  const gameKey = game.toLowerCase();

  // Validate game exists in registry
  if (!GAMES[gameKey]) {
    return NextResponse.json(
      {
        error: "unknown game",
        supported: Object.keys(GAMES)
      },
      { status: 404 }
    );
  }

  try {
    // Fetch from Redis cache (instant - <50ms)
    const cachedData = await redis.get<LottoResult>(`lotto:${gameKey}:latest`);

    if (!cachedData) {
      return NextResponse.json({
        game: gameKey,
        result: null,
        message: `No cached results available. Trigger POST /api/lotto/refresh with body {"game":"${gameKey}"} to populate cache.`,
      });
    }

    return NextResponse.json({
      game: gameKey,
      result: cachedData,
    });
  } catch (error) {
    console.error(`Failed to fetch ${gameKey} from cache:`, error);
    return NextResponse.json(
      { error: "Failed to fetch lottery results" },
      { status: 500 }
    );
  }
}

// Enable caching at the Next.js level (optional)
export const revalidate = 60; // Cache for 60 seconds at CDN level
