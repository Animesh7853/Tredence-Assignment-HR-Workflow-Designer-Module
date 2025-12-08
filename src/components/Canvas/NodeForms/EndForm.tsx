import React from 'react';
import type { Node } from 'reactflow';

export default function EndForm({ node, onChange }: { node: Node<any>; onChange: (patch: any) => void }) {
  return (
    <div>
      <h4>End Node</h4>
      <div>
        <label>End message</label>
        <input value={node.data.endMessage || ''} onChange={(e) => onChange({ endMessage: e.target.value })} />
      </div>
      <div>
        <label>
          <input type="checkbox" checked={!!node.data.summary} onChange={(e) => onChange({ summary: e.target.checked })} />
          Show summary
        </label>
      </div>
    </div>
  );
}
