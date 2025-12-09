// src/components/Canvas/NodeForms/NodeFormContainer.tsx
// Improved node configuration panel with sticky header, clean layout, and delete button

import React from 'react';
import { useWorkflowContext } from '../../../context/WorkflowContext';
import StartForm from './StartForm';
import TaskForm from './TaskForm';
import ApprovalForm from './ApprovalForm';
import AutomatedForm from './AutomatedForm';
import EndForm from './EndForm';
import { useToast } from '../../Toast/ToastProvider';
import {
  Play,
  ClipboardList,
  CheckCircle,
  Zap,
  Flag,
  Trash2,
} from 'lucide-react';

// Helper to get icon for node type
function getNodeIcon(type: string) {
  switch (type) {
    case 'start':
      return <Play size={16} className="text-emerald-600" />;
    case 'task':
      return <ClipboardList size={16} className="text-blue-600" />;
    case 'approval':
      return <CheckCircle size={16} className="text-amber-600" />;
    case 'automated':
      return <Zap size={16} className="text-sky-600" />;
    case 'end':
      return <Flag size={16} className="text-red-600" />;
    default:
      return null;
  }
}

// Helper to get type label
function getTypeLabel(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function NodeFormContainer() {
  const { nodes, setNodes, removeNode } = useWorkflowContext();
  const toast = useToast();
  const selected = nodes.find((n) => (n as any).selected);

  // Empty state when no node selected
  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <ClipboardList size={24} className="text-slate-400" />
        </div>
        <div className="text-sm font-medium text-slate-600">No Node Selected</div>
        <div className="text-xs text-slate-400 mt-1">
          Click on a node in the canvas to edit its properties
        </div>
      </div>
    );
  }

  const node = selected;

  // Update node data via context
  function update(dataPatch: any) {
    setNodes((curr) =>
      curr.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, ...dataPatch } } : n
      )
    );
  }

  // Delete node with confirmation
  async function handleDelete() {
    const ok = window.confirm(
      'Delete this node? This will also remove connected edges.'
    );
    if (!ok) return;
    removeNode(node.id);
    toast.success('Node deleted');
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Node type icon */}
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              {getNodeIcon(node.type as string)}
            </div>
            <div>
              <div className="text-xs text-slate-500">
                Editing: {getTypeLabel(node.type as string)}
              </div>
              <div className="text-base font-semibold text-slate-900 truncate max-w-[180px]">
                {node.data?.title || getTypeLabel(node.type as string)}
              </div>
            </div>
          </div>
          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            aria-label="Delete node"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          {node.type === 'start' && <StartForm node={node} onChange={update} />}
          {node.type === 'task' && <TaskForm node={node} onChange={update} />}
          {node.type === 'approval' && <ApprovalForm node={node} onChange={update} />}
          {node.type === 'automated' && <AutomatedForm node={node} onChange={update} />}
          {node.type === 'end' && <EndForm node={node} onChange={update} />}
        </div>
      </div>
    </div>
  );
}
