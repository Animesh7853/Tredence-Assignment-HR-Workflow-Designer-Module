// src/App.tsx
import React from 'react';
import { WorkflowProvider } from './context/WorkflowContext';
import FlowCanvas from './components/Canvas/FlowCanvas';
import SandboxPanel from './components/Sandbox/SandboxPanel';
import './index.css';

export default function App() {
  return (
    <WorkflowProvider>
      <div className="min-h-screen grid grid-cols-[260px_1fr_360px] gap-4 p-3 bg-slate-50">
        {/* Left column */}
        <aside className="flex flex-col bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <div className="text-lg font-semibold mb-4">CodeAuto</div>

          <div className="flex-1 overflow-auto">
            <FlowCanvas.SidebarPlaceholder />
          </div>

          <div className="text-sm text-gray-500 mt-4">
            Settings · Help
          </div>
        </aside>

        {/* Center canvas */}
        <main className="bg-white rounded-lg shadow-sm overflow-hidden">
          <FlowCanvas />
        </main>

        {/* Right column */}
        <aside className="flex flex-col bg-white rounded-lg border border-gray-100 p-4 shadow-sm overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Sandbox</h3>
          </div>

          <div className="node-inspector">
            <SandboxPanel />
          </div>
        </aside>
      </div>
    </WorkflowProvider>
  );
}
