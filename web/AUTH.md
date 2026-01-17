# NeuroKind Authentication & Authorization Guide

## Overview

NeuroKind uses **NextAuth.js (Auth.js)** with **Prisma** for secure authentication and role-based access control (RBAC). The system supports:

- ✅ Email/password authentication with bcryptjs hashing
- ✅ Google OAuth (optional)
- ✅ JWT-based sessions
- ✅ Role-based access control (RBAC)
- ✅ User profiles and metadata
- ✅ Password-protected routes

## Architecture

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| NextAuth.js | Authentication server | `src/app/api/auth/[...nextauth]/route.ts` |
| Prisma Adapter | Database session storage | `node_modules/@auth/prisma-adapter` |
| JWT Strategy | Session management | Built into NextAuth config |
| Credentials Provider | Email/password login | NextAuth config |
| Google Provider | OAuth integration | NextAuth config (optional) |

### Key Files

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts    # NextAuth route handler
│   │       ├── register/route.ts         # User registration endpoint
│   │       └── user/profile/route.ts     # User profile CRUD
│   ├── (auth)/
│   │   ├── layout.tsx                    # Auth pages layout
│   │   ├── login/page.tsx                # Login page
│   │   └── register/page.tsx             # Registration page
│   ├── settings/page.tsx                 # User settings page
│   └── page.tsx                          # Home page with auth UI
├── lib/
│   ├── auth.ts                           # Auth utilities & helpers
│   ├── rbac.ts                           # Role-based access control
│   ├── prisma.ts                         # Prisma singleton
│   └── validators.ts                     # Zod validation schemas
└── app/providers.tsx                     # Session provider wrapper
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

The following packages are already included in `package.json`:
- `next-auth@^5.0.0` - Authentication
- `@auth/prisma-adapter@^2.7.1` - Prisma session storage
- `bcryptjs@^3.0.3` - Password hashing
- `zod@^3.22.4` - Input validation

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```env
# Database
DATABASE_URL="postgresql://neurokind:neurokind@localhost:5432/neurokind"

# NextAuth - Generate secret with: openssl rand -hex 32
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
# GOOGLE_CLIENT_ID="your-id"
# GOOGLE_CLIENT_SECRET="your-secret"
```

**To generate NEXTAUTH_SECRET**:
```bash
openssl rand -hex 32
```

### 3. Setup Database

```bash
# Push schema to database
npm run db:push

# Seed with test data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Test Credentials

After running the seed script, use these credentials:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@neurokind.local` | `admin123` | ADMIN, MODERATOR |
| Moderator | `moderator@neurokind.local` | `moderator123` | MODERATOR |
| Parent | `parent@neurokind.local` | `parent123` | PARENT |
| Therapist | `therapist@neurokind.local` | `therapist123` | THERAPIST |

## User Roles

The system supports four user roles:

### PARENT
- Default role for new registrations
- Can create posts and comments
- Can bookmark resources
- Can access provider directory

### THERAPIST
- Can verify profile for provider listings
- Can create resources
- Can moderate discussions
- Can respond to posts

### MODERATOR
- Can moderate posts and comments
- Can remove/hide inappropriate content
- Can manage reports
- Can issue warnings

### ADMIN
- Full system access
- Can manage users and roles
- Can access admin panel
- Can configure system settings

## API Endpoints

### Authentication Routes

```
POST   /api/auth/signin                # NextAuth signin (credentials)
POST   /api/auth/signout               # Sign out
GET    /api/auth/session               # Get current session
POST   /api/auth/callback/:provider    # OAuth callbacks
```

### User Management

```
POST   /api/auth/register              # Register new user
GET    /api/user/profile               # Get current user profile
PUT    /api/user/profile               # Update profile
```

## Usage Examples

### Login Page

Users can sign in at `/login` with email and password.

```typescript
// Page is at: src/app/(auth)/login/page.tsx
// Uses signIn() from next-auth/react
```

### Register Page

Users can create accounts at `/register`.

```typescript
// Page is at: src/app/(auth)/register/page.tsx
// Creates User + Profile + assigns PARENT role
```

### Settings Page

Authenticated users can update their profile at `/settings`.

```typescript
// Page is at: src/app/settings/page.tsx
// Calls PUT /api/user/profile
```

### Check Session in Client Component

```typescript
"use client";

import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not signed in</div>;
  
  return <div>Hello {session?.user?.email}</div>;
}
```

### Get Session in Server Component

```typescript
// Server-side
import { getServerSession } from "@/lib/auth";

export async function MyServerComponent() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  return <div>Authenticated: {session.user.email}</div>;
}
```

### Check User Roles

```typescript
import { 
  currentUserHasRole, 
  currentUserHasAnyRole,
  requireRole,
  requireAnyRole 
} from "@/lib/rbac";

// Check role (returns boolean)
const isAdmin = await currentUserHasRole("ADMIN");

// Check multiple roles
const canModerate = await currentUserHasAnyRole(["ADMIN", "MODERATOR"]);

// Require role (throws if not authorized)
const user = await requireRole("ADMIN");

// Require any of multiple roles
const user = await requireAnyRole(["ADMIN", "MODERATOR"]);
```

### Protect API Routes

```typescript
// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    // This will throw if user doesn't have ADMIN role
    const user = await requireRole("ADMIN");
    
    // Safe to proceed
    return NextResponse.json({ message: "Admin access granted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}
```

### Protect Routes with Middleware

```typescript
// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await getServerSession();
  
  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session?.user?.roles?.includes("ADMIN")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/settings/:path*"],
};
```

## Session Object

The session object includes:

```typescript
interface Session {
  user: {
    id: string;           // User ID
    email: string;        // User email
    roles: string[];      // Array of roles: ["PARENT", "ADMIN", ...]
  };
  expires: string;        // ISO date when session expires
}
```

The roles array is populated on every session refresh from the database, ensuring role changes take effect immediately.

## Token & JWT Details

- **Strategy**: JWT
- **Max Age**: 30 days
- **Refresh**: On every request (roles updated from DB)
- **Signature**: Uses NEXTAUTH_SECRET

## Password Security

### Hashing

- Algorithm: bcryptjs with 10 rounds
- Used in: Registration and validation
- Hash is stored in `User.hashedPassword`

### Validation

```typescript
import bcryptjs from "bcryptjs";

// During registration
const hashedPassword = await bcryptjs.hash(password, 10);

// During login
const match = await bcryptjs.compare(inputPassword, storedHash);
```

## Input Validation

Uses Zod for runtime validation:

### Registration
```typescript
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  displayName: z.string().min(1).max(100),
});
```

### Login
```typescript
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

### Profile Update
```typescript
const ProfileUpdateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
});
```

## Google OAuth (Optional)

To enable Google OAuth:

1. **Create Google OAuth credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Set redirect URI to `http://localhost:3000/api/auth/callback/google`

2. **Add environment variables**:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

3. **Restart dev server** - Google provider will be auto-detected

Users can now sign in with Google on the login page.

## Database Schema

The authentication system uses these Prisma models:

### User
```typescript
model User {
  id                String      @id @default(cuid())
  email             String      @unique
  hashedPassword    String?     // Only for credentials provider
  lastLoginAt       DateTime?
  profile           Profile?
  userRoles         UserRole[]
  // ... other fields
}
```

### Profile
```typescript
model Profile {
  userId            String      @unique
  username          String      @unique
  displayName       String
  bio               String?
  location          String?
  avatarUrl         String?
  verifiedTherapist Boolean     @default(false)
  // ... other fields
}
```

### UserRole
```typescript
model UserRole {
  userId      String
  role        Role      // ADMIN | MODERATOR | THERAPIST | PARENT
  grantedAt   DateTime  @default(now())
  
  @@unique([userId, role])
}
```

## Common Troubleshooting

### "Invalid SECRET or provider issue"
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Generate new secret: `openssl rand -hex 32`

### "Provider error: CALLBACK_URL_MISMATCH"
- Check `NEXTAUTH_URL` matches your domain
- For localhost: `http://localhost:3000`
- For production: `https://yourdomain.com`

### "User not found" on login
- Run seed script to create test users: `npm run db:seed`
- Or manually create a user via admin panel

### "Role not updating immediately"
- Sessions cache roles but refresh on every request
- Restart browser session or wait for token refresh
- Manually revoke and re-issue JWT in dev mode

### "Username already taken" on registration
- Username must be unique
- Choose a different username

### "Email already registered"
- Email must be unique per user
- Use password reset or login with existing account

## Security Considerations

✅ **Implemented**:
- Password hashing with bcryptjs (10 rounds)
- HTTPS-only cookies in production
- CSRF protection via NextAuth
- SQL injection prevention (Prisma ORM)
- XSS protection (React sanitization)
- Rate limiting (should be added for production)
- Session expiry (30 days max)

🔧 **Recommended for Production**:
- Enable HTTPS only
- Set `SESSION_TIMEOUT` to shorter duration (e.g., 24 hours)
- Implement rate limiting on `/api/auth/register` and `/api/auth/signin`
- Add 2FA (two-factor authentication)
- Implement password reset flow
- Add session revocation mechanism
- Monitor failed login attempts
- Use environment-specific `NEXTAUTH_URL`

## API Response Examples

### Successful Registration
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "profile": {
      "username": "myusername",
      "displayName": "My Name",
      "bio": null,
      "location": null,
      "avatarUrl": null
    },
    "roles": ["PARENT"]
  }
}
```

### Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["password"],
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Get Profile
```json
{
  "id": "clx123abc",
  "email": "user@example.com",
  "profile": {
    "username": "myusername",
    "displayName": "My Name",
    "bio": "About me",
    "location": "NYC",
    "avatarUrl": "https://..."
  },
  "roles": ["PARENT"]
}
```

## Next Steps

1. ✅ Authentication system is complete
2. 🔄 API endpoints for forum, providers, chat (build next)
3. 🔄 Admin dashboard for user management
4. 🔄 Email verification flow
5. 🔄 Password reset functionality
6. 🔄 Two-factor authentication
7. 🔄 Session management UI
8. 🔄 Audit logging for security events

## Support

For issues or questions about authentication:
- Check the [NextAuth.js documentation](https://next-auth.js.org)
- Review the [Prisma Adapter docs](https://authjs.dev/reference/adapter/prisma)
- Check error logs: `npm run dev 2>&1 | tee logs.txt`
