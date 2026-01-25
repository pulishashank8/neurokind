module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    errorFormat: "pretty"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/validators.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoginSchema",
    ()=>LoginSchema,
    "ProfileUpdateSchema",
    ()=>ProfileUpdateSchema,
    "RegisterSchema",
    ()=>RegisterSchema,
    "RegisterSchemaWithConfirm",
    ()=>RegisterSchemaWithConfirm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const LoginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Invalid email address"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(6, "Password must be at least 6 characters")
});
const RegisterSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email("Invalid email address"),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
    confirmPassword: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    username: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    displayName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Display name is required").max(100)
});
const RegisterSchemaWithConfirm = RegisterSchema.refine((data)=>data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: [
        "confirmPassword"
    ]
});
const ProfileUpdateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    username: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens").optional(),
    displayName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, "Display name is required").max(100).optional(),
    bio: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(500, "Bio must be at most 500 characters").optional(),
    location: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(100, "Location must be at most 100 characters").optional(),
    avatarUrl: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url("Invalid URL").optional()
});
}),
"[project]/src/lib/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEnv",
    ()=>getEnv,
    "getOptionalEnv",
    ()=>getOptionalEnv,
    "isAIEnabled",
    ()=>isAIEnabled,
    "isGoogleOAuthEnabled",
    ()=>isGoogleOAuthEnabled,
    "isGooglePlacesEnabled",
    ()=>isGooglePlacesEnabled,
    "isGroqEnabled",
    ()=>isGroqEnabled,
    "isProduction",
    ()=>isProduction,
    "isRedisAvailable",
    ()=>isRedisAvailable,
    "validateSecretSecurity",
    ()=>validateSecretSecurity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
/**
 * Environment validation schema with Zod
 * - Required: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
 * - Optional: REDIS_URL, API keys
 * Fails fast at startup if required vars missing
 */ const envSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    // Required
    DATABASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().describe("PostgreSQL database URL"),
    NEXTAUTH_SECRET: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(32).describe("NextAuth secret (min 32 chars)"),
    NEXTAUTH_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().describe("NextAuth callback URL"),
    // Optional (with sensible defaults)
    REDIS_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().optional().describe("Redis URL for caching and rate limiting"),
    OPENAI_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("OpenAI API key for AI features"),
    GROQ_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Groq API key for AI chat features"),
    GOOGLE_PLACES_API_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Google Places API key for location features"),
    GOOGLE_CLIENT_ID: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Google OAuth client ID"),
    GOOGLE_CLIENT_SECRET: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe("Google OAuth client secret"),
    NEXT_PUBLIC_APP_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().url().default("http://localhost:3000").describe("Public app URL"),
    // Node env
    NODE_ENV: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "development",
        "production",
        "test"
    ]).default("development")
});
let validatedEnv = null;
function getEnv() {
    if (validatedEnv) return validatedEnv;
    try {
        validatedEnv = envSchema.parse(process.env);
        return validatedEnv;
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
            const missingVars = error.errors.filter((e)=>e.code === "invalid_type" || e.code === "too_small").map((e)=>`${e.path.join(".")}: ${e.message}`).join("\n  ");
            console.error("❌ Environment validation failed:\n  " + missingVars + "\n");
            throw new Error("Missing required environment variables. See details above.");
        }
        throw error;
    }
}
function getOptionalEnv(key) {
    const env = getEnv();
    return env[key];
}
function isRedisAvailable() {
    try {
        const env = getEnv();
        return !!env.REDIS_URL;
    } catch  {
        return false;
    }
}
function isAIEnabled() {
    try {
        const env = getEnv();
        return !!(env.OPENAI_API_KEY || env.GROQ_API_KEY);
    } catch  {
        return false;
    }
}
function isGroqEnabled() {
    try {
        return !!getEnv().GROQ_API_KEY;
    } catch  {
        return false;
    }
}
function isGooglePlacesEnabled() {
    try {
        return !!getEnv().GOOGLE_PLACES_API_KEY;
    } catch  {
        return false;
    }
}
function isGoogleOAuthEnabled() {
    try {
        const env = getEnv();
        return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
    } catch  {
        return false;
    }
}
function isProduction() {
    return ("TURBOPACK compile-time value", "development") === "production";
}
function validateSecretSecurity() {
    const issues = [];
    // Check that sensitive env vars are NOT prefixed with NEXT_PUBLIC_
    const sensitiveKeys = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'OPENAI_API_KEY',
        'GROQ_API_KEY',
        'GOOGLE_PLACES_API_KEY',
        'GOOGLE_CLIENT_SECRET',
        'REDIS_URL'
    ];
    for (const key of sensitiveKeys){
        const publicKey = `NEXT_PUBLIC_${key}`;
        if (process.env[publicKey]) {
            issues.push(`SECURITY RISK: ${publicKey} should NOT be prefixed with NEXT_PUBLIC_. This exposes secrets to the client!`);
        }
    }
    return {
        secure: issues.length === 0,
        issues
    };
}
// Validate env on module load (fail fast on server-side only)
if (("TURBOPACK compile-time value", "undefined") === "undefined" && typeof process !== "undefined") {
    try {
        getEnv();
        // Security check: Ensure secrets are not exposed
        const securityCheck = validateSecretSecurity();
        if (!securityCheck.secure) {
            console.error("⚠️ SECURITY ISSUES DETECTED:");
            securityCheck.issues.forEach((issue)=>console.error(`  - ${issue}`));
        }
    } catch (error) {
        // Only log; don't call process.exit in modules that might run in Edge Runtime
        console.error("Failed to load environment variables:", error);
    }
}
}),
"[project]/src/lib/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createLogger",
    ()=>createLogger,
    "logLevels",
    ()=>logLevels,
    "logger",
    ()=>logger
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__ = __turbopack_context__.i("[externals]/pino [external] (pino, cjs, [project]/node_modules/pino)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
;
;
/**
 * Sensitive field names that should never be logged
 * These patterns are checked recursively in all nested objects
 */ const SENSITIVE_FIELDS = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'session',
    'accessToken',
    'refreshToken',
    'privateKey',
    'private_key'
];
/**
 * Recursively redact sensitive fields from objects
 */ function redactSensitive(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map((item)=>redactSensitive(item));
    }
    const redacted = {};
    for (const [key, value] of Object.entries(obj)){
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_FIELDS.some((field)=>lowerKey.includes(field.toLowerCase()));
        if (isSensitive) {
            redacted[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
            redacted[key] = redactSensitive(value);
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
}
/**
 * Production logger configuration (JSON output)
 */ const productionLogger = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
        level: (label)=>{
            return {
                level: label
            };
        }
    },
    serializers: {
        req: (req)=>redactSensitive({
                method: req.method,
                url: req.url,
                headers: req.headers
            }),
        res: (res)=>({
                statusCode: res.statusCode
            }),
        err: __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].stdSerializers.err
    },
    redact: {
        paths: SENSITIVE_FIELDS,
        remove: true
    }
});
/**
 * Development logger configuration (pretty output)
 * Only use pino-pretty in local development (not on Vercel)
 */ const developmentLogger = process.env.VERCEL ? productionLogger // Use production logger on Vercel even in preview/development
 : (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])({
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
            singleLine: false,
            messageFormat: '{levelLabel} - {msg}'
        }
    },
    serializers: {
        req: (req)=>redactSensitive({
                method: req.method,
                url: req.url,
                headers: req.headers
            }),
        res: (res)=>({
                statusCode: res.statusCode
            }),
        err: __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"].stdSerializers.err
    },
    redact: {
        paths: SENSITIVE_FIELDS,
        remove: true
    }
});
const logger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isProduction"])() || process.env.VERCEL ? productionLogger : developmentLogger;
function createLogger(bindings) {
    return logger.child(redactSensitive(bindings));
}
const logLevels = {
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error'
};
}),
"[project]/src/lib/rateLimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RATE_LIMITERS",
    ()=>RATE_LIMITERS,
    "RateLimiter",
    ()=>RateLimiter,
    "checkRateLimit",
    ()=>checkRateLimit,
    "clearRateLimit",
    ()=>clearRateLimit,
    "getClientIp",
    ()=>getClientIp,
    "rateLimitResponse",
    ()=>rateLimitResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
;
let redisClient = null;
let inMemoryStore = new Map();
/**
 * Initialize Redis client lazily
 */ async function getRedisClient() {
    if (redisClient) return redisClient;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRedisAvailable"])()) {
        return null;
    }
    try {
        // Lazy load Redis (using ioredis)
        const { Redis } = await __turbopack_context__.A("[project]/node_modules/ioredis/built/index.js [app-route] (ecmascript, async loader)");
        const client = new Redis((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnv"])().REDIS_URL, {
            lazyConnect: true,
            maxRetriesPerRequest: 0,
            enableOfflineQueue: false
        });
        client.on("error", (err)=>{
            console.warn("Redis connection error, falling back to in-memory:", err.message);
            redisClient = null;
        });
        redisClient = client;
        console.log("✓ Redis connected for rate limiting");
        return client;
    } catch (error) {
        console.warn("Failed to connect to Redis, using in-memory rate limiting:", error instanceof Error ? error.message : error);
        return null;
    }
}
class RateLimiter {
    name;
    maxTokens;
    windowSeconds;
    constructor(name, maxTokens, windowSeconds = 60){
        this.name = name;
        this.maxTokens = maxTokens;
        this.windowSeconds = windowSeconds;
    }
    /**
   * Check if request is allowed
   * Returns true if within limit, false if exceeded
   */ async checkLimit(identifier) {
        const key = `ratelimit:${this.name}:${identifier}`;
        const redis = await getRedisClient();
        if (redis) {
            return this.checkLimitRedis(redis, key);
        } else {
            return this.checkLimitMemory(key);
        }
    }
    /**
   * Get seconds until next request allowed
   */ async getRetryAfter(identifier) {
        const key = `ratelimit:${this.name}:${identifier}`;
        const redis = await getRedisClient();
        if (redis) {
            const ttl = await redis.ttl(key);
            return Math.max(1, ttl);
        } else {
            const entry = inMemoryStore.get(key);
            if (!entry) return 0;
            const elapsed = (Date.now() - entry.lastRefill) / 1000;
            const remaining = this.windowSeconds - elapsed;
            return Math.max(1, Math.ceil(remaining));
        }
    }
    /**
   * Redis-based rate limiting
   */ async checkLimitRedis(redis, key) {
        try {
            const current = await redis.incr(key);
            if (current === 1) {
                // First request in window, set expiry
                await redis.expire(key, this.windowSeconds);
            }
            return current <= this.maxTokens;
        } catch (error) {
            console.error("Redis rate limit check failed:", error);
            // Fail open - allow request if Redis fails
            return true;
        }
    }
    /**
   * In-memory rate limiting (development fallback)
   */ checkLimitMemory(key) {
        const now = Date.now();
        let entry = inMemoryStore.get(key);
        if (!entry) {
            inMemoryStore.set(key, {
                tokens: 1,
                lastRefill: now
            });
            return true;
        }
        // Check if window expired
        const elapsed = (now - entry.lastRefill) / 1000;
        if (elapsed >= this.windowSeconds) {
            // Reset window
            entry = {
                tokens: 1,
                lastRefill: now
            };
            inMemoryStore.set(key, entry);
            return true;
        }
        // Still within window
        if (entry.tokens < this.maxTokens) {
            entry.tokens++;
            inMemoryStore.set(key, entry);
            return true;
        }
        return false;
    }
    /**
   * Reset limit for identifier (for testing)
   */ async reset(identifier) {
        const key = `ratelimit:${this.name}:${identifier}`;
        const redis = await getRedisClient();
        if (redis) {
            await redis.del(key);
        } else {
            inMemoryStore.delete(key);
        }
    }
}
const RATE_LIMITERS = {
    register: new RateLimiter("register", 5, 3600),
    login: new RateLimiter("login", 10, 60),
    createPost: new RateLimiter("createPost", 5, 60),
    createComment: new RateLimiter("createComment", 10, 60),
    vote: new RateLimiter("vote", 60, 60),
    report: new RateLimiter("report", 5, 60),
    aiChat: new RateLimiter("aiChat", 5, 60),
    readComments: new RateLimiter("readComments", 100, 60),
    readPost: new RateLimiter("readPost", 200, 60),
    updateProfile: new RateLimiter("updateProfile", 10, 60),
    connectionRequest: new RateLimiter("connectionRequest", 10, 60),
    userSearch: new RateLimiter("userSearch", 30, 60),
    userProfile: new RateLimiter("userProfile", 60, 60),
    forgotPassword: new RateLimiter("forgotPassword", 3, 300),
    forgotPasswordDaily: new RateLimiter("forgotPasswordDaily", 5, 86400)
};
function getClientIp(request) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip");
    return ip || "unknown";
}
async function checkRateLimit(limiter, identifier) {
    const allowed = await limiter.checkLimit(identifier);
    if (!allowed) {
        const retryAfterSeconds = await limiter.getRetryAfter(identifier);
        return {
            allowed: false,
            retryAfterSeconds
        };
    }
    return {
        allowed: true
    };
}
function rateLimitResponse(retryAfterSeconds) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Rate limit exceeded",
        retryAfterSeconds
    }, {
        status: 429,
        headers: {
            "Retry-After": String(retryAfterSeconds)
        }
    });
}
async function clearRateLimit(limiterName, identifier) {
    const key = `ratelimit:${limiterName}:${identifier}`;
    const redis = await getRedisClient();
    if (redis) {
        await redis.del(key);
    } else {
        inMemoryStore.delete(key);
    }
}
}),
"[project]/src/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler,
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/google.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validators$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validators.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rateLimit.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const authOptions = {
    // No adapter needed when using JWT strategy
    providers: [
        // Credentials provider for email/password login
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials, req) {
                try {
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info({
                        email: credentials?.email?.substring(0, 3) + '***'
                    }, 'Login attempt');
                    if (!credentials?.email || !credentials?.password) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn('Missing credentials');
                        return null;
                    }
                    // Validate input
                    const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validators$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["LoginSchema"].safeParse({
                        email: credentials.email,
                        password: credentials.password
                    });
                    if (!parsed.success) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn({
                            errors: parsed.error.errors
                        }, 'Login validation failed');
                        return null;
                    }
                    // Check login rate limit (10 attempts per minute per email)
                    const canLogin = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RATE_LIMITERS"].login.checkLimit(parsed.data.email.toLowerCase());
                    if (!canLogin) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn({
                            email: parsed.data.email.substring(0, 3) + '***'
                        }, 'Login rate limit exceeded');
                        throw new Error("TooManyAttempts");
                    }
                    try {
                        // Find user by email
                        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                            where: {
                                email: parsed.data.email
                            },
                            include: {
                                userRoles: true,
                                profile: true
                            }
                        });
                        if (!user) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn({
                                email: parsed.data.email.substring(0, 3) + '***'
                            }, 'User not found');
                            return null;
                        }
                        // Check password
                        const passwordMatch = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(parsed.data.password, user.hashedPassword || "");
                        if (!passwordMatch) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn({
                                userId: user.id
                            }, 'Password mismatch');
                            return null;
                        }
                        // Check email verification (skip in development mode)
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                        // Update lastLoginAt
                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
                            where: {
                                id: user.id
                            },
                            data: {
                                lastLoginAt: new Date()
                            }
                        });
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info({
                            userId: user.id,
                            username: user.profile?.username
                        }, 'Login successful');
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.profile?.displayName || user.profile?.username || user.email,
                            username: user.profile?.username,
                            roles: user.userRoles.map((ur)=>ur.role)
                        };
                    } catch (err) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error({
                            error: err
                        }, 'Login authorization failed');
                        // Fallback: allow dev login without DB if env flag is set (non-production only)
                        if (("TURBOPACK compile-time value", "development") !== "production" && process.env.ALLOW_DEV_LOGIN_WITHOUT_DB === "true") {
                            const devAccounts = {
                                "admin@neurokid.local": {
                                    password: "admin123",
                                    roles: [
                                        "ADMIN"
                                    ]
                                },
                                "parent@neurokid.local": {
                                    password: "parent123",
                                    roles: [
                                        "PARENT"
                                    ]
                                }
                            };
                            const acct = devAccounts[parsed.data.email];
                            if (acct && acct.password === parsed.data.password) {
                                return {
                                    id: parsed.data.email,
                                    email: parsed.data.email,
                                    name: parsed.data.email,
                                    roles: acct.roles
                                };
                            }
                        }
                        return null;
                    }
                } catch (outerErr) {
                    // Re-throw rate limit errors to surface them properly
                    if (outerErr?.message === "TooManyAttempts") {
                        throw new Error("TooManyAttempts");
                    }
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error({
                        error: outerErr
                    }, 'Login outer error');
                    return null;
                }
            }
        }),
        // Google OAuth provider (optional, only if env vars are set)
        ...process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$google$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                allowDangerousEmailAccountLinking: true
            })
        ] : []
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60
    },
    pages: {
        signIn: "/login",
        error: "/error"
    },
    callbacks: {
        async signIn ({ user, account }) {
            // For Google OAuth: create user WITHOUT auto-generating profile (requires onboarding)
            if (account?.provider === "google" && user.email) {
                try {
                    let existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                        where: {
                            email: user.email
                        },
                        include: {
                            profile: true,
                            userRoles: true
                        }
                    });
                    // Create user if doesn't exist (without profile - will complete in onboarding)
                    if (!existingUser) {
                        existingUser = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.create({
                            data: {
                                email: user.email,
                                lastLoginAt: new Date(),
                                emailVerified: true,
                                emailVerifiedAt: new Date(),
                                userRoles: {
                                    create: {
                                        role: "PARENT"
                                    }
                                }
                            },
                            include: {
                                profile: true,
                                userRoles: true
                            }
                        });
                        // Store user ID for JWT
                        user.id = existingUser.id;
                    } else {
                        // Update last login
                        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.update({
                            where: {
                                id: existingUser.id
                            },
                            data: {
                                lastLoginAt: new Date()
                            }
                        });
                        // Ensure user has PARENT role
                        if (existingUser.userRoles.length === 0) {
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userRole.create({
                                data: {
                                    userId: existingUser.id,
                                    role: "PARENT"
                                }
                            });
                        }
                        // Store user ID for JWT
                        user.id = existingUser.id;
                    }
                } catch (err) {
                    console.error("Error creating/updating Google user:", err);
                    const errorCode = err?.code ? `DB_ERR_${err.code}` : "DB_UNKNOWN_ERROR";
                    const errorMessage = err?.message ? encodeURIComponent(err.message.substring(0, 100)) : "UnknownError";
                    return `/error?error=${errorCode}_${errorMessage}`;
                }
            }
            return true;
        },
        async jwt ({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.roles = user.roles || [];
            }
            // Refresh user data including username on every token update
            if (token.id) {
                try {
                    const userData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                        where: {
                            id: token.id
                        },
                        include: {
                            userRoles: true,
                            profile: true
                        }
                    });
                    if (userData) {
                        token.roles = userData.userRoles.map((ur)=>ur.role);
                        token.name = userData.profile?.displayName || userData.profile?.username || userData.email;
                        token.username = userData.profile?.username;
                        token.profileComplete = !!userData.profile?.username && !!userData.profile?.displayName;
                    } else {
                        token.disabled = true;
                        delete token.id;
                        token.roles = [];
                        token.profileComplete = false;
                    }
                } catch  {
                // If DB unavailable, keep existing data (dev fallback)
                }
            }
            return token;
        },
        async session ({ session, token }) {
            if (token.disabled) {
                // Return an empty session instead of null
                return {
                    expires: session.expires,
                    user: undefined
                };
            }
            if (session.user) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.roles = token.roles;
                session.user.profileComplete = token.profileComplete;
                // Ensure session.user.name is set to displayName/username
                session.user.name = token.name;
            }
            return session;
        },
        async redirect ({ url, baseUrl }) {
            // Only redirect to allowed origins
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    }
};
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
;
}),
"[project]/src/app/api/notifications/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
;
async function GET() {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Unauthorized"
            }, {
                status: 401
            });
        }
        const userId = session.user.id;
        const [unreadConnectionRequests, unreadMessages] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].connectionRequest.count({
                where: {
                    receiverId: userId,
                    status: "PENDING",
                    seenAt: null
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].directMessage.count({
                where: {
                    conversation: {
                        OR: [
                            {
                                userAId: userId
                            },
                            {
                                userBId: userId
                            }
                        ]
                    },
                    senderId: {
                        not: userId
                    },
                    readAt: null,
                    deletedAt: null
                }
            })
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            unreadConnectionRequests,
            unreadMessages,
            totalUnread: unreadConnectionRequests + unreadMessages
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__011ed44d._.js.map