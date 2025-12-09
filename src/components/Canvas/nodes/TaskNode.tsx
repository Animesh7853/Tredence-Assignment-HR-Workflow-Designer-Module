// src/components/Canvas/nodes/TaskNode.tsx
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

type Props = NodeProps<any> & {
  removeNode?: (id: string) => void;
};

export default function TaskNode({ id, data, selected, removeNode }: Props) {
  return (
    <div className={`relative p-3 rounded-lg bg-white border border-gray-100 shadow-sm ${selected ? 'ring-4 ring-blue-100' : ''}`} style={{ width: 220 }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (removeNode) removeNode(id);
        }}
        title="Delete node"
        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-md hover:bg-red-600"
      >
        ×
      </button>

      <div className="flex justify-between items-start gap-3">
        <div className="font-semibold text-sm text-slate-900">{data.title || 'New Task'}</div>
        <div className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded">T</div>
      </div>

      <div className="mt-2 text-sm text-slate-600">
        {data.description || <span className="text-slate-400">No description</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="font-medium text-slate-700">{data.assignee || 'Unassigned'}</div>
        <div>{data.dueDate || ''}</div>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
