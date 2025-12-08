import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function ApprovalNode({ data, selected }: NodeProps<any>) {
  return (
    <div style={{ padding: 10, borderRadius: 6, background: '#FEF3C7', border: selected ? '2px solid #D97706' : '1px solid #fde68a' }}>
      <div style={{ fontWeight: 700 }}>{data.title || 'Approval'}</div>
      <div style={{ fontSize: 12, color: '#92400e' }}>{data.approverRole || 'Approver'}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
