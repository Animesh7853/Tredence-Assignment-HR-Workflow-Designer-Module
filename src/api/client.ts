import type { AutomationAction, SimulateResponse } from '../types/api';
import type { WorkflowNode } from '../types/nodes';

export async function getAutomations(): Promise<AutomationAction[]> {
  const res = await fetch('/automations');
  if (!res.ok) throw new Error('Failed to fetch automations');
  return res.json();
}

export async function simulate(workflow: { nodes: any[]; edges: any[] }): Promise<SimulateResponse> {
  const res = await fetch('/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}
