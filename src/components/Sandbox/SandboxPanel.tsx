import React, { useState } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { hasCycle } from '../../utils/graph';
import { simulate } from '../../api/client';

export default function SandboxPanel() {
  const { nodes, edges } = useWorkflowContext();
  const [logs, setLogs] = useState<any[]>([]);
  const [validErrors, setValidErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

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
    if (errs.length) return;
    setRunning(true);
    setLogs([]);
    try {
      const payload = {
        nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
        edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
      };
      const res = await simulate(payload);
      setLogs(res.steps);
    } catch (err) {
      setLogs([{ nodeId: 'error', message: (err as Error).message, status: 'failed' }]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <button onClick={runSimulation} disabled={running} style={{ padding: 8 }}>{running ? 'Running...' : 'Run Simulation'}</button>

      {validErrors.length > 0 && (
        <div style={{ marginTop: 8, color: 'crimson' }}>
          <b>Validation Errors</b>
          <ul>
            {validErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <b>Execution Log</b>
        <div style={{ maxHeight: 300, overflow: 'auto', marginTop: 8, border: '1px solid #eee', padding: 8 }}>
          {logs.length === 0 && <div>No logs yet</div>}
          {logs.map((l, i) => (
            <div key={i} style={{ padding: 6, borderBottom: '1px solid #f3f3f3' }}>
              <div><b>{l.nodeId}</b> — {l.message}</div>
              <div style={{ fontSize: 12, color: l.status === 'success' ? 'green' : 'red' }}>{l.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
