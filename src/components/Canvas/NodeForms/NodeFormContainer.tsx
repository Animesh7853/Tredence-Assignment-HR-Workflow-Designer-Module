// src/components/Canvas/NodeForms/NodeFormContainer.tsx
import React from 'react';
import { useWorkflowContext } from '../../../context/WorkflowContext';
import StartForm from './StartForm';
import TaskForm from './TaskForm';
import ApprovalForm from './ApprovalForm';
import AutomatedForm from './AutomatedForm';
import EndForm from './EndForm';
import { useToast } from '../../Toast/ToastProvider';

export default function NodeFormContainer() {
  const { nodes, setNodes, removeNode } = useWorkflowContext();
  const toast = useToast();
  const selected = nodes.find(n => (n as any).selected);

  if (!selected) {
    return <div className="text-sm text-slate-500">Select a node to edit</div>;
  }

  const node = selected;

  function update(dataPatch: any) {
    setNodes(curr => curr.map(n => (n.id === node.id ? { ...n, data: { ...n.data, ...dataPatch } } : n)));
  }

  async function handleDelete() {
    const ok = window.confirm('Delete this node? This will also remove connected edges.');
    if (!ok) return;
    removeNode(node.id);
    toast.success('Node deleted');
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Editing: {node.type}</div>
          <div className="text-lg font-semibold">{node.data?.title || node.type}</div>
        </div>
        <div>
          <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete Node</button>
        </div>
      </div>

      <div className="space-y-4">
        {node.type === 'start' && <StartForm node={node} onChange={update} />}
        {node.type === 'task' && <TaskForm node={node} onChange={update} />}
        {node.type === 'approval' && <ApprovalForm node={node} onChange={update} />}
        {node.type === 'automated' && <AutomatedForm node={node} onChange={update} />}
        {node.type === 'end' && <EndForm node={node} onChange={update} />}
      </div>
    </div>
  );
}
