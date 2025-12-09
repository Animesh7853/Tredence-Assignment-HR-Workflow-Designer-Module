// src/components/Sandbox/SandboxPanel.tsx
import React, { useState } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { hasCycle } from '../../utils/graph';
import { simulate } from '../../api/client';
import { useToast } from '../Toast/ToastProvider';

export default function SandboxPanel() {
  const { nodes, edges } = useWorkflowContext();
  const [logs, setLogs] = useState<any[]>([]);
  const [validErrors, setValidErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const toast = useToast();

  function validate() {
    const errors: string[] = [];
    const startCount = nodes.filter(n => n.type === 'start').length;
    const endCount = nodes.filter(n => n.type === 'end').length;
    if (startCount === 0) errors.push('Missing Start node');
    if (startCount > 1) errors.push('More than one Start node found');
    if (endCount === 0) errors.push('Missing End node');
    if (hasCycle(nodes.map(n => ({ id: n.id })), edges.map(e => ({ source: e.source, target: e.target })))) {
      errors.push('Cycle detected in workflow');
    }
    return errors;
  }

  async function runSimulation() {
    const errs = validate();
    setValidErrors(errs);
    if (errs.length) {
      toast.error('Validation failed');
      return;
    }
    setRunning(true);
    setLogs([]);
    try {
      const payload = {
        nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
      };
      const res = await simulate(payload);
      setLogs(res.steps);
      toast.success('Simulation completed');
    } catch (err: any) {
      console.error('Simulation error', err);
      // try to show informative message
      const msg = (err && err.message) || 'Simulation failed';
      setLogs([{ nodeId: 'error', message: msg, status: 'failed' }]);
      toast.error(`Simulation failed: ${msg}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <button onClick={runSimulation} disabled={running} className="px-3 py-2 bg-indigo-600 text-white rounded">
        {running ? 'Running...' : 'Run Simulation'}
      </button>

      {validErrors.length > 0 && (
        <div className="mt-3 text-sm text-red-600">
          <b>Validation Errors</b>
          <ul>
            {validErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <b>Execution Log</b>
        <div className="execution-log mt-2">
          {logs.length === 0 && <div>No logs yet</div>}
          {logs.map((l, i) => (
            <div key={i} className="p-2 border-b border-gray-100">
              <div><b>{l.nodeId}</b> — {l.message}</div>
              <div className="text-xs" style={{ color: l.status === 'success' ? 'green' : 'crimson' }}>{l.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
