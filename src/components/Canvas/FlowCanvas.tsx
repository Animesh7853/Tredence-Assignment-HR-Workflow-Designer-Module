// src/components/Canvas/FlowCanvas.tsx
// Flow canvas with export/import, undo/redo, auto-layout, templates, and validation

import React, { useCallback, useRef, useEffect, useMemo, createContext, useContext } from 'react';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  Background,
  ReactFlowProvider,
  Node,
  Edge,
  Connection,
  ConnectionLineType,
  OnNodesChange,
  OnEdgesChange,
  useReactFlow,
  ControlButton,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflow } from '../../hooks/useWorkflow';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import StartNode from './nodes/StartNode';
import TaskNode from './nodes/TaskNode';
import ApprovalNode from './nodes/ApprovalNode';
import AutomatedNode from './nodes/AutomatedNode';
import EndNode from './nodes/EndNode';
import NodeFormContainer from './NodeForms/NodeFormContainer';
import { useToast } from '../Toast/ToastProvider';
import { workflowTemplates, instantiateTemplate, WorkflowTemplate } from '../../utils/templates';
import { validateWorkflow, ValidationResults } from '../../utils/validateWorkflow';
import { applyAutoLayout } from '../../utils/autoLayout';
import { exportWorkflowToJSON, parseWorkflowFromFile } from '../../utils/workflowIO';
import {
  Play,
  ClipboardList,
  CheckCircle,
  Zap,
  Flag,
  Maximize,
  Download,
  Upload,
  Undo2,
  Redo2,
  LayoutGrid,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';

// Validation context to pass to nodes
const ValidationContext = createContext<ValidationResults>({});
export const useValidation = () => useContext(ValidationContext);

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

// Helper to get template icon
function getTemplateIcon(iconName: string) {
  const iconProps = { size: 16 };
  switch (iconName) {
    case 'CheckCircle':
      return <CheckCircle2 {...iconProps} className="text-amber-600" />;
    case 'ClipboardList':
      return <ClipboardList {...iconProps} className="text-blue-600" />;
    case 'Users':
      return <Users {...iconProps} className="text-violet-600" />;
    case 'Calendar':
      return <Calendar {...iconProps} className="text-green-600" />;
    default:
      return <ClipboardList {...iconProps} className="text-slate-600" />;
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

// Template card for sidebar
type TemplateCardProps = {
  template: WorkflowTemplate;
  onApply: () => void;
};

function TemplateCard({ template, onApply }: TemplateCardProps) {
  return (
    <div
      onClick={onApply}
      className="flex items-start gap-3 p-3 mb-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 cursor-pointer hover:shadow-md hover:border-violet-200 transition-all"
      role="button"
      aria-label={`Apply ${template.name} template`}
    >
      <div className="w-8 h-8 rounded-md bg-violet-100 flex items-center justify-center flex-shrink-0">
        {getTemplateIcon(template.icon)}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-slate-800 text-sm">{template.name}</div>
        <div className="text-xs text-slate-500 truncate">{template.description}</div>
      </div>
    </div>
  );
}

// Sidebar component with node palette and templates
type SidebarProps = {
  onApplyTemplate?: (template: WorkflowTemplate) => void;
};

function Sidebar({ onApplyTemplate }: SidebarProps) {
  const handleApply = (template: WorkflowTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    } else {
      // Dispatch custom event for external use
      window.dispatchEvent(new CustomEvent('apply-template', { detail: template }));
    }
  };

  return (
    <div className="px-1">
      {/* Node Palette */}
      <div className="text-sm font-semibold text-slate-800 mb-3">Nodes</div>
      <NodeCard label="Start" nodeType="start" />
      <NodeCard label="Task" nodeType="task" />
      <NodeCard label="Approval" nodeType="approval" />
      <NodeCard label="Automated" nodeType="automated" />
      <NodeCard label="End" nodeType="end" />

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Templates Section */}
      <div className="text-sm font-semibold text-slate-800 mb-3">Templates</div>
      {workflowTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onApply={() => handleApply(template)}
        />
      ))}
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { fitView, zoomTo } = useReactFlow();
  const toast = useToast();

  // Undo/Redo hook
  const { canUndo, canRedo, takeSnapshot, updateCurrentState, undo, redo } = useUndoRedo();

  // Keep undo/redo state in sync
  useEffect(() => {
    updateCurrentState(nodes, edges);
  }, [nodes, edges, updateCurrentState]);

  // Listen for template events from sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const template = (e as CustomEvent).detail as WorkflowTemplate;
      handleApplyTemplate(template);
    };
    window.addEventListener('apply-template', handler);
    return () => window.removeEventListener('apply-template', handler);
  }, [nodes, edges]);

  // Compute validation results for all nodes
  const validationResults = useMemo(() => {
    return validateWorkflow(nodes, edges);
  }, [nodes, edges]);

  // Define node types
  const nodeTypes = useMemo(
    () => ({
      start: StartNode,
      task: TaskNode,
      approval: ApprovalNode,
      automated: AutomatedNode,
      end: EndNode,
    }),
    []
  );

  // Handle node position/selection changes
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const significantChange = changes.some((c) => c.type === 'remove' || c.type === 'add');
      if (significantChange) {
        takeSnapshot();
      }
      setNodes((curr) => applyNodeChanges(changes, curr));
    },
    [setNodes, takeSnapshot]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const significantChange = changes.some((c) => c.type === 'remove' || c.type === 'add');
      if (significantChange) {
        takeSnapshot();
      }
      setEdges((curr) => applyEdgeChanges(changes, curr));
    },
    [setEdges, takeSnapshot]
  );

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot();
      addEdge({
        ...connection,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#7c3aed', strokeWidth: 3 },
        id: connection.source && connection.target ? `e${connection.source}-${connection.target}` : undefined,
      } as Edge);
    },
    [addEdge, takeSnapshot]
  );

  // Handle drop from sidebar
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      takeSnapshot();
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = { x: event.clientX - bounds.left - 75, y: event.clientY - bounds.top - 20 };
      addNode(type as any, position);
    },
    [addNode, takeSnapshot]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Snapshot before drag
  const onNodeDragStart = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

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

  // ============ TOOLBAR ACTIONS ============

  // Fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  // Reset zoom to 100%
  const handleResetZoom = useCallback(() => {
    zoomTo(1, { duration: 300 });
  }, [zoomTo]);

  // Undo
  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast.info('Undo');
    }
  }, [undo, setNodes, setEdges, toast]);

  // Redo
  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      toast.info('Redo');
    }
  }, [redo, setNodes, setEdges, toast]);

  // Export workflow
  const handleExport = useCallback(() => {
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      exportWorkflowToJSON(nodes, edges, `workflow-${timestamp}`);
      toast.success('Workflow exported successfully');
    } catch (error) {
      toast.error('Failed to export workflow');
    }
  }, [nodes, edges, toast]);

  // Import workflow
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        takeSnapshot();
        const workflowData = await parseWorkflowFromFile(file);
        setNodes(workflowData.nodes);
        setEdges(workflowData.edges);
        toast.success(`Imported ${workflowData.nodes.length} nodes and ${workflowData.edges.length} edges`);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
      } catch (error: any) {
        toast.error(error.message || 'Failed to import workflow');
      }

      // Reset input
      event.target.value = '';
    },
    [takeSnapshot, setNodes, setEdges, toast, fitView]
  );

  // Auto-layout
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) {
      toast.info('No nodes to layout');
      return;
    }
    takeSnapshot();
    const layoutedNodes = applyAutoLayout(nodes, edges, { direction: 'TB' });
    setNodes(layoutedNodes);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
    toast.success('Auto-layout applied');
  }, [nodes, edges, setNodes, takeSnapshot, fitView, toast]);

  // Apply template
  const handleApplyTemplate = useCallback(
    (template: WorkflowTemplate) => {
      takeSnapshot();
      const { nodes: templateNodes, edges: templateEdges } = instantiateTemplate(template);

      // Add offset if there are existing nodes
      const offsetX = nodes.length > 0 ? 400 : 0;
      const offsetNodes = templateNodes.map((n) => ({
        ...n,
        position: { x: n.position.x + offsetX, y: n.position.y },
      }));

      setNodes((curr) => [...curr, ...offsetNodes]);
      setEdges((curr) => [...curr, ...templateEdges]);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
      toast.success(`Applied "${template.name}" template`);
    },
    [nodes, setNodes, setEdges, takeSnapshot, fitView, toast]
  );

  // MiniMap color mapping
  const minimapNodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case 'start':
        return '#16a34a';
      case 'task':
        return '#3b82f6';
      case 'approval':
        return '#f59e0b';
      case 'automated':
        return '#0ea5e9';
      case 'end':
        return '#ef4444';
      default:
        return '#64748b';
    }
  }, []);

  return (
    <ValidationContext.Provider value={validationResults}>
      <div className="flex h-[calc(100vh-32px)]">
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Canvas area */}
        <div ref={reactFlowWrapper} className="flex-1 relative">
          {/* Top toolbar */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {/* Undo/Redo buttons */}
            <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 size={18} className="text-slate-600" />
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Auto-layout button */}
            <button
              onClick={handleAutoLayout}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-gray-100 hover:bg-slate-50 transition-colors"
              title="Auto Layout"
              aria-label="Auto Layout"
            >
              <LayoutGrid size={18} className="text-violet-600" />
              <span className="text-sm font-medium text-slate-700">Layout</span>
            </button>

            {/* Export button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-gray-100 hover:bg-slate-50 transition-colors"
              title="Export workflow as JSON"
              aria-label="Export JSON"
            >
              <Download size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">Export</span>
            </button>

            {/* Import button */}
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md border border-gray-100 hover:bg-slate-50 transition-colors"
              title="Import workflow from JSON"
              aria-label="Import JSON"
            >
              <Upload size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Import</span>
            </button>
          </div>

          <div className="h-full rounded-md bg-white">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStart={onNodeDragStart}
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
              {/* Controls with custom buttons */}
              <Controls position="bottom-left" showInteractive={false}>
                <ControlButton
                  onClick={handleFitView}
                  title="Fit view"
                  aria-label="Fit all nodes in view"
                >
                  <Maximize size={16} />
                </ControlButton>
                <ControlButton
                  onClick={handleResetZoom}
                  title="Reset zoom to 100%"
                  aria-label="Reset zoom"
                >
                  <RotateCcw size={16} />
                </ControlButton>
              </Controls>

              {/* MiniMap with custom colors */}
              <MiniMap
                nodeColor={minimapNodeColor}
                nodeStrokeWidth={3}
                position="bottom-left"
                style={{ marginBottom: 60 }}
                pannable
                zoomable
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
    </ValidationContext.Provider>
  );
}

// Attach sidebar for external use
(FlowCanvasComponent as any).SidebarPlaceholder = Sidebar;
