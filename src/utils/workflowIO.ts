// src/utils/workflowIO.ts
// Workflow import/export utilities

import type { Node, Edge } from 'reactflow';

export type WorkflowData = {
  nodes: Node<any>[];
  edges: Edge[];
  version?: string;
  exportedAt?: string;
};

/**
 * Export workflow to JSON and trigger download
 */
export function exportWorkflowToJSON(
  nodes: Node<any>[],
  edges: Edge[],
  filename: string = 'workflow'
): void {
  const workflowData: WorkflowData = {
    nodes,
    edges,
    version: '1.0',
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(workflowData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported workflow data
 */
export function validateWorkflowData(data: unknown): {
  valid: boolean;
  error?: string;
  data?: WorkflowData;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid JSON structure' };
  }

  const workflowData = data as Record<string, unknown>;

  // Check for nodes array
  if (!Array.isArray(workflowData.nodes)) {
    return { valid: false, error: 'Missing or invalid "nodes" array' };
  }

  // Check for edges array
  if (!Array.isArray(workflowData.edges)) {
    return { valid: false, error: 'Missing or invalid "edges" array' };
  }

  // Validate each node has required properties
  for (let i = 0; i < workflowData.nodes.length; i++) {
    const node = workflowData.nodes[i] as Record<string, unknown>;
    if (!node.id || typeof node.id !== 'string') {
      return { valid: false, error: `Node at index ${i} is missing a valid "id"` };
    }
    if (!node.type || typeof node.type !== 'string') {
      return { valid: false, error: `Node "${node.id}" is missing a valid "type"` };
    }
    if (!node.position || typeof node.position !== 'object') {
      return { valid: false, error: `Node "${node.id}" is missing a valid "position"` };
    }
  }

  // Validate each edge has required properties
  for (let i = 0; i < workflowData.edges.length; i++) {
    const edge = workflowData.edges[i] as Record<string, unknown>;
    if (!edge.id || typeof edge.id !== 'string') {
      return { valid: false, error: `Edge at index ${i} is missing a valid "id"` };
    }
    if (!edge.source || typeof edge.source !== 'string') {
      return { valid: false, error: `Edge "${edge.id}" is missing a valid "source"` };
    }
    if (!edge.target || typeof edge.target !== 'string') {
      return { valid: false, error: `Edge "${edge.id}" is missing a valid "target"` };
    }
  }

  return { valid: true, data: workflowData as WorkflowData };
}

/**
 * Parse workflow from JSON file
 */
export function parseWorkflowFromFile(file: File): Promise<WorkflowData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const validation = validateWorkflowData(parsed);

        if (!validation.valid) {
          reject(new Error(validation.error));
          return;
        }

        resolve(validation.data!);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
