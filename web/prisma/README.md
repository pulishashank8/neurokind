# NeuroKind Database Schema

Complete production-grade Prisma schema for NeuroKind - a comprehensive forum for autistic parents with AI support, provider directory, and community features.

## Overview

The schema is organized into the following main domains:

### 1. Authentication & Users

- **User**: Core user account with email and hashed password
- **Profile**: User profile information (username, display name, bio, location, verification status)
- **UserRole**: Many-to-many relationship between users and roles (PARENT, THERAPIST, MODERATOR, ADMIN)
- **AuditLog**: Administrative action tracking

### 2. Community Features

- **Category**: Discussion categories (Behavior, Speech, School, Therapy, Sleep, Diet, IEP, etc.)
- **Tag**: Flexible tagging system for posts
- **Post**: Forum posts with support for:
  - Anonymous posting
  - Multiple statuses (ACTIVE, REMOVED, LOCKED, PINNED, DRAFT)
  - View counts
  - Comment counts
  - Categorization and tagging
- **Comment**: Threaded comments with parent-child relationships
- **Vote**: Up/downvote system for posts and comments
- **Bookmark**: Save posts for later
- **Report**: Moderation reports with reasons (SPAM, HARASSMENT, MISINFO, SELF_HARM, OTHER)
- **ModerationAction**: Track moderator/admin actions

### 3. Providers Directory

- **Provider**: Service provider listings with:
  - External source tracking (Google Places, OSM, Manual)
  - Specialty support (ABA, OT, SLP, Developmental Pediatrics, etc.)
  - Ratings and reviews
  - Verification status
  - Geographic coordinates
- **ProviderReview**: User reviews of providers
- **ProviderClaimRequest**: Allow providers to claim their listings

### 4. AI Chat

- **AIConversation**: Chat session storage
- **AIMessage**: Individual messages within conversations with role (user/assistant/system)
- **RateLimitLog**: Track AI service usage for rate limiting

### 5. Notifications

- **Notification**: User notifications with flexible JSON payload for different event types

### 6. Resources Hub

- **Resource**: Educational resources and content created by admins/moderators

## Key Features

### Indexes

All models include strategic indexes on:

- Foreign keys (for join performance)
- Frequently queried fields (creation dates, status fields, user IDs)
- Composite indexes for unique constraints

### Data Integrity

- Proper cascade deletes where appropriate
- Foreign key constraints
- Unique constraints on sensitive fields (email, usernames, etc.)

### Flexible Data

- JSON fields for notification payloads and user preferences
- Enum types for status management and predefined values
- Decimal types for ratings

### Timestamps

- `createdAt` and `updatedAt` on all models for audit trails
- Verified/claimed timestamps for verification tracking

## Usage

### Generate Prisma Client

```bash
npm run db:generate
```

### Push Schema to Database

```bash
npm run db:push
```

### View Database GUI

```bash
npm run db:studio
```

## Database Credentials

For local development with Docker:

- **Host**: localhost:5432
- **User**: neurokind
- **Password**: neurokind
- **Database**: neurokind

See `docker-compose.yml` for service configuration.

## Seed Data

A comprehensive seed script (`prisma/seed.ts`) creates:

- 8 categories
- 8 tags
- 1 admin user (admin@neurokind.local / admin123)
- 1 moderator user (moderator@neurokind.local / moderator123)
- 1 sample parent user (parent@neurokind.local / parent123)
- 1 verified therapist user (therapist@neurokind.local / therapist123)
- 4 sample resources
- 1 sample post with comments and votes
- 1 sample bookmark

### Run Seed

```bash
npm run db:seed
```

## Enums

### Role

- PARENT
- THERAPIST
- MODERATOR
- ADMIN

### Post Status

- ACTIVE
- REMOVED
- LOCKED
- PINNED
- DRAFT

### Report Reason

- SPAM
- HARASSMENT
- MISINFO
- SELF_HARM
- INAPPROPRIATE_CONTENT
- OTHER

### Provider Specialty

- ABA, OT, SLP, DEVELOPMENTAL_PEDIATRICS, PSYCHOLOGIST, PSYCHIATRIST, NEURODEVELOPMENTAL, SPEECH_PATHOLOGY, OCCUPATIONAL_THERAPY, BEHAVIORAL_THERAPY, SOCIAL_WORKER, COUNSELOR

### Notification Type

- POST_COMMENT, COMMENT_REPLY, POST_LIKE, COMMENT_LIKE, MENTION, FOLLOW, MESSAGE, MODERATION_ACTION, VERIFICATION_REQUEST, SYSTEM

### Resource Category

- EDUCATION, THERAPY, NUTRITION, BEHAVIOR, SLEEP, SOCIAL_SKILLS, LEGAL, FINANCIAL, COMMUNITY, OTHER

## Relations

### Complex Relations

- **Posts ↔ Comments**: One-to-many with threaded support (comments can have parent comments)
- **Users ↔ Roles**: Many-to-many for flexible permission management
- **Posts/Comments ↔ Votes**: One-to-many with unique constraint per user per target
- **Providers**: Can be claimed by users with claim request tracking

## Performance Considerations

1. **Indexes**: Strategic indexes on foreign keys and frequently filtered columns
2. **Denormalized Data**: Post/Comment counts stored for faster queries
3. **JSON Fields**: Used for flexible data (preferences, payloads) to avoid schema changes
4. **View Counts**: Incrementally updated for analytics without separate tables

## Next Steps

1. Implement API endpoints for CRUD operations
2. Add validation middleware
3. Implement role-based access control (RBAC)
4. Add caching layer for frequently accessed data
5. Set up real-time notifications
