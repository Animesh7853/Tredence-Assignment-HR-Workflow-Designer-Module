// src/components/Canvas/nodes/EndNode.tsx
// End node with icon, hover elevation, and validation indicator

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Flag, AlertTriangle } from 'lucide-react';
import { useValidation } from '../FlowCanvas';

export default function EndNode({ id, data, selected }: NodeProps<any>) {
  const validationResults = useValidation();
  const validation = validationResults[id];
  const hasError = validation && !validation.valid;

  return (
    <div
      className={`
        relative p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-100
        border-2 transition-all duration-200 cursor-pointer
        hover:-translate-y-0.5 hover:shadow-lg
        ${hasError ? 'border-red-400 ring-2 ring-red-100' : selected ? 'border-red-500 shadow-lg ring-4 ring-red-100' : 'border-red-200 shadow-md'}
      `}
      style={{ width: 200, minHeight: 80 }}
      role="button"
      aria-label={`End node: ${data.title || 'End'}`}
    >
      {/* Validation warning icon */}
      {hasError && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md"
          title={validation.message}
        >
          <AlertTriangle size={12} className="text-white" />
        </div>
      )}

      {/* Header with icon and title */}
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
          <Flag size={18} className="text-white" fill="white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-base text-red-900 truncate">
            {data.title || 'End'}
          </div>
          <div className="text-xs text-red-600">Workflow Exit</div>
        </div>
      </div>

      {/* End message if present */}
      {data.endMessage && (
        <div className="mt-2 text-xs text-red-700 line-clamp-2 italic">
          "{data.endMessage}"
        </div>
      )}

      {/* Target handle (top only - no source for end) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}
