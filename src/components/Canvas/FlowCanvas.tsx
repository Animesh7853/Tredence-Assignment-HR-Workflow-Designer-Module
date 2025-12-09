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
  ConnectionLineType,
  OnNodesChange,
  OnEdgesChange,
  useReactFlow,
  ControlButton,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflow } from '../../hooks/useWorkflow';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import ApprovalNode from './nodes/ApprovalNode';
import AutomatedNode from './nodes/AutomatedNode';
import EndNode from './nodes/EndNode';
import NodeFormContainer from './NodeForms/NodeFormContainer';
import {
  Play,
  ClipboardList,
  CheckCircle,
  Zap,
  Flag,
  Maximize,
} from 'lucide-react';

// Wrap component to inject removeNode/removeEdge props
const wrap = (Component: React.ComponentType<any>, removeNode: (id: string) => void, removeEdge: (id: string) => void) =>
  (props: any) => <Component {...props} removeNode={removeNode} removeEdge={removeEdge} />;

// Helper to get icon for node type in sidebar
function getNodeIcon(type: string) {
  const iconProps = { size: 16, className: 'text-slate-600' };
  switch (type) {
    case 'start':
      return <Play {...iconProps} className="text-emerald-600" />;
    case 'task':
      return <ClipboardList {...iconProps} className="text-blue-600" />;
    case 'approval':
      return <CheckCircle {...iconProps} className="text-amber-600" />;
    case 'automated':
      return <Zap {...iconProps} className="text-sky-600" />;
    case 'end':
      return <Flag {...iconProps} className="text-red-600" />;
    default:
      return null;
  }
}

// Draggable node card for sidebar
function NodeCard({ label, nodeType }: { label: string; nodeType: string }) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-white border border-gray-100 shadow-sm cursor-grab hover:shadow-md hover:border-gray-200 transition-all"
      role="button"
      aria-label={`Drag to add ${label} node`}
    >
      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
        {getNodeIcon(nodeType)}
      </div>
      <div className="font-medium text-slate-800">{label}</div>
    </div>
  );
}

// Sidebar component with node palette
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

// Main export with ReactFlowProvider wrapper
export default function FlowCanvasComponent() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}

// Inner component that uses ReactFlow hooks
function FlowCanvasInner() {
  const { nodes, edges, setNodes, setEdges, addNode, addEdge, removeNode, removeEdge } = useWorkflow();
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { fitView } = useReactFlow();

  // Define node types with injected handlers
  const nodeTypes = {
    start: wrap(StartNode, removeNode, removeEdge),
    task: wrap(TaskNode, removeNode, removeEdge),
    approval: wrap(ApprovalNode, removeNode, removeEdge),
    automated: wrap(AutomatedNode, removeNode, removeEdge),
    end: wrap(EndNode, removeNode, removeEdge),
  };

  // Handle node position/selection changes
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((curr) => applyNodeChanges(changes, curr));
    },
    [setNodes]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((curr) => applyEdgeChanges(changes, curr));
    },
    [setEdges]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      addEdge({
        ...connection,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#7c3aed', strokeWidth: 3 },
        id: connection.source && connection.target ? `e${connection.source}-${connection.target}` : undefined,
      } as Edge);
    },
    [addEdge]
  );

  // Handle drop from sidebar
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = { x: event.clientX - bounds.left - 75, y: event.clientY - bounds.top - 20 };
      addNode(type as any, position);
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Update node position after drag
  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      setNodes((curr) => curr.map((n) => (n.id === node.id ? { ...n, position: node.position } : n)));
    },
    [setNodes]
  );

  // Default edge styling
  const defaultEdgeOptions = {
    animated: false,
    style: { stroke: '#7c3aed', strokeWidth: 3 },
    type: 'smoothstep' as const,
  };

  // Fit view handler for custom button
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  return (
    <div className="flex h-[calc(100vh-32px)]">
      {/* Canvas area */}
      <div ref={reactFlowWrapper} className="flex-1">
        <div className="h-full rounded-md bg-white">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionRadius={24}
            fitView
            proOptions={{ hideAttribution: true }}
            panOnScroll={true}
            panOnScrollSpeed={0.3}
            zoomOnScroll={false}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            minZoom={0.2}
            maxZoom={2}
            onDrop={onDrop}
            onDragOver={onDragOver}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Controls with custom Fit button */}
            <Controls position="bottom-left" showInteractive={false}>
              <ControlButton
                onClick={handleFitView}
                title="Fit view"
                aria-label="Fit all nodes in view"
              >
                <Maximize size={16} />
              </ControlButton>
            </Controls>

            {/* MiniMap for navigation */}
            <MiniMap
              nodeStrokeColor={(n) => {
                if ((n as Node).type === 'start') return '#16a34a';
                if ((n as Node).type === 'approval') return '#d97706';
                if ((n as Node).type === 'end') return '#ef4444';
                return '#64748b';
              }}
              position="bottom-left"
              style={{ marginBottom: 50 }}
            />

            {/* Background grid */}
            <Background color="#e6eef6" gap={18} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Right panel - node configuration */}
      <div className="w-[340px] border-l border-gray-100 p-4 bg-slate-50 overflow-hidden">
        <NodeFormContainer />
      </div>
    </div>
  );
}

// Attach sidebar for external use
(FlowCanvasComponent as any).SidebarPlaceholder = Sidebar;
