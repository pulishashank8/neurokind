/**
 * Seed Data Lineage Graph
 *
 * Populates the lineage graph with predefined data flows.
 * This demonstrates data lineage tracking similar to enterprise
 * tools like Collibra, DataHub, or Alation.
 *
 * Run with: npx tsx scripts/seed-lineage.ts
 */

import { PrismaClient } from '@prisma/client';
import { LineageTracker } from '../src/lib/lineage-tracker';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Data Lineage Graph...\n');

  const tracker = LineageTracker.getInstance();

  // Populate from static definitions
  console.log('📊 Populating lineage from flow definitions...');
  const result = await tracker.populateFromDefinitions();

  console.log(`\n✅ Created ${result.nodes} nodes and ${result.edges} edges\n`);

  // Display lineage summary
  console.log('='.repeat(60));
  console.log('📈 DATA LINEAGE SUMMARY');
  console.log('='.repeat(60));

  // Count by node type
  const nodesByType = await prisma.dataLineageNode.groupBy({
    by: ['type'],
    _count: true,
  });

  console.log('\n🔗 Nodes by Type:');
  const typeEmoji: Record<string, string> = {
    'SOURCE': '📥',
    'PROCESS': '⚙️',
    'STORE': '💾',
    'REPORT': '📊',
  };
  for (const row of nodesByType) {
    console.log(`   ${typeEmoji[row.type] || '•'} ${row.type}: ${row._count} nodes`);
  }

  // Show data flows
  console.log('\n📋 Data Flows Documented:');
  const flows = [
    { name: 'screening-flow', description: 'Autism screening → Results → Export' },
    { name: 'therapy-session-flow', description: 'Session logging → Analytics → Progress' },
    { name: 'emergency-card-flow', description: 'Emergency info → Storage → Print' },
    { name: 'community-post-flow', description: 'Post creation → Cache → Display' },
    { name: 'ai-chat-flow', description: 'User message → AI → Response' },
    { name: 'user-registration-flow', description: 'Registration → Hash → Verify' },
    { name: 'provider-search-flow', description: 'Search → Filter → Results' },
    { name: 'data-export-flow', description: 'GDPR request → Aggregate → Export' },
  ];

  for (const flow of flows) {
    console.log(`   • ${flow.name}: ${flow.description}`);
  }

  // Example impact analysis
  console.log('\n🔍 Sample Impact Analysis:');
  console.log('   If "ScreeningResult" table changes, affected:');
  const impact = await tracker.analyzeImpact('db:ScreeningResult');
  console.log(`   - APIs: ${impact.affectedApis.length > 0 ? impact.affectedApis.join(', ') : 'None tracked'}`);
  console.log(`   - Components: ${impact.affectedComponents.length > 0 ? impact.affectedComponents.join(', ') : 'None tracked'}`);
  console.log(`   - Exports: ${impact.affectedExports.length > 0 ? impact.affectedExports.join(', ') : 'None tracked'}`);

  // Total counts
  const totalNodes = await prisma.dataLineageNode.count();
  const totalEdges = await prisma.dataLineageEdge.count();

  console.log('\n📊 Totals:');
  console.log(`   Lineage Nodes: ${totalNodes}`);
  console.log(`   Lineage Edges: ${totalEdges}`);

  console.log('\n✅ Data Lineage seeding complete!');
  console.log('   View the lineage graph in the Data Governance Dashboard.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
