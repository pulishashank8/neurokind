/**
 * Data Lineage API
 *
 * Provides access to the data lineage graph:
 * - Get complete lineage graph for visualization
 * - Get upstream/downstream lineage for a node
 * - Impact analysis for schema changes
 *
 * This demonstrates data lineage capabilities for enterprise governance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  nodeId: z.string().optional(),
  direction: z.enum(['upstream', 'downstream', 'both']).optional(),
  depth: z.coerce.number().min(1).max(10).default(3),
  type: z.enum(['SOURCE', 'PROCESS', 'STORE', 'REPORT']).optional(),
  format: z.enum(['graph', 'reactflow']).default('graph'),
});

// Helper function to get upstream nodes
async function getUpstream(nodeId: string, depth: number): Promise<Array<{ id: string; name: string; type: string }>> {
  const upstream: Array<{ id: string; name: string; type: string }> = [];
  const visited = new Set<string>();

  async function traverse(id: string, currentDepth: number) {
    if (currentDepth === 0 || visited.has(id)) return;
    visited.add(id);

    const edges = await prisma.dataLineageEdge.findMany({
      where: { targetNodeId: id },
      include: { sourceNode: true },
    });

    for (const edge of edges) {
      upstream.push({
        id: edge.sourceNode.id,
        name: edge.sourceNode.name,
        type: edge.sourceNode.type,
      });
      await traverse(edge.sourceNodeId, currentDepth - 1);
    }
  }

  await traverse(nodeId, depth);
  return upstream;
}

// Helper function to get downstream nodes
async function getDownstream(nodeId: string, depth: number): Promise<Array<{ id: string; name: string; type: string }>> {
  const downstream: Array<{ id: string; name: string; type: string }> = [];
  const visited = new Set<string>();

  async function traverse(id: string, currentDepth: number) {
    if (currentDepth === 0 || visited.has(id)) return;
    visited.add(id);

    const edges = await prisma.dataLineageEdge.findMany({
      where: { sourceNodeId: id },
      include: { targetNode: true },
    });

    for (const edge of edges) {
      downstream.push({
        id: edge.targetNode.id,
        name: edge.targetNode.name,
        type: edge.targetNode.type,
      });
      await traverse(edge.targetNodeId, currentDepth - 1);
    }
  }

  await traverse(nodeId, depth);
  return downstream;
}

// Helper function for impact analysis
async function analyzeImpact(nodeId: string): Promise<{
  affectedApis: string[];
  affectedComponents: string[];
  affectedExports: string[];
}> {
  const downstream = await getDownstream(nodeId, 10);

  return {
    affectedApis: downstream
      .filter(n => n.type === 'PROCESS' && n.id.startsWith('api:'))
      .map(n => n.name),
    affectedComponents: downstream
      .filter(n => n.type === 'REPORT' && n.id.startsWith('component:'))
      .map(n => n.name),
    affectedExports: downstream
      .filter(n => n.type === 'REPORT' && n.id.startsWith('export:'))
      .map(n => n.name),
  };
}

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    SOURCE: '#e3f2fd',
    PROCESS: '#fff3e0',
    STORE: '#e8f5e9',
    REPORT: '#fce4ec',
  };
  return colors[type] || '#f5f5f5';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);

    // If nodeId is specified, get specific lineage
    if (query.nodeId) {
      const node = await prisma.dataLineageNode.findUnique({
        where: { id: query.nodeId },
      });

      if (!node) {
        return NextResponse.json(
          { success: false, error: { code: 'NODE_NOT_FOUND', message: `Node ${query.nodeId} not found` } },
          { status: 404 }
        );
      }

      let upstream: Awaited<ReturnType<typeof getUpstream>> = [];
      let downstream: Awaited<ReturnType<typeof getDownstream>> = [];

      if (query.direction === 'upstream' || query.direction === 'both') {
        upstream = await getUpstream(query.nodeId, query.depth);
      }

      if (query.direction === 'downstream' || query.direction === 'both') {
        downstream = await getDownstream(query.nodeId, query.depth);
      }

      // Impact analysis
      const impact = await analyzeImpact(query.nodeId);

      return NextResponse.json({
        success: true,
        data: {
          node: {
            id: node.id,
            name: node.name,
            type: node.type,
            metadata: node.metadata,
          },
          upstream,
          downstream,
          impact,
        },
      });
    }

    // Get full graph
    const nodes = await prisma.dataLineageNode.findMany();
    const edges = await prisma.dataLineageEdge.findMany();

    // Filter by type if specified
    let filteredNodes = nodes;
    if (query.type) {
      filteredNodes = nodes.filter(n => n.type === query.type);
    }

    // Format for React Flow if requested
    if (query.format === 'reactflow') {
      // Calculate positions for nodes
      const nodesByType: Record<string, typeof filteredNodes> = {
        SOURCE: [],
        PROCESS: [],
        STORE: [],
        REPORT: [],
      };

      filteredNodes.forEach(node => {
        if (nodesByType[node.type]) {
          nodesByType[node.type].push(node);
        }
      });

      const xPositions: Record<string, number> = { SOURCE: 0, PROCESS: 300, STORE: 600, REPORT: 900 };
      const nodePositions: Record<string, { x: number; y: number }> = {};

      Object.entries(nodesByType).forEach(([type, typeNodes]) => {
        typeNodes.forEach((node, index) => {
          nodePositions[node.id] = {
            x: xPositions[type] || 0,
            y: index * 80,
          };
        });
      });

      const reactflowNodes = filteredNodes.map(node => ({
        id: node.id,
        type: 'default',
        data: {
          label: node.name,
          nodeType: node.type,
        },
        position: nodePositions[node.id] || { x: 0, y: 0 },
        style: {
          background: getNodeColor(node.type),
          border: '1px solid #222',
          borderRadius: 4,
          padding: 10,
          fontSize: 12,
        },
      }));

      const reactflowEdges = edges
        .filter(e =>
          filteredNodes.some(n => n.id === e.sourceNodeId) &&
          filteredNodes.some(n => n.id === e.targetNodeId)
        )
        .map((edge, index) => ({
          id: `e-${index}`,
          source: edge.sourceNodeId,
          target: edge.targetNodeId,
          label: edge.transformationLogic,
          animated: true,
          style: { stroke: '#888' },
          labelStyle: { fontSize: 10 },
        }));

      return NextResponse.json({
        success: true,
        data: {
          nodes: reactflowNodes,
          edges: reactflowEdges,
        },
      });
    }

    // Get summary statistics
    const nodesByType = await prisma.dataLineageNode.groupBy({
      by: ['type'],
      _count: true,
    });

    const totalEdges = await prisma.dataLineageEdge.count();

    // Get PHI-related nodes
    const phiDatasets = await prisma.dataset.findMany({
      where: { sensitivity: 'PHI' },
      select: { name: true },
    });
    const phiTableNames = phiDatasets.map(d => d.name);
    const phiNodes = filteredNodes.filter(n =>
      n.id.startsWith('db:') && phiTableNames.some(t => n.id.includes(t))
    );

    return NextResponse.json({
      success: true,
      data: {
        graph: {
          nodes: filteredNodes.map(n => ({
            id: n.id,
            name: n.name,
            type: n.type,
            metadata: n.metadata,
          })),
          edges: edges.map(e => ({
            source: e.sourceNodeId,
            target: e.targetNodeId,
            transformation: e.transformationLogic,
          })),
        },
        summary: {
          totalNodes: filteredNodes.length,
          totalEdges,
          byType: nodesByType.reduce((acc, row) => {
            acc[row.type] = row._count;
            return acc;
          }, {} as Record<string, number>),
          phiDataNodes: phiNodes.length,
          phiNodeIds: phiNodes.map(n => n.id),
        },
      },
    });
  } catch (error) {
    console.error('[API] Lineage error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'LINEAGE_ERROR', message: 'Failed to fetch lineage data' } },
      { status: 500 }
    );
  }
}
