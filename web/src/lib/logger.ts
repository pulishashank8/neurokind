import pino from 'pino';
import { isProduction } from './env';

/**
 * Sensitive field names that should never be logged
 * These patterns are checked recursively in all nested objects
 */
const SENSITIVE_FIELDS = [
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
  'private_key',
];

/**
 * Recursively redact sensitive fields from objects
 */
function redactSensitive(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitive(item));
  }
  
  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field.toLowerCase())
    );
    
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
 */
const productionLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  serializers: {
    req: (req: any) => redactSensitive({
      method: req.method,
      url: req.url,
      headers: req.headers,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: SENSITIVE_FIELDS,
    remove: true,
  },
});

/**
 * Development logger configuration (pretty output)
 * Only use pino-pretty in local development (not on Vercel)
 */
const developmentLogger = process.env.VERCEL 
  ? productionLogger  // Use production logger on Vercel even in preview/development
  : pino({
      level: process.env.LOG_LEVEL || 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
          messageFormat: '{levelLabel} - {msg}',
        },
      },
      serializers: {
        req: (req: any) => redactSensitive({
          method: req.method,
          url: req.url,
          headers: req.headers,
        }),
        res: (res: any) => ({
          statusCode: res.statusCode,
        }),
        err: pino.stdSerializers.err,
      },
      redact: {
        paths: SENSITIVE_FIELDS,
        remove: true,
      },
    });

/**
 * Main logger instance
 * Automatically switches between production and development modes
 */
export const logger = isProduction() || process.env.VERCEL ? productionLogger : developmentLogger;

/**
 * Create a child logger with additional context
 * Useful for adding requestId or other contextual data
 */
export function createLogger(bindings: Record<string, any>) {
  return logger.child(redactSensitive(bindings));
}

/**
 * Log levels for convenience
 */
export const logLevels = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const;

export type LogLevel = typeof logLevels[keyof typeof logLevels];
