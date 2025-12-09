// src/components/Canvas/nodes/ApprovalNode.tsx
// Approval node with icon, hover elevation, approver role badge, and validation indicator

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { useValidation } from '../FlowCanvas';

export default function ApprovalNode({ id, data, selected }: NodeProps<any>) {
  const validationResults = useValidation();
  const validation = validationResults[id];
  const hasError = validation && !validation.valid;

  return (
    <div
      className={`
        relative p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100
        border-2 transition-all duration-200 cursor-pointer
        hover:-translate-y-0.5 hover:shadow-lg
        ${hasError ? 'border-red-400 ring-2 ring-red-100' : selected ? 'border-amber-500 shadow-lg ring-4 ring-amber-100' : 'border-amber-200 shadow-md'}
      `}
      style={{ width: 220, minHeight: 100 }}
      role="button"
      aria-label={`Approval node: ${data.title || 'Approval'}`}
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
      <div className="flex items-start gap-3">
        {/* Icon container */}
        <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={18} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-base text-amber-900 truncate">
            {data.title || 'Approval'}
          </div>
          <div className="text-xs text-amber-600">Approval Gate</div>
        </div>
      </div>

      {/* Footer with approver badge */}
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-200 text-xs text-amber-800">
          <UserCheck size={10} />
          <span className="truncate max-w-[120px]">{data.approverRole || 'Approver'}</span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}
