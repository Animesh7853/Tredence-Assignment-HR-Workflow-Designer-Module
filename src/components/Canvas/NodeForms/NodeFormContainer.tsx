// src/components/Canvas/NodeForms/NodeFormContainer.tsx
// Node configuration panel with version history support

import React, { useState } from 'react';
import { useWorkflowContext } from '../../../context/WorkflowContext';
import StartForm from './StartForm';
import TaskForm from './TaskForm';
import ApprovalForm from './ApprovalForm';
import AutomatedForm from './AutomatedForm';
import EndForm from './EndForm';
import HistoryModal, { VersionEntry } from '../HistoryModal';
import { useToast } from '../../Toast/ToastProvider';
import {
  Play,
  ClipboardList,
  CheckCircle,
  Zap,
  Flag,
  Trash2,
  History,
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
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

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
  const nodeHistory: VersionEntry[] = node.data?._history || [];

  // Update node data via context with version tracking
  function update(dataPatch: any, saveVersion: boolean = false) {
    setNodes((curr) =>
      curr.map((n) => {
        if (n.id !== node.id) return n;

        // If saving a version, compute changes and add to history
        if (saveVersion) {
          const changes: Record<string, { old: any; new: any }> = {};
          const currentData = n.data || {};
          
          Object.keys(dataPatch).forEach((key) => {
            if (key === '_history') return; // Skip history field
            if (currentData[key] !== dataPatch[key]) {
              changes[key] = { old: currentData[key], new: dataPatch[key] };
            }
          });

          // Only add to history if there are actual changes
          if (Object.keys(changes).length > 0) {
            const newHistoryEntry: VersionEntry = {
              timestamp: new Date().toISOString(),
              changes,
            };
            const existingHistory = currentData._history || [];
            dataPatch = {
              ...dataPatch,
              _history: [newHistoryEntry, ...existingHistory].slice(0, 50), // Keep last 50 versions
            };
          }
        }

        return { ...n, data: { ...n.data, ...dataPatch } };
      })
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
      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        nodeTitle={node.data?.title || getTypeLabel(node.type as string)}
        history={nodeHistory}
      />

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
              <div className="text-base font-semibold text-slate-900 truncate max-w-[140px]">
                {node.data?.title || getTypeLabel(node.type as string)}
              </div>
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* History button */}
            <button
              onClick={() => setHistoryModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              aria-label="View history"
              title="View version history"
            >
              <History size={14} />
              {nodeHistory.length > 0 && (
                <span className="text-xs bg-violet-500 text-white px-1.5 rounded-full">
                  {nodeHistory.length}
                </span>
              )}
            </button>
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              aria-label="Delete node"
            >
              <Trash2 size={14} />
            </button>
          </div>
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
