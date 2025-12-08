import React from 'react';
import type { Node } from 'reactflow';

export default function ApprovalForm({ node, onChange }: { node: Node<any>; onChange: (patch: any) => void }) {
  return (
    <div>
      <h4>Approval Node</h4>
      <div>
        <label>Title</label>
        <input value={node.data.title || ''} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div>
        <label>Approver Role</label>
        <input value={node.data.approverRole || ''} onChange={(e) => onChange({ approverRole: e.target.value })} />
      </div>
      <div>
        <label>Auto-approve threshold</label>
        <input type="number" value={node.data.autoApproveThreshold ?? 0} onChange={(e) => onChange({ autoApproveThreshold: Number(e.target.value) })} />
      </div>
    </div>
  );
}
