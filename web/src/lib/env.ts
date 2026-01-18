import { z } from "zod";

/**
 * Environment validation schema with Zod
 * - Required: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
 * - Optional: REDIS_URL, API keys
 * Fails fast at startup if required vars missing
 */

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().url().describe("PostgreSQL database URL"),
  NEXTAUTH_SECRET: z.string().min(32).describe("NextAuth secret (min 32 chars)"),
  NEXTAUTH_URL: z.string().url().describe("NextAuth callback URL"),

  // Optional (with sensible defaults)
  REDIS_URL: z
    .string()
    .url()
    .optional()
    .describe("Redis URL for caching and rate limiting"),
  OPENAI_API_KEY: z
    .string()
    .optional()
    .describe("OpenAI API key for AI features"),
  GOOGLE_PLACES_API_KEY: z
    .string()
    .optional()
    .describe("Google Places API key for location features"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .describe("Public app URL"),

  // Node env
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Get validated environment variables
 * Validates on first call, then returns cached result
 */
export function getEnv(): Env {
  if (validatedEnv) return validatedEnv;

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((e) => e.code === "invalid_type" || e.code === "too_small")
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("\n  ");

      console.error(
        "❌ Environment validation failed:\n  " + missingVars + "\n"
      );
      throw new Error(
        "Missing required environment variables. See details above."
      );
    }
    throw error;
  }
}

/**
 * Validate optional variables gracefully
 * Returns undefined if not set, doesn't crash
 */
export function getOptionalEnv<T extends keyof Env>(key: T): Env[T] | undefined {
  const env = getEnv();
  return env[key] as Env[T] | undefined;
}

/**
 * Check if Redis is available (safe to use in features)
 */
export function isRedisAvailable(): boolean {
  try {
    const env = getEnv();
    return !!env.REDIS_URL;
  } catch {
    return false;
  }
}

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  try {
    return !!getEnv().OPENAI_API_KEY;
  } catch {
    return false;
  }
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// Validate env on module load (fail fast on server-side only)
if (typeof window === "undefined" && typeof process !== "undefined") {
  try {
    getEnv();
  } catch (error) {
    // Only log; don't call process.exit in modules that might run in Edge Runtime
    console.error("Failed to load environment variables:", error);
  }
}
