// src/utils/templates.ts
// Workflow templates for quick start

import type { Node, Edge } from 'reactflow';
import { nanoid } from 'nanoid';

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  nodes: Omit<Node<any>, 'id'>[];
  edges: { sourceIndex: number; targetIndex: number }[];
};

// Generate fresh IDs for template nodes
export function instantiateTemplate(template: WorkflowTemplate): {
  nodes: Node<any>[];
  edges: Edge[];
} {
  const nodeIds = template.nodes.map(() => nanoid());

  const nodes: Node<any>[] = template.nodes.map((n, i) => ({
    ...n,
    id: nodeIds[i],
  }));

  const edges: Edge[] = template.edges.map((e) => ({
    id: nanoid(),
    source: nodeIds[e.sourceIndex],
    target: nodeIds[e.targetIndex],
    type: 'smoothstep',
    style: { stroke: '#7c3aed', strokeWidth: 3 },
  }));

  return { nodes, edges };
}

// Template 1: Basic Approval Flow
const basicApprovalFlow: WorkflowTemplate = {
  id: 'basic-approval',
  name: 'Basic Approval Flow',
  description: 'Start → Approval → End',
  icon: 'CheckCircle',
  nodes: [
    {
      type: 'start',
      position: { x: 250, y: 50 },
      data: { title: 'Start' },
    },
    {
      type: 'approval',
      position: { x: 220, y: 180 },
      data: { title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 },
    },
    {
      type: 'end',
      position: { x: 250, y: 320 },
      data: { title: 'Complete', endMessage: 'Workflow completed' },
    },
  ],
  edges: [
    { sourceIndex: 0, targetIndex: 1 },
    { sourceIndex: 1, targetIndex: 2 },
  ],
};

// Template 2: Task + Approval Pair
const taskApprovalPair: WorkflowTemplate = {
  id: 'task-approval-pair',
  name: 'Task + Approval Pair',
  description: 'Start → Task → Approval → End',
  icon: 'ClipboardList',
  nodes: [
    {
      type: 'start',
      position: { x: 250, y: 50 },
      data: { title: 'Start' },
    },
    {
      type: 'task',
      position: { x: 200, y: 160 },
      data: { title: 'Complete Form', description: 'Fill out the required form', assignee: '', dueDate: '' },
    },
    {
      type: 'approval',
      position: { x: 210, y: 320 },
      data: { title: 'Review', approverRole: 'Supervisor', autoApproveThreshold: 0 },
    },
    {
      type: 'end',
      position: { x: 250, y: 470 },
      data: { title: 'Done', endMessage: 'Process complete' },
    },
  ],
  edges: [
    { sourceIndex: 0, targetIndex: 1 },
    { sourceIndex: 1, targetIndex: 2 },
    { sourceIndex: 2, targetIndex: 3 },
  ],
};

// Template 3: Onboarding Workflow
const onboardingWorkflow: WorkflowTemplate = {
  id: 'onboarding',
  name: 'Employee Onboarding',
  description: 'Complete HR onboarding flow',
  icon: 'Users',
  nodes: [
    {
      type: 'start',
      position: { x: 250, y: 30 },
      data: { title: 'New Hire' },
    },
    {
      type: 'task',
      position: { x: 180, y: 130 },
      data: { title: 'Submit Documents', description: 'Upload ID and tax forms', assignee: 'New Employee', dueDate: '' },
    },
    {
      type: 'automated',
      position: { x: 190, y: 280 },
      data: { title: 'Create Accounts', actionId: 'create-accounts', actionParams: {} },
    },
    {
      type: 'approval',
      position: { x: 200, y: 420 },
      data: { title: 'HR Verification', approverRole: 'HR Manager', autoApproveThreshold: 0 },
    },
    {
      type: 'task',
      position: { x: 180, y: 560 },
      data: { title: 'Equipment Setup', description: 'Assign laptop and badge', assignee: 'IT Support', dueDate: '' },
    },
    {
      type: 'end',
      position: { x: 250, y: 700 },
      data: { title: 'Onboarded', endMessage: 'Welcome to the team!' },
    },
  ],
  edges: [
    { sourceIndex: 0, targetIndex: 1 },
    { sourceIndex: 1, targetIndex: 2 },
    { sourceIndex: 2, targetIndex: 3 },
    { sourceIndex: 3, targetIndex: 4 },
    { sourceIndex: 4, targetIndex: 5 },
  ],
};

// Template 4: Leave Request
const leaveRequest: WorkflowTemplate = {
  id: 'leave-request',
  name: 'Leave Request',
  description: 'Request → Approval → Notification',
  icon: 'Calendar',
  nodes: [
    {
      type: 'start',
      position: { x: 250, y: 50 },
      data: { title: 'Leave Request' },
    },
    {
      type: 'task',
      position: { x: 180, y: 150 },
      data: { title: 'Submit Request', description: 'Enter leave dates and reason', assignee: 'Employee', dueDate: '' },
    },
    {
      type: 'approval',
      position: { x: 200, y: 300 },
      data: { title: 'Manager Approval', approverRole: 'Direct Manager', autoApproveThreshold: 0 },
    },
    {
      type: 'automated',
      position: { x: 190, y: 450 },
      data: { title: 'Send Notification', actionId: 'send-email', actionParams: { template: 'leave-approved' } },
    },
    {
      type: 'end',
      position: { x: 250, y: 580 },
      data: { title: 'Approved', endMessage: 'Leave request approved' },
    },
  ],
  edges: [
    { sourceIndex: 0, targetIndex: 1 },
    { sourceIndex: 1, targetIndex: 2 },
    { sourceIndex: 2, targetIndex: 3 },
    { sourceIndex: 3, targetIndex: 4 },
  ],
};

// Export all templates
export const workflowTemplates: WorkflowTemplate[] = [
  basicApprovalFlow,
  taskApprovalPair,
  onboardingWorkflow,
  leaveRequest,
];
