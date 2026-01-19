/**
 * Test Utilities Index
 * 
 * Central export file for all test helpers.
 * Import from here to keep test files clean.
 * 
 * @example
 * import { createTestUser, createMockRequest, cleanupDatabase } from '../helpers';
 */

// Auth helpers
export {
  createTestUser,
  createModeratorUser,
  createMockSession,
  createTestCategory,
  createTestTag,
  createTestPost,
  createTestComment,
  type TestUser,
} from './auth';

// API helpers
export {
  createMockRequest,
  mockGetServerSession,
  parseResponse,
  createAuthHeader,
} from './api';

// Database helpers
export {
  cleanupDatabase,
  disconnectDatabase,
  getTestPrisma,
} from './database';
