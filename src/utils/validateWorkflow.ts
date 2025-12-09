// src/utils/validateWorkflow.ts
// Workflow validation utilities

import type { Node, Edge } from 'reactflow';

export type ValidationResult = {
  valid: boolean;
  message: string;
  severity: 'error' | 'warning';
};

export type ValidationResults = Record<string, ValidationResult>;

/**
 * Validates the workflow and returns validation results for each node
 */
export function validateWorkflow(
  nodes: Node<any>[],
  edges: Edge[]
): ValidationResults {
  const results: ValidationResults = {};

  // Build connection maps
  const incomingEdges = new Map<string, Edge[]>();
  const outgoingEdges = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, []);
    }
    incomingEdges.get(edge.target)!.push(edge);

    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, []);
    }
    outgoingEdges.get(edge.source)!.push(edge);
  });

  // Count node types
  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');

  // Global validations
  const hasStart = startNodes.length > 0;
  const hasEnd = endNodes.length > 0;
  const hasMultipleStarts = startNodes.length > 1;
  const hasMultipleEnds = endNodes.length > 1;

  // Validate each node
  nodes.forEach((node) => {
    const incoming = incomingEdges.get(node.id) || [];
    const outgoing = outgoingEdges.get(node.id) || [];

    // Start node validations
    if (node.type === 'start') {
      if (hasMultipleStarts) {
        results[node.id] = {
          valid: false,
          message: 'Multiple start nodes detected. Only one start node is allowed.',
          severity: 'error',
        };
        return;
      }
      if (incoming.length > 0) {
        results[node.id] = {
          valid: false,
          message: 'Start node should not have incoming connections.',
          severity: 'error',
        };
        return;
      }
      if (outgoing.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Start node must have at least one outgoing connection.',
          severity: 'error',
        };
        return;
      }
    }

    // End node validations
    if (node.type === 'end') {
      if (hasMultipleEnds) {
        results[node.id] = {
          valid: false,
          message: 'Multiple end nodes detected. Consider having a single end point.',
          severity: 'warning',
        };
        return;
      }
      if (outgoing.length > 0) {
        results[node.id] = {
          valid: false,
          message: 'End node should not have outgoing connections.',
          severity: 'error',
        };
        return;
      }
      if (incoming.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'End node must have at least one incoming connection.',
          severity: 'error',
        };
        return;
      }
    }

    // Task node validations
    if (node.type === 'task') {
      if (!node.data?.title || node.data.title.trim() === '' || node.data.title === 'New Task') {
        results[node.id] = {
          valid: false,
          message: 'Task requires a meaningful title.',
          severity: 'warning',
        };
        return;
      }
      if (incoming.length === 0 && outgoing.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Task node is disconnected. Connect it to the workflow.',
          severity: 'error',
        };
        return;
      }
      if (incoming.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Task node has no incoming connection.',
          severity: 'warning',
        };
        return;
      }
      if (outgoing.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Task node has no outgoing connection.',
          severity: 'warning',
        };
        return;
      }
    }

    // Approval node validations
    if (node.type === 'approval') {
      if (!node.data?.approverRole || node.data.approverRole.trim() === '') {
        results[node.id] = {
          valid: false,
          message: 'Approval node requires an approver role.',
          severity: 'warning',
        };
        return;
      }
      if (incoming.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Approval node has no incoming connection.',
          severity: 'error',
        };
        return;
      }
      if (outgoing.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Approval node has no outgoing connection.',
          severity: 'warning',
        };
        return;
      }
    }

    // Automated node validations
    if (node.type === 'automated') {
      if (!node.data?.actionId || node.data.actionId.trim() === '') {
        results[node.id] = {
          valid: false,
          message: 'Automated node requires an action to be selected.',
          severity: 'warning',
        };
        return;
      }
      if (incoming.length === 0 || outgoing.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Automated node must be connected to the workflow.',
          severity: 'error',
        };
        return;
      }
    }

    // General dangling node check (for non-start, non-end nodes)
    if (node.type !== 'start' && node.type !== 'end') {
      if (incoming.length === 0 && outgoing.length === 0) {
        results[node.id] = {
          valid: false,
          message: 'Node is disconnected from the workflow.',
          severity: 'error',
        };
        return;
      }
    }
  });

  return results;
}

/**
 * Get global workflow validation messages
 */
export function getWorkflowErrors(nodes: Node<any>[]): string[] {
  const errors: string[] = [];

  const startNodes = nodes.filter((n) => n.type === 'start');
  const endNodes = nodes.filter((n) => n.type === 'end');

  if (startNodes.length === 0) {
    errors.push('Workflow is missing a Start node.');
  }
  if (endNodes.length === 0) {
    errors.push('Workflow is missing an End node.');
  }
  if (startNodes.length > 1) {
    errors.push('Workflow has multiple Start nodes. Only one is allowed.');
  }

  return errors;
}

/**
 * Check if the entire workflow is valid
 */
export function isWorkflowValid(nodes: Node<any>[], edges: Edge[]): boolean {
  const globalErrors = getWorkflowErrors(nodes);
  if (globalErrors.length > 0) return false;

  const nodeResults = validateWorkflow(nodes, edges);
  return Object.values(nodeResults).every((r) => r.valid !== false);
}
