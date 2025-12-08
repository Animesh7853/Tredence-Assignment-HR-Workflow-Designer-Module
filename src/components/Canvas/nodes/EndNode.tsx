import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function EndNode({ data, selected }: NodeProps<any>) {
  return (
    <div style={{ padding: 10, borderRadius: 6, background: '#FEE2E2', border: selected ? '2px solid #B91C1C' : '1px solid #fecaca' }}>
      <div style={{ fontWeight: 700 }}>{data.title || 'End'}</div>
      <div style={{ fontSize: 12 }}>{data.endMessage || ''}</div>
      <Handle type="target" position={Position.Top} />
    </div>
  );
}
