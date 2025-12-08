import { useCallback } from 'react';
import { useWorkflowContext } from '../context/WorkflowContext';
import { nanoid } from 'nanoid';
import type { Node, Edge } from 'reactflow';

export function useWorkflow() {
  const { nodes, edges, setNodes, setEdges } = useWorkflowContext();

  const addNode = useCallback((type: Node['type'], position = { x: 50, y: 50 }) => {
    const id = nanoid();
    const defaultData = (() => {
      if (type === 'start') return { title: 'Start' };
      if (type === 'task') return { title: 'New Task', assignee: '', description: '' };
      if (type === 'approval') return { title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 };
      if (type === 'automated') return { title: 'Automated Step', actionId: '', actionParams: {} };
      if (type === 'end') return { title: 'End', endMessage: '' };
      return {};
    })();

    setNodes(curr => [
      ...curr,
      {
        id,
        type,
        position,
        data: defaultData
      } as Node<any>
    ]);
    return id;
  }, [setNodes]);

  const updateNodeData = useCallback((id: string, dataPatch: Partial<any>) => {
    setNodes(curr => curr.map(n => (n.id === id ? { ...n, data: { ...n.data, ...dataPatch } } : n)));
  }, [setNodes]);

  const removeNode = useCallback((id: string) => {
    setNodes(curr => curr.filter(n => n.id !== id));
    setEdges(curr => curr.filter(e => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const addEdge = useCallback((edge: Edge) => {
    setEdges(curr => [...curr, { ...edge, id: edge.id || nanoid() }]);
  }, [setEdges]);

  const removeEdge = useCallback((id: string) => {
    setEdges(curr => curr.filter(e => e.id !== id));
  }, [setEdges]);

  return { nodes, edges, addNode, updateNodeData, removeNode, addEdge, removeEdge, setNodes, setEdges };
}
