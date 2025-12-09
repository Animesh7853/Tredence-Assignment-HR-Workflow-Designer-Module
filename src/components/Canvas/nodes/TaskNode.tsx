// src/components/Canvas/nodes/TaskNode.tsx
// Task node with icon, hover elevation, metadata badges, and improved layout

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ClipboardList, User, Calendar } from 'lucide-react';

export default function TaskNode({ data, selected }: NodeProps<any>) {
  return (
    <div
      className={`
        relative p-4 rounded-xl bg-white
        border-2 transition-all duration-200 cursor-pointer
        hover:-translate-y-0.5 hover:shadow-lg
        ${selected ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' : 'border-gray-200 shadow-md'}
      `}
      style={{ width: 240, minHeight: 120 }}
      role="button"
      aria-label={`Task node: ${data.title || 'New Task'}`}
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3">
        {/* Icon container */}
        <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
          <ClipboardList size={18} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-base text-slate-900 truncate">
            {data.title || 'New Task'}
          </div>
          <div className="text-xs text-slate-500">Task</div>
        </div>
      </div>

      {/* Description - truncated to 2 lines */}
      <div className="mt-2 text-sm text-slate-600 line-clamp-2">
        {data.description || <span className="text-slate-400 italic">No description</span>}
      </div>

      {/* Footer with metadata badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        {/* Assignee badge */}
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-700">
          <User size={10} />
          <span className="truncate max-w-[80px]">{data.assignee || 'Unassigned'}</span>
        </div>
        {/* Due date badge */}
        {data.dueDate && (
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-xs text-amber-700">
            <Calendar size={10} />
            <span>{data.dueDate}</span>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}
