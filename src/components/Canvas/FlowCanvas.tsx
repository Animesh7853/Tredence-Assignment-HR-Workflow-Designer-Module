// src/components/Canvas/FlowCanvas.tsx
import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  Background,
  ReactFlowProvider,
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange,
  MiniMap,
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflow } from '../../hooks/useWorkflow';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import ApprovalNode from './nodes/ApprovalNode';
import AutomatedNode from './nodes/AutomatedNode';
import EndNode from './nodes/EndNode';
import NodeFormContainer from './NodeForms/NodeFormContainer';

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode
};

/* Sidebar node card UI - Tailwind classes */
function NodeCard({ label, nodeType }: { label: string; nodeType: string }) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-white border border-gray-100 shadow-sm cursor-grab hover:translate-y-[-2px] transition-transform"
    >
      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-sm text-slate-700">●</div>
      <div className="font-medium text-slate-800">{label}</div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="px-1">
      <div className="text-sm font-semibold text-slate-800 mb-3">Nodes</div>
      <NodeCard label="Start" nodeType="start" />
      <NodeCard label="Task" nodeType="task" />
      <NodeCard label="Approval" nodeType="approval" />
      <NodeCard label="Automated" nodeType="automated" />
      <NodeCard label="End" nodeType="end" />
    </div>
  );
}

/* FlowCanvas */
function FlowCanvasInner() {
  const { nodes, edges, setNodes, setEdges, addNode, addEdge: addEdgeToStore } = useWorkflow();
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(curr => applyNodeChanges(changes, curr));
  }, [setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(curr => applyEdgeChanges(changes, curr));
  }, [setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    addEdgeToStore({
      ...connection,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#7c3aed', strokeWidth: 3 },
      id: connection.source && connection.target ? `e${connection.source}-${connection.target}` : undefined
    } as Edge);
  }, [addEdgeToStore]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowWrapper.current) return;
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = { x: event.clientX - bounds.left - 75, y: event.clientY - bounds.top - 20 };
    addNode(type as any, position);
  }, [addNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const defaultEdgeOptions = {
    animated: false,
    style: { stroke: '#7c3aed', strokeWidth: 3 },
    type: 'smoothstep' as const
  };

  return (
    <div className="flex h-[calc(100vh-32px)]">
      <div ref={reactFlowWrapper} className="flex-1">
        <div className="h-full rounded-md bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            onDrop={onDrop}
            onDragOver={onDragOver}
            style={{ width: '100%', height: '100%' }}
          >
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              nodeStrokeColor={(n) => {
                if ((n as Node).type === 'start') return '#16a34a';
                if ((n as Node).type === 'approval') return '#d97706';
                if ((n as Node).type === 'end') return '#ef4444';
                return '#64748b';
              }}
              position="bottom-left"
            />
            <Background color="#e6eef6" gap={18} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* in-canvas inspector panel on the right of canvas (optional), but App layout also has right column */}
      <div className="w-[340px] border-l border-gray-100 p-3 bg-transparent">
        <NodeFormContainer />
      </div>
    </div>
  );
}

export default function FlowCanvasComponent() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
(FlowCanvasComponent as any).SidebarPlaceholder = Sidebar;
