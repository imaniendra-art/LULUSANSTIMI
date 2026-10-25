// In-memory cache for alumni stats with automatic invalidation

interface CachedStatsData {
  data: unknown;
  expiry: number;
}

let statsCache: CachedStatsData | null = null;
const STATS_CACHE_TTL_MS = 60_000; // 60 seconds TTL

export function getCachedStats(): unknown | null {
  if (statsCache && Date.now() < statsCache.expiry) {
    return statsCache.data;
  }
  return null;
}

export function setCachedStats(data: unknown): void {
  statsCache = {
    data,
    expiry: Date.now() + STATS_CACHE_TTL_MS,
  };
}

export function invalidateStatsCache(): void {
  statsCache = null;
}
