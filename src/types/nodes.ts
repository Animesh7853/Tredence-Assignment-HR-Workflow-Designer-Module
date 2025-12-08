export type KV = { key: string; value: string };

export type BaseNodeData = {
  title?: string;
  metadata?: Record<string, string>;
};

export type StartNodeData = BaseNodeData & {
  title: string;
};

export type TaskNodeData = BaseNodeData & {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  customFields?: KV[];
};

export type ApprovalNodeData = BaseNodeData & {
  title: string;
  approverRole?: string;
  autoApproveThreshold?: number;
};

export type AutomatedNodeData = BaseNodeData & {
  title: string;
  actionId?: string;
  actionParams?: Record<string, string>;
};

export type EndNodeData = BaseNodeData & {
  endMessage?: string;
  summary?: boolean;
};

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export type WorkflowNode = {
  id: string;
  type: 'start' | 'task' | 'approval' | 'automated' | 'end';
  position: { x: number; y: number };
  data: WorkflowNodeData;
};
