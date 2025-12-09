// src/utils/autoLayout.ts
// Auto-layout utility using dagre

import type { Node, Edge } from 'reactflow';

// @ts-ignore - dagre types may not be available
import dagre from 'dagre';

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

export type AutoLayoutOptions = {
  direction?: LayoutDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
};

const defaultOptions: Required<AutoLayoutOptions> = {
  direction: 'TB',
  nodeWidth: 220,
  nodeHeight: 100,
  rankSep: 80,
  nodeSep: 50,
};

/**
 * Apply automatic layout to nodes using dagre
 */
export function applyAutoLayout(
  nodes: Node<any>[],
  edges: Edge[],
  options: AutoLayoutOptions = {}
): Node<any>[] {
  const opts = { ...defaultOptions, ...options };

  // Create a new dagre graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Set graph properties
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    // Use different sizes based on node type
    let width = opts.nodeWidth;
    let height = opts.nodeHeight;

    if (node.type === 'start' || node.type === 'end') {
      width = 200;
      height = 80;
    } else if (node.type === 'task') {
      width = 240;
      height = 120;
    }

    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Apply positions back to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Get node dimensions for centering
    let width = opts.nodeWidth;
    let height = opts.nodeHeight;

    if (node.type === 'start' || node.type === 'end') {
      width = 200;
      height = 80;
    } else if (node.type === 'task') {
      width = 240;
      height = 120;
    }

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return layoutedNodes;
}
