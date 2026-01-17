import { Redis } from "ioredis";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

export { redis };

// ========================================
// RATE LIMITING
// ========================================

export interface RateLimitConfig {
  limit: number; // max requests
  window: number; // time window in seconds
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const windowMs = config.window * 1000;
  const windowStart = now - windowMs;

  // Use sorted set to track requests by timestamp
  const multi = redis.multi();
  
  // Remove old requests outside window
  multi.zremrangebyscore(key, 0, windowStart);
  
  // Add current request
  multi.zadd(key, now, `${now}`);
  
  // Count requests in window
  multi.zcard(key);
  
  // Set expiry
  multi.expire(key, config.window);

  const results = await multi.exec();
  const count = results?.[2]?.[1] as number || 0;

  const remaining = Math.max(0, config.limit - count);
  const success = count <= config.limit;
  const reset = Math.ceil((now + windowMs) / 1000);

  return { success, remaining, reset };
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  CREATE_POST: { limit: 5, window: 60 }, // 5 per minute
  CREATE_COMMENT: { limit: 10, window: 60 }, // 10 per minute
  VOTE: { limit: 60, window: 60 }, // 60 per minute
  REPORT: { limit: 5, window: 60 }, // 5 per minute
  BOOKMARK: { limit: 30, window: 60 }, // 30 per minute
};

// ========================================
// CACHING
// ========================================

export interface CacheOptions {
  ttl?: number; // seconds, default 60
  prefix?: string;
}

export async function getCached<T>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> {
  const { prefix = "cache" } = options;
  const fullKey = `${prefix}:${key}`;

  try {
    const cached = await redis.get(fullKey);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (error) {
    console.error(`Cache get error for ${fullKey}:`, error);
    return null;
  }
}

export async function setCached<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = 60, prefix = "cache" } = options;
  const fullKey = `${prefix}:${key}`;

  try {
    await redis.setex(fullKey, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for ${fullKey}:`, error);
  }
}

export async function invalidateCache(
  pattern: string,
  options: CacheOptions = {}
): Promise<void> {
  const { prefix = "cache" } = options;
  const fullPattern = `${prefix}:${pattern}`;

  try {
    const keys = await redis.keys(fullPattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Cache invalidation error for ${fullPattern}:`, error);
  }
}

// Predefined cache TTLs
export const CACHE_TTL = {
  POSTS_FEED: 30, // 30 seconds
  POST_DETAIL: 60, // 1 minute
  TAGS: 600, // 10 minutes
  CATEGORIES: 600, // 10 minutes
  COMMENTS: 30, // 30 seconds
};

// Helper to generate cache keys
export function cacheKey(parts: string[]): string {
  return parts.join(":");
}
