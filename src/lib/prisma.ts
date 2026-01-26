import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configure connection pool limits for Supabase
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  
  // Add connection pool parameters for serverless
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=5&pool_timeout=10`;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    errorFormat: "pretty",
    datasourceUrl: getDatabaseUrl(),
  });

// Cache Prisma client in both development AND production
globalForPrisma.prisma = prisma;

// Default export for compatibility
export default prisma;
