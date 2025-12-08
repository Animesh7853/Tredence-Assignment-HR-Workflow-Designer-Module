import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function AutomatedNode({ data, selected }: NodeProps<any>) {
  return (
    <div style={{ padding: 10, borderRadius: 6, background: '#E0F2FE', border: selected ? '2px solid #0369A1' : '1px solid #bae6fd' }}>
      <div style={{ fontWeight: 700 }}>{data.title || 'Automated'}</div>
      <div style={{ fontSize: 12 }}>{data.actionId ? `Action: ${data.actionId}` : 'No action selected'}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
