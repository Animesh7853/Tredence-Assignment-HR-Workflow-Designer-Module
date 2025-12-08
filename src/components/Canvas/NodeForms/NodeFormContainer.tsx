import React from 'react';
import { useWorkflowContext } from '../../../context/WorkflowContext';
import StartForm from './StartForm';
import TaskForm from './TaskForm';
import ApprovalForm from './ApprovalForm';
import AutomatedForm from './AutomatedForm';
import EndForm from './EndForm';

export default function NodeFormContainer() {
  const { nodes, setNodes } = useWorkflowContext();
  const selected = nodes.find(n => n.selected);

  if (!selected) {
    return <div>Select a node to edit</div>;
  }

  const node = selected;

  function update(dataPatch: any) {
    setNodes(curr => curr.map(n => (n.id === node.id ? { ...n, data: { ...n.data, ...dataPatch } } : n)));
  }

  switch (node.type) {
    case 'start':
      return <StartForm node={node} onChange={update} />;
    case 'task':
      return <TaskForm node={node} onChange={update} />;
    case 'approval':
      return <ApprovalForm node={node} onChange={update} />;
    case 'automated':
      return <AutomatedForm node={node} onChange={update} />;
    case 'end':
      return <EndForm node={node} onChange={update} />;
    default:
      return <div>Unknown node type</div>;
  }
}
