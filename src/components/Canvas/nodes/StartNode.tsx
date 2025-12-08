import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export default function StartNode({ data, selected }: NodeProps<any>) {
  return (
    <div style={{ padding: 10, borderRadius: 6, background: '#D1FAE5', border: selected ? '2px solid #16A34A' : '1px solid #a7f3d0' }}>
      <div style={{ fontWeight: 700 }}>{data.title || 'Start'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
