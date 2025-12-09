import { http, HttpResponse, delay } from 'msw';

// Mock automation actions
const mockAutomations = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'send_slack', label: 'Send Slack Message', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create Ticket', params: ['title', 'priority'] },
  { id: 'update_record', label: 'Update Record', params: ['recordId', 'fields'] },
  { id: 'notify_manager', label: 'Notify Manager', params: ['employeeId', 'message'] },
];

export const handlers = [
  // GET /automations
  http.get('/automations', async () => {
    console.log('[MSW] GET /automations');
    await delay(200);
    return HttpResponse.json(mockAutomations);
  }),

  // POST /simulate
  http.post('/simulate', async ({ request }) => {
    console.log('[MSW] POST /simulate');
    const body = await request.json() as { nodes?: Array<{ id: string; type: string; data?: { title?: string } }> };
    const nodes = body?.nodes ?? [];
    
    // Generate mock simulation steps based on payload
    const steps = nodes.map((n, i) => ({
      nodeId: n.id,
      type: n.type,
      message: `Executed ${n.type} "${n.data?.title ?? ''}"`,
      status: 'success' as const,
    }));

    // Add a default step if no nodes provided
    if (steps.length === 0) {
      steps.push({
        nodeId: 'start',
        type: 'start',
        message: 'Workflow simulation started',
        status: 'success' as const,
      });
    }

    await delay(400);
    return HttpResponse.json({ steps });
  }),
];
