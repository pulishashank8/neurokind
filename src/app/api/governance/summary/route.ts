/**
 * Data Governance Summary API
 *
 * Provides a comprehensive overview of data governance health:
 * - Catalog coverage
 * - Data quality score
 * - Lineage completeness
 * - PHI inventory
 * - Compliance status
 *
 * This is the main dashboard API for the Data Governance Dashboard.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // ========================================
    // DATA CATALOG METRICS
    // ========================================
    const totalDatasets = await prisma.dataset.count();
    const totalFields = await prisma.datasetField.count();
    const totalOwners = await prisma.dataOwner.count();
    const totalGlossaryTerms = await prisma.businessGlossaryTerm.count();

    const datasetsBySensitivity = await prisma.dataset.groupBy({
      by: ['sensitivity'],
      _count: true,
    });

    const datasetsByDomain = await prisma.dataset.groupBy({
      by: ['domain'],
      _count: true,
    });

    // PHI inventory
    const phiDatasets = await prisma.dataset.findMany({
      where: { sensitivity: 'PHI' },
      include: {
        _count: { select: { fields: true } },
        owner: true,
      },
    });

    const piiDatasets = await prisma.dataset.findMany({
      where: { sensitivity: 'PII' },
      include: {
        _count: { select: { fields: true } },
      },
    });

    // ========================================
    // DATA QUALITY METRICS
    // ========================================
    const totalRules = await prisma.dataQualityRule.count({
      where: { isActive: true },
    });

    const rulesBySeverity = await prisma.dataQualityRule.groupBy({
      by: ['severity'],
      where: { isActive: true },
      _count: true,
    });

    // Get latest results (one per rule)
    const latestResults = await prisma.dataQualityResult.findMany({
      take: 200,
      orderBy: { runDate: 'desc' },
      distinct: ['ruleId'],
      include: {
        rule: {
          select: {
            name: true,
            severity: true,
            dataset: { select: { name: true } },
          },
        },
      },
    });

    const passCount = latestResults.filter(r => r.status === 'PASS').length;
    const failCount = latestResults.filter(r => r.status === 'FAIL').length;
    const qualityScore = latestResults.length > 0
      ? Math.round((passCount / latestResults.length) * 100)
      : 100;

    // Critical failures
    const criticalFailures = latestResults
      .filter(r => r.status === 'FAIL' && r.rule.severity === 'CRITICAL')
      .map(r => ({
        ruleName: r.rule.name,
        datasetName: r.rule.dataset.name,
        failuresFound: r.failuresFound,
        runDate: r.runDate,
      }));

    // Recent quality trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentResults = await prisma.dataQualityResult.findMany({
      where: {
        runDate: { gte: sevenDaysAgo },
      },
      orderBy: { runDate: 'asc' },
    });

    // Group by day
    const qualityTrend: Record<string, { passed: number; failed: number }> = {};
    recentResults.forEach(r => {
      const day = r.runDate.toISOString().split('T')[0];
      if (!qualityTrend[day]) {
        qualityTrend[day] = { passed: 0, failed: 0 };
      }
      if (r.status === 'PASS') qualityTrend[day].passed++;
      else qualityTrend[day].failed++;
    });

    // ========================================
    // DATA LINEAGE METRICS
    // ========================================
    const totalNodes = await prisma.dataLineageNode.count();
    const totalEdges = await prisma.dataLineageEdge.count();

    const nodesByType = await prisma.dataLineageNode.groupBy({
      by: ['type'],
      _count: true,
    });

    // PHI lineage coverage
    const phiTableNodes = await prisma.dataLineageNode.count({
      where: {
        id: {
          in: phiDatasets.map(d => `db:${d.name}`),
        },
      },
    });

    // ========================================
    // COMPLIANCE & ACCESS METRICS
    // ========================================
    // Consent coverage
    const totalUsers = await prisma.user.count();
    const usersWithConsent = await prisma.userConsent.groupBy({
      by: ['userId'],
      where: { hasGranted: true },
    });
    const consentCoverage = totalUsers > 0
      ? Math.round((usersWithConsent.length / totalUsers) * 100)
      : 0;

    // Sensitive access logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sensitiveAccesses = await prisma.sensitiveAccessLog.count({
      where: {
        accessedAt: { gte: thirtyDaysAgo },
      },
    });

    const accessesByAction = await prisma.sensitiveAccessLog.groupBy({
      by: ['actionType'],
      where: {
        accessedAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // Audit log count
    const auditLogCount = await prisma.auditLog.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // ========================================
    // GOVERNANCE HEALTH SCORE
    // ========================================
    const catalogScore = totalDatasets > 0 ? 100 : 0;
    const ownershipScore = totalOwners > 0 ? 100 : 50;
    const lineageScore = totalEdges > 0 ? Math.min(100, (totalEdges / Math.max(totalNodes, 1)) * 50) : 0;
    const complianceScore = consentCoverage;

    const governanceHealthScore = Math.round(
      (qualityScore * 0.3) +
      (catalogScore * 0.25) +
      (lineageScore * 0.2) +
      (ownershipScore * 0.1) +
      (complianceScore * 0.15)
    );

    // ========================================
    // BUILD RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      data: {
        healthScore: governanceHealthScore,
        lastUpdated: new Date().toISOString(),

        catalog: {
          totalDatasets,
          totalFields,
          totalOwners,
          totalGlossaryTerms,
          bySensitivity: datasetsBySensitivity.reduce((acc, row) => {
            acc[row.sensitivity] = row._count;
            return acc;
          }, {} as Record<string, number>),
          byDomain: datasetsByDomain.reduce((acc, row) => {
            acc[row.domain] = row._count;
            return acc;
          }, {} as Record<string, number>),
          phiInventory: phiDatasets.map(d => ({
            name: d.name,
            description: d.description,
            fieldCount: d._count.fields,
            owner: d.owner?.teamName,
            retentionPolicy: d.retentionPolicy,
          })),
          piiDatasetCount: piiDatasets.length,
        },

        quality: {
          totalRules,
          qualityScore,
          bySeverity: rulesBySeverity.reduce((acc, row) => {
            acc[row.severity] = row._count;
            return acc;
          }, {} as Record<string, number>),
          latestResults: {
            passed: passCount,
            failed: failCount,
            total: latestResults.length,
          },
          criticalFailures,
          trend: Object.entries(qualityTrend).map(([date, counts]) => ({
            date,
            ...counts,
            score: Math.round((counts.passed / (counts.passed + counts.failed)) * 100) || 100,
          })),
        },

        lineage: {
          totalNodes,
          totalEdges,
          byType: nodesByType.reduce((acc, row) => {
            acc[row.type] = row._count;
            return acc;
          }, {} as Record<string, number>),
          phiCoverage: {
            totalPhiDatasets: phiDatasets.length,
            trackedInLineage: phiTableNodes,
            coveragePercent: phiDatasets.length > 0
              ? Math.round((phiTableNodes / phiDatasets.length) * 100)
              : 100,
          },
        },

        compliance: {
          consentCoverage,
          totalUsers,
          usersWithConsent: usersWithConsent.length,
          sensitiveAccesses: {
            total: sensitiveAccesses,
            byAction: accessesByAction.reduce((acc, row) => {
              acc[row.actionType] = row._count;
              return acc;
            }, {} as Record<string, number>),
          },
          auditLogEntries: auditLogCount,
        },

        alerts: [
          ...(criticalFailures.length > 0
            ? [{
                type: 'critical',
                message: `${criticalFailures.length} critical data quality failures detected`,
                count: criticalFailures.length,
              }]
            : []),
          ...(qualityScore < 80
            ? [{
                type: 'warning',
                message: `Data quality score is below 80% (${qualityScore}%)`,
                score: qualityScore,
              }]
            : []),
          ...(consentCoverage < 50
            ? [{
                type: 'info',
                message: `Only ${consentCoverage}% of users have provided consent`,
                coverage: consentCoverage,
              }]
            : []),
        ],
      },
    });
  } catch (error) {
    console.error('[API] Governance summary error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'GOVERNANCE_ERROR', message: 'Failed to fetch governance summary' } },
      { status: 500 }
    );
  }
}
