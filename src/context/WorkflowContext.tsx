import React, { createContext, useContext, useState, useCallback } from 'react';
import type { WorkflowNode } from '../types/nodes';
import type { Edge, Node } from 'reactflow';

type WorkflowContextValue = {
  nodes: Node<any>[];
  edges: Edge[];
  setNodes: (fn: React.SetStateAction<Node<any>[]>) => void;
  setEdges: (fn: React.SetStateAction<Edge[]>) => void;
  removeNode: (nodeId: string) => void;
};

const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodesState] = useState<Node<any>[]>([]);
  const [edges, setEdgesState] = useState<Edge[]>([]);

  const setNodes = (fn: React.SetStateAction<Node<any>[]>) => {
    setNodesState((prev) => (typeof fn === 'function' ? fn(prev) : fn));
  };
  const setEdges = (fn: React.SetStateAction<Edge[]>) => {
    setEdgesState((prev) => (typeof fn === 'function' ? fn(prev) : fn));
  };

  const removeNode = useCallback((nodeId: string) => {
    setNodesState((prev) => prev.filter((n) => n.id !== nodeId));
    setEdgesState((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, []);

  return (
    <WorkflowContext.Provider value={{ nodes, edges, setNodes, setEdges, removeNode }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export function useWorkflowContext() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflowContext must be used inside WorkflowProvider');
  return ctx;
}
