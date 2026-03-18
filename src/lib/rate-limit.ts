// ─── In-memory token bucket rate limiter ────────────────────────────────────
//
// Suitable for single-instance deployments (Vercel serverless resets on cold start).
// For distributed rate limiting, swap for Upstash Redis or Vercel KV.

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** Max burst tokens */
  maxTokens: number;
  /** Refill interval in milliseconds */
  refillIntervalMs: number;
}

const buckets = new Map<string, TokenBucket>();

// Clean up stale buckets every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const BUCKET_TTL_MS = 10 * 60 * 1000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > BUCKET_TTL_MS) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxTokens: 10, refillIntervalMs: 5000 },
): { allowed: boolean; retryAfterMs: number } {
  cleanup();

  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: config.maxTokens - 1, lastRefill: now };
    buckets.set(key, bucket);
    return { allowed: true, retryAfterMs: 0 };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refills = Math.floor(elapsed / config.refillIntervalMs);

  if (refills > 0) {
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + refills);
    bucket.lastRefill += refills * config.refillIntervalMs;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  // No tokens available — calculate when next one arrives
  const retryAfterMs = config.refillIntervalMs - (now - bucket.lastRefill);
  return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
}
