// src/components/Sandbox/SandboxPanel.tsx
import React, { useState } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { hasCycle } from '../../utils/graph';
import { simulate } from '../../api/client';
import { useToast } from '../Toast/ToastProvider';

type RawStep = {
  nodeId: string;
  type?: string;
  message?: string;
  status?: string;
  details?: any;
  timestamp?: number;
};

type LogEntry = {
  id: string;
  timestamp: string;
  message: string;
  status: 'success' | 'failed' | 'skipped' | string;
  raw?: RawStep;
};

export default function SandboxPanel() {
  const { nodes, edges } = useWorkflowContext();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [validErrors, setValidErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const toast = useToast();

  function validate() {
    const errors: string[] = [];
    const startCount = nodes.filter((n) => n.type === 'start').length;
    const endCount = nodes.filter((n) => n.type === 'end').length;
    if (startCount === 0) errors.push('Missing Start node');
    if (startCount > 1) errors.push('More than one Start node found');
    if (endCount === 0) errors.push('Missing End node');
    if (hasCycle(nodes.map((n) => ({ id: n.id })), edges.map((e) => ({ source: e.source, target: e.target })))) {
      errors.push('Cycle detected in workflow');
    }
    return errors;
  }

  function formatTimestamp(ts?: number) {
    const time = ts ? new Date(ts) : new Date();
    return time.toLocaleString();
  }

  function makeId(prefix = '') {
    return `${prefix}${Math.random().toString(36).slice(2, 9)}`;
  }

  function formatFromDetails(step: RawStep): LogEntry {
    const d = step.details || {};
    const t = step.timestamp ?? Date.now();
    const status = (step.status as any) || 'success';
    let message = step.message || '';

    // Prefer details for message building, fallback to server message
    if (d.title && step.type === 'start') {
      message = `Started workflow: "${d.title}"`;
    } else if (step.type === 'task' || d.assignee || d.dueDate || d.title) {
      // Task style
      const title = d.title ?? step.message ?? 'Task';
      const assignee = d.assignee ?? 'Unassigned';
      const due = d.dueDate ? ` (due ${d.dueDate})` : '';
      message = `Completed task "${title}" assigned to ${assignee}${due}`;
    } else if (step.type === 'approval' || d.approverRole) {
      const title = d.title ?? step.message ?? 'Approval';
      const approver = d.approverRole ?? 'Approver';
      const decision = d.decision ?? (/(reject|deny)/i.test(step.message || '') ? 'rejected' : 'approved');
      const thr = typeof d.autoApproveThreshold !== 'undefined' ? ` (auto-approve threshold ${d.autoApproveThreshold})` : '';
      message = `Approval "${title}" by ${approver}${thr} — ${decision}`;
    } else if (step.type === 'automated' || d.actionId || d.actionLabel) {
      const label = d.actionLabel ?? d.actionId ?? 'Automated action';
      const params = d.actionParams && Object.keys(d.actionParams).length
        ? ` — ${Object.entries(d.actionParams).map(([k, v]) => `${k}: ${v}`).join(', ')}`
        : '';
      message = `Executed automated action "${label}"${params}`;
    } else if (step.type === 'end' || d.endMessage) {
      const em = d.endMessage ?? step.message ?? 'End';
      message = `Workflow completed: "${em}"`;
    } else if (step.message) {
      message = step.message;
    } else {
      message = `Executed node ${step.nodeId}`;
    }

    return {
      id: makeId('log-'),
      timestamp: formatTimestamp(t),
      message,
      status: status as any,
      raw: step
    };
  }

  function formatFromServer(step: RawStep): LogEntry {
    // If step has details prefer that route
    if (step.details) return formatFromDetails(step);
    // Otherwise, try to map from node data client-side
    const node = nodes.find((n) => n.id === step.nodeId);
    if (node) {
      const { type, data } = node as any;
      const t = step.timestamp ?? Date.now();
      const status = (step.status as any) || 'success';
      let message = step.message || '';

      switch (type) {
        case 'start':
          message = `Started workflow: "${data?.title ?? 'Start'}"`;
          break;
        case 'task': {
          const title = data?.title ?? 'Task';
          const assignee = data?.assignee ?? 'Unassigned';
          const due = data?.dueDate ? ` (due ${data.dueDate})` : '';
          message = `Completed task "${title}" assigned to ${assignee}${due}`;
          break;
        }
        case 'approval': {
          const title = data?.title ?? 'Approval';
          const approver = data?.approverRole ?? 'Approver';
          const decision = /reject|deny/i.test(step.message || '') ? 'rejected' : 'approved';
          message = `Approval "${title}" by ${approver} — ${decision}`;
          break;
        }
        case 'automated': {
          const label = data?.actionLabel ?? data?.actionId ?? 'Automated action';
          const params = data?.actionParams ? ` — ${Object.entries(data.actionParams).map(([k, v]) => `${k}: ${v}`).join(', ')}` : '';
          message = `Executed automated action "${label}"${params}`;
          break;
        }
        case 'end':
          message = `Workflow completed: "${data?.endMessage ?? 'End'}"`;
          break;
        default:
          message = step.message || `Executed ${type || step.nodeId}`;
      }

      return {
        id: makeId('log-'),
        timestamp: formatTimestamp(step.timestamp),
        message,
        status,
        raw: step
      };
    }

    // fallback: no node & no details
    return {
      id: makeId('log-'),
      timestamp: formatTimestamp(step.timestamp),
      message: step.message || `Executed node ${step.nodeId}`,
      status: (step.status as any) || 'success',
      raw: step
    };
  }

  async function runSimulation() {
    const errs = validate();
    setValidErrors(errs);
    if (errs.length) {
      toast.error('Validation failed. Fix the issues and try again.');
      return;
    }

    setRunning(true);
    setLogs([]);
    try {
      const payload = {
        nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target }))
      };

      const res = await simulate(payload);

      const serverSteps: RawStep[] = res?.steps ?? [];
      // Create formatted logs: prefer details from server step if provided
      const formatted: LogEntry[] = serverSteps.map((s) => {
        if (s.details) return formatFromDetails(s);
        return formatFromServer(s);
      });

      setLogs(formatted);
      toast.success('Simulation completed');
    } catch (err: any) {
      const msg = err?.message ?? 'Simulation failed';
      setLogs([{
        id: makeId('err-'),
        timestamp: formatTimestamp(),
        message: msg,
        status: 'failed',
        raw: err
      }]);
      toast.error(`Simulation failed: ${msg}`);
      console.error('Simulation error', err);
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
          {logs.length === 0 && <div className="text-sm text-slate-500">No logs yet</div>}
          {logs.map((l) => (
            <div key={l.id} className="p-3 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="font-medium text-sm">{l.message}</div>
                <div className="text-xs text-slate-500 mt-1">{l.timestamp}</div>
              </div>

              <div className="ml-3 text-sm" style={{ minWidth: 72, textAlign: 'right' }}>
                <span style={{
                  color: l.status === 'success' ? '#16a34a' : l.status === 'failed' ? '#dc2626' : '#6b7280',
                  fontWeight: 700,
                  textTransform: 'lowercase'
                }}>
                  {l.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
