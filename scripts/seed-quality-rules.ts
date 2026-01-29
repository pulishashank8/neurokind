/**
 * Seed Data Quality Rules for Autism Healthcare Data
 *
 * Creates production-grade data quality rules specific to:
 * - Autism screening results validation
 * - Therapy session data integrity
 * - Emergency card completeness
 * - PHI field validation
 *
 * Run with: npx tsx scripts/seed-quality-rules.ts
 */

import { PrismaClient, DataQualityRuleType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface QualityRuleInput {
  datasetName: string;
  fieldName?: string;
  ruleType: DataQualityRuleType;
  name: string;
  description: string;
  criteria: Prisma.InputJsonValue;
  severity: 'WARNING' | 'CRITICAL';
}

const qualityRules: QualityRuleInput[] = [
  // ============================================================================
  // SCREENING RESULT QUALITY RULES
  // ============================================================================
  {
    datasetName: 'ScreeningResult',
    fieldName: 'score',
    ruleType: 'RANGE_CHECK',
    name: 'Screening score within valid range',
    description: 'M-CHAT scores should be 0-20, AQ scores 0-50. Invalid scores indicate data entry errors.',
    criteria: {
      conditions: [
        { screeningType: 'M-CHAT', min: 0, max: 20 },
        { screeningType: 'M-CHAT-R', min: 0, max: 20 },
        { screeningType: 'AQ', min: 0, max: 50 },
        { screeningType: 'AQ-10', min: 0, max: 10 },
        { screeningType: 'ADOS', min: 0, max: 30 },
      ],
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'ScreeningResult',
    fieldName: 'riskLevel',
    ruleType: 'REGEX_MATCH',
    name: 'Risk level uses standard values',
    description: 'Risk level must be one of: low, medium, high, very_high',
    criteria: {
      pattern: '^(low|medium|high|very_high)$',
      flags: 'i',
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'ScreeningResult',
    fieldName: 'screeningType',
    ruleType: 'REGEX_MATCH',
    name: 'Screening type is standardized',
    description: 'Only validated autism screening tools are accepted',
    criteria: {
      pattern: '^(M-CHAT|M-CHAT-R|M-CHAT-R/F|AQ|AQ-10|AQ-Child|ADOS|ADOS-2|ADI-R|CARS|CARS-2)$',
      flags: 'i',
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'ScreeningResult',
    fieldName: 'answers',
    ruleType: 'NULL_CHECK',
    name: 'Screening answers are recorded',
    description: 'Individual question answers should be stored for audit trail',
    criteria: {
      allowNull: false,
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'ScreeningResult',
    ruleType: 'CUSTOM_SQL',
    name: 'Score matches risk level classification',
    description: 'Validates that risk level correctly corresponds to the screening score',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "ScreeningResult"
        WHERE
          ("screeningType" = 'M-CHAT' AND "score" <= 2 AND "riskLevel" != 'low')
          OR ("screeningType" = 'M-CHAT' AND "score" BETWEEN 3 AND 7 AND "riskLevel" NOT IN ('medium', 'high'))
          OR ("screeningType" = 'M-CHAT' AND "score" >= 8 AND "riskLevel" != 'high')
      `,
      expectedValue: 0,
    },
    severity: 'CRITICAL',
  },

  // ============================================================================
  // THERAPY SESSION QUALITY RULES
  // ============================================================================
  {
    datasetName: 'TherapySession',
    fieldName: 'childName',
    ruleType: 'NULL_CHECK',
    name: 'Child name is required',
    description: 'Therapy sessions must have child name for tracking',
    criteria: {
      allowNull: false,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'TherapySession',
    fieldName: 'therapistName',
    ruleType: 'NULL_CHECK',
    name: 'Therapist name is required',
    description: 'Therapy sessions must identify the therapist',
    criteria: {
      allowNull: false,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'TherapySession',
    fieldName: 'duration',
    ruleType: 'RANGE_CHECK',
    name: 'Session duration is reasonable',
    description: 'Therapy sessions should be between 15 minutes and 4 hours',
    criteria: {
      min: 15,
      max: 240,
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'TherapySession',
    fieldName: 'mood',
    ruleType: 'RANGE_CHECK',
    name: 'Mood rating is valid',
    description: 'Mood must be on 1-5 scale if provided',
    criteria: {
      min: 1,
      max: 5,
      allowNull: true,
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'TherapySession',
    fieldName: 'sessionDate',
    ruleType: 'CUSTOM_SQL',
    name: 'Session date is not in future',
    description: 'Cannot log future therapy sessions',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "TherapySession"
        WHERE "sessionDate" > NOW()
      `,
      expectedValue: 0,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'TherapySession',
    ruleType: 'ANOMALY_DETECTION',
    name: 'Detect unusual session frequency',
    description: 'Flag users with abnormally high session counts (potential data quality issue)',
    criteria: {
      metric: 'sessions_per_user_per_week',
      algorithm: 'zscore',
      threshold: 3.0,
      sql: `
        SELECT "userId", COUNT(*) as session_count
        FROM "TherapySession"
        WHERE "sessionDate" >= NOW() - INTERVAL '7 days'
        GROUP BY "userId"
      `,
    },
    severity: 'WARNING',
  },

  // ============================================================================
  // EMERGENCY CARD QUALITY RULES
  // ============================================================================
  {
    datasetName: 'EmergencyCard',
    fieldName: 'childName',
    ruleType: 'NULL_CHECK',
    name: 'Child name is required on emergency card',
    description: 'Emergency cards must identify the child',
    criteria: {
      allowNull: false,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'EmergencyCard',
    ruleType: 'CUSTOM_SQL',
    name: 'Emergency card has at least one contact',
    description: 'Emergency cards should have at least one emergency contact',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "EmergencyCard"
        WHERE ("emergencyContact1Name" IS NULL OR "emergencyContact1Name" = '')
          AND ("emergencyContact2Name" IS NULL OR "emergencyContact2Name" = '')
      `,
      expectedValue: 0,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'EmergencyCard',
    fieldName: 'emergencyContact1Phone',
    ruleType: 'REGEX_MATCH',
    name: 'Phone number format is valid',
    description: 'Phone numbers should be in valid format',
    criteria: {
      pattern: '^[\\d\\s\\-\\(\\)\\+]{7,20}$',
      allowNull: true,
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'EmergencyCard',
    ruleType: 'CUSTOM_SQL',
    name: 'Emergency card completeness score',
    description: 'Cards with less than 50% fields filled are flagged',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "EmergencyCard"
        WHERE (
          (CASE WHEN "childName" IS NOT NULL AND "childName" != '' THEN 1 ELSE 0 END) +
          (CASE WHEN "diagnosis" IS NOT NULL AND "diagnosis" != '' THEN 1 ELSE 0 END) +
          (CASE WHEN "triggers" IS NOT NULL AND "triggers" != '' THEN 1 ELSE 0 END) +
          (CASE WHEN "calmingStrategies" IS NOT NULL AND "calmingStrategies" != '' THEN 1 ELSE 0 END) +
          (CASE WHEN "medications" IS NOT NULL AND "medications" != '' THEN 1 ELSE 0 END) +
          (CASE WHEN "emergencyContact1Phone" IS NOT NULL THEN 1 ELSE 0 END)
        ) < 3
      `,
      expectedValue: 0,
    },
    severity: 'WARNING',
  },

  // ============================================================================
  // USER & PII QUALITY RULES
  // ============================================================================
  {
    datasetName: 'User',
    fieldName: 'email',
    ruleType: 'REGEX_MATCH',
    name: 'Email format is valid',
    description: 'All user emails must be properly formatted',
    criteria: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'User',
    fieldName: 'email',
    ruleType: 'NULL_CHECK',
    name: 'Email is required',
    description: 'All users must have an email address',
    criteria: {
      allowNull: false,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'User',
    ruleType: 'CUSTOM_SQL',
    name: 'No duplicate emails',
    description: 'Email addresses must be unique across all users',
    criteria: {
      sql: `
        SELECT COUNT(*) - COUNT(DISTINCT LOWER("email")) as failures
        FROM "User"
      `,
      expectedValue: 0,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'Profile',
    fieldName: 'username',
    ruleType: 'REGEX_MATCH',
    name: 'Username format is valid',
    description: 'Usernames must be alphanumeric with underscores, 3-50 chars',
    criteria: {
      pattern: '^[a-zA-Z0-9_]{3,50}$',
    },
    severity: 'WARNING',
  },

  // ============================================================================
  // AI CONVERSATION QUALITY RULES
  // ============================================================================
  {
    datasetName: 'AIMessage',
    fieldName: 'role',
    ruleType: 'REGEX_MATCH',
    name: 'Message role is valid',
    description: 'AI message roles must be user, assistant, or system',
    criteria: {
      pattern: '^(user|assistant|system)$',
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'AIMessage',
    fieldName: 'content',
    ruleType: 'NULL_CHECK',
    name: 'Message content is required',
    description: 'AI messages must have content',
    criteria: {
      allowNull: false,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'AIConversation',
    ruleType: 'CUSTOM_SQL',
    name: 'Conversations have at least one message',
    description: 'Empty conversations may indicate bugs',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "AIConversation" c
        WHERE NOT EXISTS (
          SELECT 1 FROM "AIMessage" m WHERE m."conversationId" = c.id
        )
      `,
      expectedValue: 0,
    },
    severity: 'WARNING',
  },

  // ============================================================================
  // PROVIDER DIRECTORY QUALITY RULES
  // ============================================================================
  {
    datasetName: 'Provider',
    fieldName: 'name',
    ruleType: 'NULL_CHECK',
    name: 'Provider name is required',
    description: 'All providers must have a name',
    criteria: {
      allowNull: false,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'Provider',
    ruleType: 'CUSTOM_SQL',
    name: 'Verified providers have complete profiles',
    description: 'Verified providers should have address and at least one specialty',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "Provider"
        WHERE "isVerified" = true
        AND (
          "address" IS NULL
          OR "address" = ''
          OR array_length("specialties", 1) IS NULL
          OR array_length("specialties", 1) = 0
        )
      `,
      expectedValue: 0,
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'Provider',
    fieldName: 'rating',
    ruleType: 'RANGE_CHECK',
    name: 'Provider rating is valid',
    description: 'Ratings must be between 1.0 and 5.0',
    criteria: {
      min: 1.0,
      max: 5.0,
      allowNull: true,
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'Provider',
    ruleType: 'CUSTOM_SQL',
    name: 'Rating matches review count',
    description: 'Providers with ratings should have reviews',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "Provider"
        WHERE "rating" IS NOT NULL AND "totalReviews" = 0
      `,
      expectedValue: 0,
    },
    severity: 'WARNING',
  },

  // ============================================================================
  // CONSENT & COMPLIANCE QUALITY RULES
  // ============================================================================
  {
    datasetName: 'UserConsent',
    fieldName: 'consentType',
    ruleType: 'REGEX_MATCH',
    name: 'Consent type is standardized',
    description: 'Consent types must match defined categories',
    criteria: {
      pattern: '^(analytics_tracking|ai_training|research|marketing|third_party_sharing)$',
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'UserConsent',
    ruleType: 'CUSTOM_SQL',
    name: 'Consent records have valid timestamps',
    description: 'Granted consents must have grantedAt, revoked must have revokedAt',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "UserConsent"
        WHERE
          ("hasGranted" = true AND "grantedAt" IS NULL)
          OR ("hasGranted" = false AND "revokedAt" IS NULL AND "grantedAt" IS NOT NULL)
      `,
      expectedValue: 0,
    },
    severity: 'WARNING',
  },

  // ============================================================================
  // AUDIT & ACCESS LOG QUALITY RULES
  // ============================================================================
  {
    datasetName: 'AuditLog',
    fieldName: 'action',
    ruleType: 'NULL_CHECK',
    name: 'Audit action is required',
    description: 'All audit logs must have an action recorded',
    criteria: {
      allowNull: false,
    },
    severity: 'CRITICAL',
  },
  {
    datasetName: 'SensitiveAccessLog',
    fieldName: 'reason',
    ruleType: 'CUSTOM_SQL',
    name: 'PHI access has documented reason',
    description: 'Access to PHI data should have a documented business reason',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "SensitiveAccessLog"
        WHERE "reason" IS NULL OR "reason" = ''
      `,
      expectedValue: 0,
    },
    severity: 'WARNING',
  },

  // ============================================================================
  // POST & COMMUNITY QUALITY RULES
  // ============================================================================
  {
    datasetName: 'Post',
    fieldName: 'title',
    ruleType: 'CUSTOM_SQL',
    name: 'Post title length is valid',
    description: 'Post titles should be 5-200 characters',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "Post"
        WHERE LENGTH("title") < 5 OR LENGTH("title") > 200
      `,
      expectedValue: 0,
    },
    severity: 'WARNING',
  },
  {
    datasetName: 'Post',
    ruleType: 'CUSTOM_SQL',
    name: 'Posts have valid categories',
    description: 'All posts must reference existing categories',
    criteria: {
      sql: `
        SELECT COUNT(*) as failures FROM "Post" p
        WHERE NOT EXISTS (
          SELECT 1 FROM "Category" c WHERE c.id = p."categoryId"
        )
      `,
      expectedValue: 0,
    },
    severity: 'CRITICAL',
  },
];

async function main() {
  console.log('🚀 Seeding Data Quality Rules for Autism Healthcare Data...\n');

  let created = 0;
  let updated = 0;

  for (const rule of qualityRules) {
    // Find the dataset
    const dataset = await prisma.dataset.findUnique({
      where: { name: rule.datasetName },
    });

    if (!dataset) {
      console.log(`   ⚠️  Dataset not found: ${rule.datasetName} - skipping rule: ${rule.name}`);
      console.log(`      Run 'npx tsx scripts/populate-data-catalog.ts' first!`);
      continue;
    }

    // Upsert the rule
    const existingRule = await prisma.dataQualityRule.findFirst({
      where: {
        datasetId: dataset.id,
        name: rule.name,
      },
    });

    if (existingRule) {
      await prisma.dataQualityRule.update({
        where: { id: existingRule.id },
        data: {
          fieldName: rule.fieldName || null,
          ruleType: rule.ruleType,
          description: rule.description,
          criteria: rule.criteria,
          severity: rule.severity,
          isActive: true,
        },
      });
      updated++;
    } else {
      await prisma.dataQualityRule.create({
        data: {
          datasetId: dataset.id,
          fieldName: rule.fieldName || null,
          ruleType: rule.ruleType,
          name: rule.name,
          description: rule.description,
          criteria: rule.criteria,
          severity: rule.severity,
          isActive: true,
        },
      });
      created++;
    }

    const severityIcon = rule.severity === 'CRITICAL' ? '🔴' : '🟡';
    const typeIcon = {
      'NULL_CHECK': '∅',
      'REGEX_MATCH': '📝',
      'RANGE_CHECK': '📊',
      'ANOMALY_DETECTION': '🤖',
      'CUSTOM_SQL': '🔍',
      'FOREIGN_KEY': '🔗',
    }[rule.ruleType];

    console.log(`   ${severityIcon} ${typeIcon} ${rule.datasetName}.${rule.fieldName || '*'}: ${rule.name}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 DATA QUALITY RULES SUMMARY');
  console.log('='.repeat(60));

  // Get rule counts by dataset
  const rulesByDataset = await prisma.dataQualityRule.groupBy({
    by: ['datasetId'],
    _count: true,
  });

  console.log('\n📋 Rules by Dataset:');
  for (const row of rulesByDataset) {
    const dataset = await prisma.dataset.findUnique({ where: { id: row.datasetId } });
    console.log(`   ${dataset?.name}: ${row._count} rules`);
  }

  // Get rule counts by type
  const rulesByType = await prisma.dataQualityRule.groupBy({
    by: ['ruleType'],
    _count: true,
  });

  console.log('\n🔧 Rules by Type:');
  for (const row of rulesByType) {
    console.log(`   ${row.ruleType}: ${row._count} rules`);
  }

  // Get rule counts by severity
  const rulesBySeverity = await prisma.dataQualityRule.groupBy({
    by: ['severity'],
    _count: true,
  });

  console.log('\n⚠️  Rules by Severity:');
  for (const row of rulesBySeverity) {
    const icon = row.severity === 'CRITICAL' ? '🔴' : '🟡';
    console.log(`   ${icon} ${row.severity}: ${row._count} rules`);
  }

  const totalRules = await prisma.dataQualityRule.count();

  console.log('\n📈 Totals:');
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Total Active Rules: ${totalRules}`);

  console.log('\n✅ Data Quality Rules seeding complete!');
  console.log('   These rules validate your autism healthcare data.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
