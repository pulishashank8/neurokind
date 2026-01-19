# NeuroKind Data Catalog

## Overview

The NeuroKind Data Catalog is an **enterprise-grade internal data platform** that provides comprehensive **data governance, discoverability, and security** for all datasets within the NeuroKind ecosystem. This is production-quality internal software designed for a healthcare environment, ensuring compliance, auditability, and enterprise-level data management.

## Purpose

The Data Catalog serves as the **central source of truth** for:

- **Data Discovery**: Find and understand what data exists across the platform
- **Data Ownership**: Clear accountability for who owns and maintains each dataset
- **Sensitivity Classification**: Proper classification of data based on privacy and security requirements
- **Compliance**: Support for HIPAA, GDPR, and healthcare data governance requirements
- **Documentation**: Comprehensive metadata and business glossary terms

## Architecture

### Components

1. **Admin Console** (`/admin`)
   - RBAC-protected interface (ADMIN role required)
   - Responsive design with sidebar navigation
   - Future-ready for additional governance features

2. **Data Catalog UI** (`/admin/data-catalog`)
   - Searchable dataset list
   - Advanced filtering (domain, sensitivity)
   - Detailed dataset views with full metadata

3. **Catalog API** (`/api/admin/catalog`)
   - RESTful CRUD operations
   - Server-side RBAC enforcement
   - Zod validation for all inputs

4. **Database Schema**
   - `Dataset`: Core dataset metadata
   - `DatasetField`: Individual field documentation
   - `DataOwner`: Team ownership tracking
   - `BusinessGlossaryTerm`: Business terminology definitions

## Data Sensitivity Classification

NeuroKind uses a **5-tier sensitivity model**:

| Level | Description | Examples | Access Controls |
|-------|-------------|----------|-----------------|
| **PUBLIC** | Publicly accessible information | Provider directory listings, public resources | No restrictions |
| **INTERNAL** | Internal company data | Analytics, usage metrics, system IDs | Employee access only |
| **SENSITIVE** | Confidential business/user data | Post content, comments, user behavior | Need-to-know basis |
| **PII** | Personally Identifiable Information | Email, IP address, location, username | Strict access, encryption at rest |
| **PHI** | Protected Health Information (HIPAA) | Screening results, diagnoses, treatment notes | HIPAA-compliant access only |

### Classification Policy

**Default Classification**: `INTERNAL` (when in doubt, classify higher)

**PII Fields** (always classify as PII or PHI):
- Email addresses
- Phone numbers
- IP addresses
- Physical addresses
- GPS coordinates (when linked to individuals)
- User IDs (when linkable to personal data)

**PHI Fields** (HIPAA protected):
- Any health/medical information
- Screening responses
- Diagnoses or treatment plans
- Therapy notes
- Child development data

**Best Practices**:
- Classify at the field level, not just dataset level
- When data combines fields, use the highest sensitivity level
- Document examples for each field
- Review classifications quarterly

## Seeded Datasets

The system is pre-populated with metadata for core NeuroKind datasets:

### Auth Domain
- **User**: Core authentication and identity data (PII)
- **Profile**: Extended user profiles and verification status (PII)

### Community Domain
- **Post**: Forum posts and discussions (SENSITIVE)
- **Comment**: User comments and replies (SENSITIVE)

### Providers Domain
- **Provider**: Healthcare provider directory (PUBLIC)

### Moderation Domain
- **ModActionLog**: Moderation actions and compliance (SENSITIVE)

### Analytics Domain
- **AuditLog**: System audit trail (SENSITIVE, contains PII)

Each dataset includes:
- 6-20 documented fields
- Proper sensitivity classifications
- Field descriptions and examples
- Nullable constraints
- Data type documentation

## API Reference

### List Datasets

```http
GET /api/admin/catalog?q={query}&domain={domain}&sensitivity={level}&page={page}&limit={limit}
```

**Query Parameters**:
- `q`: Search query (searches name, description, tags)
- `domain`: Filter by domain (community, auth, providers, etc.)
- `sensitivity`: Filter by sensitivity level
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)

**Response**:
```json
{
  "datasets": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Get Dataset Details

```http
GET /api/admin/catalog/{id}
```

**Response**: Full dataset with fields, owner, and glossary terms

### Create Dataset

```http
POST /api/admin/catalog
Content-Type: application/json

{
  "name": "NewDataset",
  "description": "Dataset description",
  "domain": "community",
  "ownerTeam": "Engineering",
  "sensitivity": "INTERNAL",
  "tags": ["tag1", "tag2"]
}
```

### Update Dataset

```http
PATCH /api/admin/catalog/{id}
Content-Type: application/json

{
  "description": "Updated description",
  "sensitivity": "SENSITIVE"
}
```

### Delete Dataset

```http
DELETE /api/admin/catalog/{id}
```

**Note**: Deletes cascade to fields and glossary term associations.

## Adding New Datasets

### Via Seed Script (Recommended)

1. Edit `web/prisma/seed.ts`
2. Add dataset creation:

```typescript
const myDataset = await prisma.dataset.upsert({
  where: { name: 'MyDataset' },
  update: {},
  create: {
    name: 'MyDataset',
    description: 'Clear description of purpose',
    domain: 'your-domain',
    ownerTeam: 'TeamName',
    sensitivity: 'INTERNAL',
    tags: ['tag1', 'tag2'],
  },
});
```

3. Add fields:

```typescript
await prisma.datasetField.createMany({
  data: [
    {
      datasetId: myDataset.id,
      name: 'fieldName',
      type: 'String',
      description: 'What this field contains',
      isNullable: false,
      sensitivity: 'PII',
      examples: 'example@example.com',
    },
    // ... more fields
  ],
  skipDuplicates: true,
});
```

4. Run seed:

```bash
npm run db:seed
```

### Via API

Use the POST endpoint documented above with an admin account.

## Business Glossary

The catalog includes standardized business terminology:

- **PII**: Personally Identifiable Information
- **PHI**: Protected Health Information
- **Data Retention**: How long data is kept
- **Audit Trail**: System activity records
- **Data Lineage**: Data flow tracking
- **Consent**: User permissions

These terms can be linked to datasets to provide additional context.

## Database Management Scripts

```bash
# Run migrations
npm run db:migrate

# Seed database (includes catalog data)
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Generate Prisma Client
npx prisma generate
```

## Access Control

### Admin Console Access

- **Required Role**: `ADMIN`
- **Redirect Behavior**: Non-admin users are redirected to `/community`
- **Session Check**: Server-side validation on all routes

### API Security

All catalog APIs enforce:
1. Authentication (NextAuth session required)
2. Authorization (ADMIN role required via `requireRole()`)
3. Input validation (Zod schemas)
4. Safe error messages (no stack traces in production)

## UI Features

### Data Catalog List
- Full-text search across names, descriptions, tags
- Domain filtering
- Sensitivity level filtering
- Pagination
- Real-time search (debounced)
- Responsive grid layout

### Dataset Detail View
- Full metadata display
- Fields table with types and sensitivity
- Related glossary terms
- Owner contact information
- Creation and update timestamps

## Future Enhancements (Placeholders Created)

The admin console includes navigation stubs for future features:

- **Data Lineage**: Visual flow of data through systems
- **Data Ingestion**: Automated data pipeline management
- **Data Quality**: Quality metrics and validation rules
- **Policies**: Governance policy management
- **Audit Logs**: Enhanced audit log viewer

## Development Guidelines

### Adding New Fields to Catalog

1. Update Prisma schema if adding new catalog models
2. Create migration: `npx prisma migrate dev --name add_feature`
3. Update seed script with sample data
4. Update TypeScript types if needed
5. Add API validation schemas
6. Document in this file

### Modifying Sensitivity Levels

Sensitivity is an enum in Prisma. To add/modify:

1. Update `DataSensitivity` enum in `schema.prisma`
2. Create migration
3. Update `SENSITIVITY_COLORS` in UI components
4. Update documentation

### Testing Checklist

- [ ] Admin access works (ADMIN role)
- [ ] Non-admin redirect works
- [ ] Dataset search works
- [ ] Filters work correctly
- [ ] Dataset detail view loads
- [ ] API returns proper errors
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] Seed script runs successfully

## Production Deployment Checklist

- [ ] Run `npx prisma migrate deploy` on production DB
- [ ] Run seed script to populate catalog
- [ ] Verify ADMIN users exist
- [ ] Test admin console access
- [ ] Verify API rate limiting (if applicable)
- [ ] Check error logging
- [ ] Verify HTTPS for all admin routes
- [ ] Review audit log configuration
- [ ] Document data retention policies
- [ ] Train admin users

## Support

For questions or issues with the Data Catalog:

- **Engineering Team**: engineering@neurokind.internal
- **Slack**: #eng-data
- **Documentation**: This file and inline code comments

## Compliance Notes

This system supports:

- **HIPAA Compliance**: PHI classification and access controls
- **GDPR**: Data inventory and retention tracking
- **SOC 2**: Audit trails and access logging
- **Internal Policies**: Ownership and accountability

**Important**: This catalog documents *what* data exists and *how* it's classified. Actual data access controls are enforced at the database and API level.

## Schema Reference

### Dataset Table

```prisma
model Dataset {
  id          String          @id @default(cuid())
  name        String          @unique
  description String
  domain      String
  ownerTeam   String
  sensitivity DataSensitivity
  tags        String[]
  createdAt   DateTime
  updatedAt   DateTime
}
```

### DatasetField Table

```prisma
model DatasetField {
  id          String          @id @default(cuid())
  datasetId   String
  name        String
  type        String
  description String
  isNullable  Boolean
  sensitivity DataSensitivity
  examples    String?
}
```

## Changelog

### v1.0.0 - Initial Release
- Admin console with RBAC
- Data catalog with search and filtering
- 7 pre-seeded NeuroKind datasets
- Business glossary with 6 terms
- Full CRUD API
- Comprehensive documentation
