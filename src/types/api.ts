export type AutomationAction = {
  id: string;
  label: string;
  params: string[];
};

export type SimulateResponse = {
  steps: { nodeId: string; type: string; message: string; status: 'success' | 'failed' }[];
};
