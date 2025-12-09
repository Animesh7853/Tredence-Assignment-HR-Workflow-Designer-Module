// src/components/Canvas/NodeForms/TaskForm.tsx
import React from 'react';
import type { Node } from 'reactflow';

export default function TaskForm({ node, onChange }: { node: Node<any>; onChange: (patch: any) => void }) {
  return (
    <div>
      <div>
        <label className="text-sm font-medium">Title</label>
        <input className="mt-1" value={node.data.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea className="mt-1" value={node.data.description || ''} onChange={(e) => onChange({ description: e.target.value })} />
      </div>

      <div>
        <label className="text-sm font-medium">Assignee</label>
        <input className="mt-1" value={node.data.assignee || ''} onChange={(e) => onChange({ assignee: e.target.value })} />
      </div>

      <div>
        <label className="text-sm font-medium">Due Date</label>
        <input type="date" className="mt-1" value={node.data.dueDate || ''} onChange={(e) => onChange({ dueDate: e.target.value })} />
      </div>
    </div>
  );
}
