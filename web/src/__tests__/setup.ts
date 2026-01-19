import { beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanupDatabase, disconnectDatabase } from './helpers/database';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// Setup test environment
beforeAll(async () => {
  // Ensure we're using the test database
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error('DATABASE_URL must point to a test database (should contain "test" in the name)');
  }

  console.log('Setting up test database...');
  
  // Run migrations on test database
  try {
    await execAsync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    console.log('✓ Test database migrations completed');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    throw error;
  }
}, 30000);

// Clean database before each test
beforeEach(async () => {
  await cleanupDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await disconnectDatabase();
});
