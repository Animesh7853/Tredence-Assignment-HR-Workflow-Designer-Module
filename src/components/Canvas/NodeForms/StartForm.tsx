import React from 'react';
import type { Node } from 'reactflow';

export default function StartForm({ node, onChange }: { node: Node<any>; onChange: (patch: any) => void }) {
  return (
    <div>
      <h4>Start Node</h4>
      <div style={{ marginBottom: 8 }}>
        <label>Title</label>
        <input value={node.data.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
    </div>
  );
}
