// app/api/lotto/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { GAMES } from "@/lib/lotto/registry";

export const runtime = "edge";

/**
 * Upstash Redis client
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Set latest result with TTL (default 1 hour)
 */
async function setGameResult(game: string, data: unknown, ttlSec = 3600) {
  await redis.set(`lotto:${game}:latest`, data, { ex: ttlSec });
}

/**
 * Simple distributed lock to avoid concurrent scrapes
 */
async function withLock<T>(key: string, ttlSec: number, fn: () => Promise<T>): Promise<T | null> {
  const lockKey = `lock:${key}`;
  const ok = await redis.set(lockKey, "1", { nx: true, ex: ttlSec });
  if (ok !== "OK") return null; // someone else holds the lock
  try {
    return await fn();
  } finally {
    await redis.del(lockKey);
  }
}

/**
 * POST /api/lotto/refresh
 * Headers: x-cron-token: <secret>
 * Body: { "game": "<registry-key>", "ttlSec": 3600 }
 */
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-cron-token");
  if (token !== process.env.LOTTO_CRON_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { game?: string; ttlSec?: number } = {};
  try {
    body = await req.json();
  } catch {
    // no-op; will fall through to validation error
  }

  const game = body.game?.toLowerCase();
  const ttlSec = Number.isFinite(body.ttlSec) ? Math.max(60, Math.min(6 * 3600, body.ttlSec!)) : 3600;

  if (!game || !GAMES[game]) {
    return NextResponse.json(
      { error: "unknown game", supported: Object.keys(GAMES) },
      { status: 400 }
    );
  }

  // Prevent duplicate concurrent refreshes for 60s
  const result = await withLock(`lotto:${game}:refresh`, 60, async () => {
    const data = await GAMES[game].fetcher();
    if (!data) {
      return NextResponse.json({ ok: false, message: "fetcher returned no data" }, { status: 502 });
    }
    await setGameResult(game, data, ttlSec);
    return NextResponse.json({ ok: true, game, updatedAt: data.updatedAt, ttlSec });
  });

  // If lock held by someone else
  if (!result) {
    return NextResponse.json({ ok: false, message: "refresh already in progress" }, { status: 423 });
  }

  return result;
}
