import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Clean all test data from database (truncate all tables)
 * Preserves database structure but removes all data
 */
export async function cleanupDatabase() {
  const tables = [
    'Vote',
    'Comment',
    'Post',
    'Report',
    'ModerationAction',
    'Bookmark',
    'Tag',
    'Category',
    'Notification',
    'ChatSession',
    'ChatMessage',
    'ProviderClaim',
    'Provider',
    'UserRole',
    'Profile',
    'Account',
    'Session',
    'VerificationToken',
    'User',
  ];

  try {
    // Disable foreign key checks temporarily
    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    // Truncate all tables
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      } catch (error) {
        // Table might not exist, continue
        console.warn(`Warning: Could not truncate ${table}:`, error);
      }
    }

    // Re-enable foreign key checks
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

/**
 * Get Prisma client for tests
 */
export function getTestPrisma() {
  return prisma;
}
