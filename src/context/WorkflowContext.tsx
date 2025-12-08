import React, { createContext, useContext, useState } from 'react';
import type { WorkflowNode } from '../types/nodes';
import type { Edge, Node } from 'reactflow';

type WorkflowContextValue = {
  nodes: Node<any>[];
  edges: Edge[];
  setNodes: (fn: React.SetStateAction<Node<any>[]>) => void;
  setEdges: (fn: React.SetStateAction<Edge[]>) => void;
};

const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodesState] = useState<Node<any>[]>([]);
  const [edges, setEdgesState] = useState<Edge[]>([]);

  const setNodes = (fn: React.SetStateAction<Node<any>[]>) => {
    setNodesState(typeof fn === 'function' ? fn(nodes) : fn);
  };
  const setEdges = (fn: React.SetStateAction<Edge[]>) => {
    setEdgesState(typeof fn === 'function' ? fn(edges) : fn);
  };

  return (
    <WorkflowContext.Provider value={{ nodes, edges, setNodes, setEdges }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export function useWorkflowContext() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflowContext must be used inside WorkflowProvider');
  return ctx;
}
