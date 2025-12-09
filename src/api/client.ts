import type { AutomationAction, SimulateResponse } from '../types/api';

/**
 * Fetches available automation actions.
 * Validates response shape and throws informative errors.
 */
export async function getAutomations(): Promise<AutomationAction[]> {
  const res = await fetch('/automations');

  if (!res.ok) {
    throw new Error(
      `Failed to fetch automations: ${res.status} ${res.statusText}`
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('Failed to parse automations response as JSON');
  }

  // Validate response is an array
  if (!Array.isArray(data)) {
    throw new Error(
      `Invalid automations response: expected array, got ${typeof data}`
    );
  }

  // Validate each item has required shape
  for (const item of data) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'string' ||
      typeof item.label !== 'string' ||
      !Array.isArray(item.params)
    ) {
      throw new Error(
        `Invalid automation item shape: ${JSON.stringify(item)}`
      );
    }
  }

  return data as AutomationAction[];
}

/**
 * Runs workflow simulation with provided payload.
 * Validates response and returns simulation steps.
 */
export async function simulate(workflow: { nodes: any[]; edges: any[] }): Promise<SimulateResponse> {
  const res = await fetch('/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });

  if (!res.ok) {
    throw new Error(
      `Simulation failed: ${res.status} ${res.statusText}`
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('Failed to parse simulation response as JSON');
  }

  // Validate response shape
  if (
    typeof data !== 'object' ||
    data === null ||
    !('steps' in data) ||
    !Array.isArray((data as SimulateResponse).steps)
  ) {
    throw new Error(
      `Invalid simulation response: expected { steps: [...] }, got ${JSON.stringify(data)}`
    );
  }

  return data as SimulateResponse;
}
