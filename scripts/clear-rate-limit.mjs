/**
 * Development utility to clear rate limits
 * 
 * Usage:
 *   node scripts/clear-rate-limit.mjs register ::1
 *   node scripts/clear-rate-limit.mjs login 127.0.0.1
 */

const limiterName = process.argv[2];
const identifier = process.argv[3];

if (!limiterName || !identifier) {
  console.error('Usage: node scripts/clear-rate-limit.mjs <limiter-name> <identifier>');
  console.error('Example: node scripts/clear-rate-limit.mjs register ::1');
  console.error('\nAvailable limiters: register, login, createPost, createComment, vote, report, aiChat');
  process.exit(1);
}

// In-memory store for development (matches rateLimit.ts)
const inMemoryStore = new Map();

const key = `ratelimit:${limiterName}:${identifier}`;
inMemoryStore.delete(key);

console.log(`✅ Cleared rate limit for: ${limiterName} / ${identifier}`);
console.log(`   Key: ${key}`);
console.log('\nNote: If using Redis, run this instead:');
console.log(`   redis-cli DEL "${key}"`);
