// src/components/Canvas/nodes/StartNode.tsx
// Start node with icon, hover elevation, and validation indicator

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Play, AlertTriangle } from 'lucide-react';
import { useValidation } from '../FlowCanvas';

export default function StartNode({ id, data, selected }: NodeProps<any>) {
  const validationResults = useValidation();
  const validation = validationResults[id];
  const hasError = validation && !validation.valid;

  return (
    <div
      className={`
        relative p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100
        border-2 transition-all duration-200 cursor-pointer
        hover:-translate-y-0.5 hover:shadow-lg
        ${hasError ? 'border-red-400 ring-2 ring-red-100' : selected ? 'border-emerald-500 shadow-lg ring-4 ring-emerald-100' : 'border-emerald-200 shadow-md'}
      `}
      style={{ width: 200, minHeight: 80 }}
      role="button"
      aria-label={`Start node: ${data.title || 'Start'}`}
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
        <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Play size={18} className="text-white" fill="white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-base text-emerald-900 truncate">
            {data.title || 'Start'}
          </div>
          <div className="text-xs text-emerald-600">Workflow Entry</div>
        </div>
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}
