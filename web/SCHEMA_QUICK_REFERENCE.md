# NeuroKind Database - Quick Reference

## 🗂️ Database Structure

```
neurokind/
├── AUTH & USERS
│   ├── User (id, email, hashedPassword, createdAt, updatedAt, lastLoginAt)
│   ├── Profile (userId*, username, displayName, bio, avatarUrl, location, verifiedTherapist, shadowbanned, notificationPrefs)
│   ├── UserRole (userId*, role*, grantedAt)
│   └── AuditLog (userId*, action, targetType, targetId, changes, ipAddress, createdAt)
│
├── COMMUNITY
│   ├── Category (id, name*, slug*, description, icon, order)
│   ├── Tag (id, name*, slug*, description, color)
│   ├── Post (id, title, content, authorId, isAnonymous, categoryId*, status, viewCount, commentCount, pinnedAt, createdAt, updatedAt)
│   │   └── Tags (many-to-many)
│   ├── Comment (id, content, authorId*, postId*, parentCommentId, status, createdAt, updatedAt)
│   ├── Vote (id, userId*, targetType, targetId*, value, createdAt)
│   ├── Bookmark (id, userId*, postId*, createdAt)
│   ├── Report (id, reporterId*, targetType, targetId, reason, description, status, reviewedBy, notes, createdAt)
│   └── ModerationAction (id, action, actorId*, targetUserId, postId, commentId, notes, createdAt)
│
├── PROVIDERS
│   ├── Provider (id, externalSource, externalId, name, phone, address, city, state, zipCode, latitude, longitude, website, email, specialties[], rating, totalReviews, isVerified, claimedByUserId, createdAt, updatedAt)
│   ├── ProviderReview (id, providerId*, authorId*, rating, content, status, helpful, createdAt, updatedAt)
│   └── ProviderClaimRequest (id, providerId*, requesterUserId, status, message, reviewedAt, createdAt, updatedAt)
│
├── AI CHAT
│   ├── AIConversation (id, userId*, title, createdAt, updatedAt)
│   ├── AIMessage (id, conversationId*, userId*, role, content, tokens, createdAt)
│   └── RateLimitLog (id, userId*, actionType, createdAt)
│
├── NOTIFICATIONS
│   └── Notification (id, userId*, type, payload, readAt, createdAt)
│
└── RESOURCES
    └── Resource (id, title, content, link, category, createdBy*, status, views, createdAt, updatedAt)

* = Foreign key
```

## 📊 Quick Stats

| Item             | Count |
| ---------------- | ----- |
| Total Models     | 25    |
| Total Enums      | 13    |
| Relationships    | 50+   |
| Database Indexes | 100+  |
| Total Fields     | 250+  |

## 🔑 Key Constraints

### Unique Constraints

- `User.email`
- `Profile.userId` (one profile per user)
- `Profile.username`
- `Category.slug`
- `Tag.slug`
- `Vote.(userId, targetId, targetType)` - Only one vote per user per target
- `Bookmark.(userId, postId)` - Only one bookmark per user per post
- `Provider.(externalSource, externalId)` - External ID must be unique per source
- `ProviderReview.(providerId, authorId)` - Only one review per user per provider
- `ProviderClaimRequest.(providerId, requesterUserId)` - Only one claim request per user per provider
- `UserRole.(userId, role)` - User can have each role only once

## 🏃 Common Queries

### Get User with Profile and Roles

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { profile: true, userRoles: true },
});
```

### Get Post with Comments and Votes

```typescript
const post = await prisma.post.findUnique({
  where: { id: postId },
  include: {
    author: { include: { profile: true } },
    category: true,
    tags: true,
    comments: { include: { author: { include: { profile: true } } } },
  },
});
```

### Get User's Bookmarks

```typescript
const bookmarks = await prisma.bookmark.findMany({
  where: { userId: userId },
  include: { post: { include: { author: true, category: true } } },
});
```

### Get Provider with Reviews

```typescript
const provider = await prisma.provider.findUnique({
  where: { id: providerId },
  include: {
    reviews: { include: { author: { include: { profile: true } } } },
    claimedByUser: { include: { profile: true } },
  },
});
```

### Get Unread Notifications

```typescript
const notifications = await prisma.notification.findMany({
  where: { userId: userId, readAt: null },
  orderBy: { createdAt: "desc" },
});
```

## 📋 Enums Reference

### Role

```
PARENT | THERAPIST | MODERATOR | ADMIN
```

### PostStatus

```
ACTIVE | REMOVED | LOCKED | PINNED | DRAFT
```

### CommentStatus

```
ACTIVE | REMOVED | HIDDEN
```

### VoteType

```
POST | COMMENT
```

### ReportTargetType

```
POST | COMMENT | USER
```

### ReportReason

```
SPAM | HARASSMENT | MISINFO | SELF_HARM | INAPPROPRIATE_CONTENT | OTHER
```

### ReportStatus

```
OPEN | UNDER_REVIEW | RESOLVED | DISMISSED
```

### ModerationActionType

```
REMOVE | LOCK | PIN | UNPIN | SHADOWBAN | UNSHADOWBAN | WARN | VERIFY_THERAPIST
| REJECT_VERIFICATION | MUTE | UNMUTE
```

### ProviderSource

```
GOOGLE_PLACES | OSM | MANUAL
```

### ProviderSpecialty

```
ABA | OT | SLP | DEVELOPMENTAL_PEDIATRICS | PSYCHOLOGIST | PSYCHIATRIST
| NEURODEVELOPMENTAL | SPEECH_PATHOLOGY | OCCUPATIONAL_THERAPY
| BEHAVIORAL_THERAPY | SOCIAL_WORKER | COUNSELOR
```

### ProviderClaimStatus

```
PENDING | APPROVED | REJECTED
```

### NotificationType

```
POST_COMMENT | COMMENT_REPLY | POST_LIKE | COMMENT_LIKE | MENTION | FOLLOW
| MESSAGE | MODERATION_ACTION | VERIFICATION_REQUEST | SYSTEM
```

### ResourceCategory

```
EDUCATION | THERAPY | NUTRITION | BEHAVIOR | SLEEP | SOCIAL_SKILLS
| LEGAL | FINANCIAL | COMMUNITY | OTHER
```

## 🔍 Indexes for Performance

All models have indexes on:

- Foreign key fields (for joins)
- `createdAt` (for sorting/pagination)
- Frequently filtered fields (`status`, `isVerified`, `shadowbanned`, etc.)

Example indexes:

- `User(email, createdAt)`
- `Post(categoryId, status, createdAt)`
- `Comment(postId, authorId, status)`
- `Vote(userId, targetType, targetId)`
- `Provider(isVerified, latitude, longitude)`

## 🎯 Cascade Delete Behavior

When deleted, automatically deletes:

- `User` → All related Profile, UserRole, AuditLog, posts, comments, votes, etc.
- `Post` → All related comments, votes, bookmarks, reports
- `Comment` → All related child comments, votes, reports
- `Category` → (uses RESTRICT to prevent accidental deletion of used categories)
- `Provider` → All related reviews and claim requests

## 💡 Usage Tips

### Adding a New Field

1. Add field to model in `schema.prisma`
2. Run `npx prisma migrate dev --name <descriptive-name>`
3. Prisma will generate migration files
4. Run `npm run db:generate` to update types

### Querying with Filters

```typescript
// Active posts in a category
const posts = await prisma.post.findMany({
  where: {
    categoryId: categoryId,
    status: "ACTIVE",
  },
  include: { author: true },
});

// Recent verified therapists
const therapists = await prisma.user.findMany({
  where: {
    userRoles: { some: { role: "THERAPIST" } },
    profile: { verifiedTherapist: true },
  },
});
```

### Pagination

```typescript
const ITEMS_PER_PAGE = 10;
const page = 1;

const posts = await prisma.post.findMany({
  take: ITEMS_PER_PAGE,
  skip: (page - 1) * ITEMS_PER_PAGE,
  orderBy: { createdAt: "desc" },
});

const total = await prisma.post.count();
const pages = Math.ceil(total / ITEMS_PER_PAGE);
```

## ✅ Validation Rules

- Email must be unique per user
- Username must be unique
- Passwords should be hashed with bcryptjs
- Post content is required (non-null)
- Comments must belong to a post
- Votes require both userId and targetId
- Reports require all: reporterId, targetType, targetId, reason

## 🚀 Performance Optimization

### 1. Use `select` to fetch only needed fields

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, profile: { select: { displayName: true } } },
});
```

### 2. Use `take` and `skip` for pagination

### 3. Use `include` strategically (not too deep)

### 4. Consider denormalized fields (e.g., `Post.commentCount`, `Provider.totalReviews`)

### 5. Index foreign keys (already done in schema)

---

**Last Updated**: January 16, 2026  
**Status**: ✅ Production Ready
