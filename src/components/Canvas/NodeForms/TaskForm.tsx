import React from 'react';
import type { Node } from 'reactflow';

export default function TaskForm({ node, onChange }: { node: Node<any>; onChange: (patch: any) => void }) {
  return (
    <div>
      <h4>Task Node</h4>
      <div>
        <label>Title</label>
        <input value={node.data.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div>
        <label>Description</label>
        <textarea value={node.data.description || ''} onChange={(e) => onChange({ description: e.target.value })} />
      </div>
      <div>
        <label>Assignee</label>
        <input value={node.data.assignee || ''} onChange={(e) => onChange({ assignee: e.target.value })} />
      </div>
      <div>
        <label>Due Date</label>
        <input value={node.data.dueDate || ''} onChange={(e) => onChange({ dueDate: e.target.value })} />
      </div>
    </div>
  );
}
