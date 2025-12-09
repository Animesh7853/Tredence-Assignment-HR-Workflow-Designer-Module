// src/components/Canvas/nodes/AutomatedNode.tsx
// Automated node with icon, hover elevation, action badge, and improved layout

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Settings } from 'lucide-react';

export default function AutomatedNode({ data, selected }: NodeProps<any>) {
  return (
    <div
      className={`
        relative p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100
        border-2 transition-all duration-200 cursor-pointer
        hover:-translate-y-0.5 hover:shadow-lg
        ${selected ? 'border-sky-500 shadow-lg ring-4 ring-sky-100' : 'border-sky-200 shadow-md'}
      `}
      style={{ width: 220, minHeight: 100 }}
      role="button"
      aria-label={`Automated node: ${data.title || 'Automated'}`}
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3">
        {/* Icon container */}
        <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-base text-sky-900 truncate">
            {data.title || 'Automated'}
          </div>
          <div className="text-xs text-sky-600">Automation Step</div>
        </div>
      </div>

      {/* Footer with action badge */}
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-200 text-xs text-sky-800">
          <Settings size={10} />
          <span className="truncate max-w-[120px]">
            {data.actionId || 'No action selected'}
          </span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-sky-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}
