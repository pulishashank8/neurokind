/**
 * Seed Sample Data for Data Governance Demo
 *
 * Populates sample data for:
 * - Sensitive Access Logs (Audit trail)
 * - Data Quality Results (Quality check history)
 *
 * This creates realistic sample data for interview demonstration.
 *
 * Run with: npx tsx scripts/seed-sample-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAccessLogs() {
  console.log('📋 Seeding Sensitive Access Logs...\n');

  // Get an admin user (or create a demo one)
  let adminUser = await prisma.user.findFirst({
    where: { email: { contains: 'admin' } }
  });

  if (!adminUser) {
    // Try to find any user
    adminUser = await prisma.user.findFirst();
  }

  if (!adminUser) {
    console.log('   Creating demo admin user for audit logs...');
    adminUser = await prisma.user.create({
      data: {
        email: 'data-admin@demo.local',
        hashedPassword: 'demo-not-for-login',
        emailVerified: true,
      }
    });
  }

  // Sample access log entries representing realistic healthcare data governance scenarios
  const accessLogEntries = [
    {
      datasetName: 'ScreeningResult',
      actionType: 'VIEW',
      recordCount: 45,
      reason: 'Monthly autism screening audit - Q4 compliance review',
      hoursAgo: 1,
    },
    {
      datasetName: 'TherapySession',
      actionType: 'EXPORT',
      recordCount: 128,
      reason: 'Therapy progress report for research study IRB-2024-0892',
      hoursAgo: 3,
    },
    {
      datasetName: 'EmergencyCard',
      actionType: 'VIEW',
      recordCount: 12,
      reason: 'Emergency protocol verification - annual safety check',
      hoursAgo: 5,
    },
    {
      datasetName: 'AIConversation',
      actionType: 'VIEW',
      recordCount: 89,
      reason: 'PHI content review for AI training data exclusion',
      hoursAgo: 8,
    },
    {
      datasetName: 'User',
      actionType: 'UPDATE',
      recordCount: 3,
      reason: 'GDPR data correction request - ticket #DC-4521',
      hoursAgo: 12,
    },
    {
      datasetName: 'ProviderReview',
      actionType: 'VIEW',
      recordCount: 234,
      reason: 'Provider quality audit - quarterly review',
      hoursAgo: 24,
    },
    {
      datasetName: 'ScreeningResult',
      actionType: 'EXPORT',
      recordCount: 1500,
      reason: 'Annual de-identified research dataset extraction',
      hoursAgo: 36,
    },
    {
      datasetName: 'TherapySession',
      actionType: 'VIEW',
      recordCount: 67,
      reason: 'Therapist caseload analysis for resource planning',
      hoursAgo: 48,
    },
    {
      datasetName: 'EmergencyCard',
      actionType: 'EXPORT',
      recordCount: 5,
      reason: 'Parent-requested data portability - CCPA compliance',
      hoursAgo: 72,
    },
    {
      datasetName: 'UserConsent',
      actionType: 'VIEW',
      recordCount: 890,
      reason: 'Consent coverage audit for new privacy policy rollout',
      hoursAgo: 96,
    },
  ];

  // Clear existing sample data (optional - comment out to append)
  await prisma.sensitiveAccessLog.deleteMany({
    where: { reason: { contains: 'audit' } }
  });

  for (const entry of accessLogEntries) {
    const accessedAt = new Date();
    accessedAt.setHours(accessedAt.getHours() - entry.hoursAgo);

    await prisma.sensitiveAccessLog.create({
      data: {
        adminUserId: adminUser.id,
        datasetName: entry.datasetName,
        actionType: entry.actionType,
        recordCount: entry.recordCount,
        reason: entry.reason,
        filterCriteria: { timeRange: 'last_30_days' },
        accessedAt,
      }
    });

    console.log(`   ✓ ${entry.actionType} ${entry.datasetName} (${entry.recordCount} records)`);
  }

  console.log(`\n   ✅ Created ${accessLogEntries.length} audit log entries\n`);
}

async function seedQualityResults() {
  console.log('📊 Seeding Data Quality Results...\n');

  // Get all active quality rules
  const rules = await prisma.dataQualityRule.findMany({
    where: { isActive: true },
    include: { dataset: true },
    take: 15, // Limit for demo
  });

  if (rules.length === 0) {
    console.log('   ⚠️  No quality rules found. Run seed-quality-rules.ts first.\n');
    return;
  }

  // Clear existing results for fresh demo
  await prisma.dataQualityResult.deleteMany({});

  const results: Array<{
    ruleId: string;
    status: 'PASS' | 'FAIL';
    recordsChecked: number;
    failuresFound: number;
    anomalyScore: number | null;
    daysAgo: number;
  }> = [];

  // Generate realistic results for each rule
  for (const rule of rules) {
    // Most rules pass (realistic for a well-maintained system)
    const passRate = 0.85;
    const shouldPass = Math.random() < passRate;

    // Different record counts based on dataset type
    const recordMultiplier = {
      'ScreeningResult': 150,
      'TherapySession': 500,
      'EmergencyCard': 75,
      'User': 2500,
      'Profile': 2400,
      'Post': 3200,
      'AIMessage': 12000,
      'Provider': 450,
    }[rule.dataset.name] || 100;

    const baseRecords = Math.floor(recordMultiplier * (0.8 + Math.random() * 0.4));

    // Generate anomaly score for ANOMALY_DETECTION rules
    let anomalyScore: number | null = null;
    if (rule.ruleType === 'ANOMALY_DETECTION') {
      // Z-score: values > 3 indicate anomaly
      anomalyScore = shouldPass
        ? Math.random() * 1.5 + 0.2  // Normal range: 0.2 - 1.7
        : Math.random() * 2 + 2.5;   // Anomaly range: 2.5 - 4.5
    }

    results.push({
      ruleId: rule.id,
      status: shouldPass ? 'PASS' : 'FAIL',
      recordsChecked: baseRecords,
      failuresFound: shouldPass ? 0 : Math.floor(baseRecords * 0.02),
      anomalyScore,
      daysAgo: 0, // Today's run
    });

    // Add historical result from 1 day ago
    results.push({
      ruleId: rule.id,
      status: Math.random() < 0.9 ? 'PASS' : 'FAIL',
      recordsChecked: Math.floor(baseRecords * 0.95),
      failuresFound: Math.random() < 0.9 ? 0 : Math.floor(baseRecords * 0.01),
      anomalyScore: rule.ruleType === 'ANOMALY_DETECTION'
        ? Math.random() * 1.2 + 0.3
        : null,
      daysAgo: 1,
    });
  }

  // Create all results
  for (const result of results) {
    const runDate = new Date();
    runDate.setDate(runDate.getDate() - result.daysAgo);
    runDate.setHours(2, 0, 0, 0); // 2 AM scheduled run

    await prisma.dataQualityResult.create({
      data: {
        ruleId: result.ruleId,
        status: result.status,
        recordsChecked: result.recordsChecked,
        failuresFound: result.failuresFound,
        anomalyScore: result.anomalyScore,
        runDate,
        executionDurationMs: Math.floor(Math.random() * 500 + 100),
      }
    });
  }

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;

  console.log(`   ✅ Created ${results.length} quality check results`);
  console.log(`   📈 Pass: ${passCount}, Fail: ${failCount}`);
  console.log(`   📊 Quality Score: ${Math.round((passCount / results.length) * 100)}%\n`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    SAMPLE DATA SEEDING FOR INTERVIEW DEMO                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await seedAccessLogs();
  await seedQualityResults();

  // Summary
  const accessLogCount = await prisma.sensitiveAccessLog.count();
  const qualityResultCount = await prisma.dataQualityResult.count();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ SAMPLE DATA SEEDING COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`   📋 Audit Log Entries:     ${accessLogCount}`);
  console.log(`   📊 Quality Results:       ${qualityResultCount}`);
  console.log('\n   Your dashboard is now populated with realistic demo data.');
  console.log('   Visit: http://localhost:3000/owner/dashboard/data\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
