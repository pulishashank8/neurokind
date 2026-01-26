NeuroKid: Autism Support Platform - Production Operations Guide

What This Project Is

NeuroKid is a production web application deployed at www.neurokid.help. It is a comprehensive platform providing support, community, and resources for families with autistic children.

The system is currently live, actively serving real users, and working as designed.

Core Purpose

NeuroKid combines seven main features:

1. Community Forum - Discussion platform where parents share experiences
2. Provider Directory - Find autism specialists and therapists
3. AI Assistant - 24/7 chatbot for answering autism-related questions
4. Screening Tools - Evidence-based autism assessment questionnaires
5. Resource Library - Curated educational materials about autism
6. Daily Wins - Progress tracking and celebration of accomplishments
7. Private Messaging - Direct communication between parents and professionals

Who Built It

Owner: pulishashank8 (GitHub repository)
Team: Full-stack developers
Deployment: Automated via Vercel
Domain: www.neurokind.help

How It Works (Simple Version)

User Visits Site
- Types www.neurokid.help in browser
- Site loads within seconds
- User sees the interface
- User interacts (creating posts, reading, chatting with AI, etc.)
- Each action sends data to backend
- Backend processes and returns results
- User sees the update

Data Storage
- All information stored in PostgreSQL database
- Sensitive data encrypted or hashed
- Frequently accessed data cached in Redis
- Backups exist for disaster recovery

How It Is Built

Frontend Technologies
- Next.js 16.1.4 - Web application framework
- React 19.2.3 - User interface library
- TypeScript 5 - Type-safe JavaScript
- Tailwind CSS 4 - Styling system

Backend Technologies
- PostgreSQL 16 - Database storage
- Redis 7 - Caching layer
- Prisma 5.22.0 - Database access layer
- NextAuth.js 4.24.0 - User authentication

External Services
- Groq API - Powers the AI assistant
- Google OAuth - Social login functionality
- Resend - Email service for notifications

Infrastructure
- Vercel - Cloud hosting and deployment
- Docker - Local development containers
- GitHub - Code repository

Deployment Pipeline

How New Code Gets to Production

1. Developer makes changes locally
2. Commits and pushes to GitHub
3. Vercel detects the push automatically
4. Vercel downloads latest code
5. Vercel runs: npm install, prisma generate, next build
6. Build succeeds (or deployment stops if it fails)
7. New version deployed to Vercel servers
8. Domain www.neurokid.help points to new version
9. Users see the updates instantly
10. No downtime during deployment

Deployment Automation Benefits
- No manual steps needed
- Reduces human error
- Deployments happen ~5-10 minutes after push
- Can rollback to previous version instantly
- Zero downtime during deployments

Current Production Status

The Live Site
- Status: Active and working
- Domain: www.neurokid.help
- Hosting: Vercel (global CDN)
- Database: PostgreSQL (external)
- Cache: Redis (external)
- Updates: Automatic when code is pushed to main branch

Access Level
- Public: Anyone can visit and read
- Requires Login: Create posts, comment, use AI, access certain features
- Admin Only: Moderation panel

Current Features Status
✓ Community forum - Fully functional
✓ Provider directory - Fully functional
✓ AI assistant - Fully functional, powered by Groq
✓ Screening tools - Fully functional
✓ Resource library - Fully functional
✓ Daily wins - Fully functional
✓ Private messaging - Fully functional
✓ User authentication - Fully functional
✓ Email notifications - Fully functional

Project Structure

Understanding Where Everything Is

Root Files
- README.md - Main documentation
- PROJECT_SUMMARY.md - Technical deep dive
- package.json - Dependencies and scripts
- vercel.json - Deployment settings
- .env.example - Template for configuration

Main Folders
- src/app/ - All pages and API endpoints
- src/components/ - Reusable UI pieces
- src/lib/ - Helper functions and utilities
- prisma/ - Database definition and migrations
- docs/ - Feature documentation
- scripts/ - Utility scripts
- public/ - Images and static files
- python_tasks/ - Python backend server (optional)

Key Configuration Files
- tsconfig.json - TypeScript settings
- next.config.ts - Next.js configuration
- tailwind.config.ts - Styling defaults
- docker-compose.yml - Local database setup
- .env.local - Local secrets (not in Git)

Running the Project Locally

Prerequisites
- Node.js 20.x (from nodejs.org)
- Git (for cloning and version control)
- Docker (for PostgreSQL and Redis)
- A code editor (VS Code recommended)

Setup Steps

1. Clone the repository
git clone https://github.com/pulishashank8/neurokid.git
cd neurokid

2. Install dependencies
npm install

3. Set up environment
- Copy .env.example to .env.local
- Fill in required values (DATABASE_URL, API keys, etc.)

4. Start local database
docker-compose up -d
This starts PostgreSQL and Redis containers

5. Set up database schema
npm run db:push
Creates all database tables

6. Load initial data (optional)
npm run db:seed
Adds sample data for testing

7. Start development server
npm run dev
Application runs at http://localhost:5000

8. Make changes and test locally before pushing to Git

Useful Commands

Development
npm run dev - Start development server
npm run build - Create production build
npm run start - Start production server
npm run lint - Check code quality

Database
npm run db:push - Apply schema changes to database
npm run db:seed - Load sample data
npm run db:generate - Update TypeScript types from schema
npm run db:studio - Open visual database editor

Testing
npm test - Run automated tests
npm run test:watch - Run tests in watch mode

Deployment
git push - Push code to GitHub (automatically deploys)
Manual deployment: Not needed - Vercel deploys automatically

Security and Privacy

How User Data Is Protected

Passwords
- Never stored in plain text
- Hashed with bcrypt encryption
- Even admins cannot see original passwords

Data in Transit
- All connections use HTTPS (encrypted)
- Lock icon appears in browser
- Data cannot be read if intercepted

Session Security
- Login creates secure session token
- Token stored in secure, HTTP-only cookie
- Token cannot be accessed by JavaScript
- Session expires after inactivity

Database Security
- Only authorized application can access
- SQL injection prevented via Prisma ORM
- Database backups encrypted at rest
- Access restricted to necessary personnel

API Security
- Rate limiting prevents spam
- Input validation prevents bad data
- Authentication required for sensitive operations
- All requests logged for audit trail

Compliance
- HIPAA-compliant architecture
- GDPR considerations documented
- Data governance policy exists
- Privacy policy available on site

Important Notes

Environment Variables Are Critical
These settings must be configured correctly:
- DATABASE_URL - Where the database is
- NEXTAUTH_SECRET - Key for session encryption
- NEXTAUTH_URL - Where the site runs
- API keys for external services (Groq, Google, etc.)

These values are:
- Stored in .env.local locally (never in Git)
- Stored in Vercel dashboard for production
- Protected and access-restricted
- Never logged or exposed

Database Changes Require Migrations
When database schema changes:
1. Schema change is made in prisma/schema.prisma
2. Run npm run db:push to create migration
3. Migration file is created in prisma/migrations/
4. Migration is applied to database
5. Change is tracked in Git
6. When deployed, migration runs automatically

This ensures database consistency across environments.

Testing Before Pushing
Before pushing code to GitHub:
1. Run npm test to check tests pass
2. Run npm run lint to check code style
3. Test manually in development
4. Commit code with clear message
5. Push to GitHub
6. Vercel automatically tests and deploys

This catches problems before they reach production.

Monitoring and Maintenance

What to Monitor

Vercel Dashboard
- Check deployment status
- View error rates
- Monitor performance metrics
- See global CDN performance

Error Logs
- Check for new error patterns
- Investigate critical errors
- Fix and redeploy if needed

Performance
- Monitor page load times
- Check database query performance
- Review cache hit rates
- Watch for memory usage spikes

Backup Status
- Verify database backups running
- Test restore procedures periodically
- Document backup retention policy

When Something Breaks

Common Issues and Solutions

Application won't start after npm install
Solution: Delete node_modules, run npm install again

Database connection error
Solution: Check DATABASE_URL in .env.local, verify PostgreSQL running

Build fails on Vercel
Solution: Check build logs on Vercel dashboard, fix error locally, push corrected code

Site is slow
Solution: Check Vercel dashboard, review database queries, verify Redis cache

Environmental variables not working
Solution: Verify in Vercel dashboard, re-deploy

Cannot login
Solution: Check NextAuth configuration, verify database connection

Getting Help

Documentation
- README.md - Main documentation
- PROJECT_SUMMARY.md - Technical reference
- PRODUCTION_AUDIT_REPORT.md - Detailed analysis
- AUDIT_SUMMARY.md - Quick overview
- docs/ folder - Feature-specific guides

Internal Resources
- Check error logs on Vercel
- Review git commit history for context
- Check GitHub issues for known problems
- Ask team members

Finding Information

Need to know how X works?
1. Check feature-specific docs in docs/ folder
2. Look at code in src/ to see implementation
3. Check tests in src/__tests__/ for examples
4. Read related comments in the code
5. Search git history for when feature was added

Future Maintenance

Quarterly Tasks
- Review dependencies for updates
- Check security vulnerability notifications
- Test backup and restore procedures
- Analyze application performance
- Review and clean up error logs

Annually
- Security audit
- Database performance review
- Infrastructure assessment
- Compliance verification
- Update disaster recovery procedures

As Project Grows
- Monitor database size
- Review caching strategy
- Evaluate need for additional servers
- Consider database read replicas
- Plan for increased traffic

Current Project Statistics

Code Metrics
- TypeScript: ~95% of code
- Total files: 150+
- Database tables: 30+
- API endpoints: 24+
- React components: 50+
- Test coverage: ~40%

Performance Metrics
- Build time: ~2 minutes
- Page load time: ~1-2 seconds
- API response time: ~100-500ms
- Cache hit rate: ~60-70%
- Database query time: ~10-100ms

Infrastructure
- Frontend: Vercel (global CDN)
- Database: PostgreSQL 16
- Cache: Redis 7
- Deployment: GitHub → Vercel (automated)
- Monitoring: Vercel dashboard + custom logging

Technology Maturity
- All technologies modern and actively maintained
- No outdated or deprecated packages
- Regular security updates applied
- Stable, production-ready versions used

Contact and Responsibility

Project Owner: pulishashank8

Repository: https://github.com/pulishashank8/neurokid

Deployment Environment: Vercel
Live Site: https://www.neurokid.help

For questions about the project:
1. Check the documentation in this repository
2. Review the PRODUCTION_AUDIT_REPORT.md for detailed analysis
3. Contact the development team

====================================================================

This operations guide is for developers and team members who maintain
and manage NeuroKid. The project is in production and serving real users.

Status: Healthy and well-maintained
Last Updated: January 26, 2026
Next Review: Quarterly

====================================================================
