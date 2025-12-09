// src/api/msw/handlers.ts
import { http, HttpResponse, delay } from 'msw';

type IncomingNode = {
  id: string;
  type: string;
  data?: any;
};

export const handlers = [
  // GET /automations - list of available automated actions
  http.get('/automations', async () => {
    console.log('[MSW] GET /automations');
    await delay(100);
    return HttpResponse.json([
      { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
      { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
      { id: 'send_slack', label: 'Send Slack Message', params: ['channel', 'message'] },
      { id: 'create_ticket', label: 'Create Ticket', params: ['title', 'priority'] },
    ]);
  }),

  // POST /simulate - return a step-by-step simulation result with rich details
  http.post('/simulate', async ({ request }) => {
    console.log('[MSW] POST /simulate');
    try {
      const body = await request.json() as { nodes?: IncomingNode[] };
      const nodes: IncomingNode[] = Array.isArray(body?.nodes) ? body.nodes : [];

      // Build rich step objects from nodes so the client can render nicely
      const steps = nodes.map((n) => {
        const base = {
          nodeId: n.id,
          type: n.type,
          timestamp: Date.now()
        };

        // include a friendly message and a details object per node type
        switch (n.type) {
          case 'start':
            return {
              ...base,
              status: 'success',
              message: `Started workflow "${n.data?.title ?? 'Start'}"`,
              details: {
                title: n.data?.title ?? 'Start',
                metadata: n.data?.metadata ?? null
              }
            };

          case 'task':
            return {
              ...base,
              status: 'success',
              message: `Completed task "${n.data?.title ?? 'Task'}"`,
              details: {
                title: n.data?.title ?? 'Task',
                assignee: n.data?.assignee ?? 'Unassigned',
                dueDate: n.data?.dueDate ?? null,
                description: n.data?.description ?? null
              }
            };

          case 'approval':
            // Simulate an approval decision
            const approved = true;
            return {
              ...base,
              status: approved ? 'success' : 'failed',
              message: `${approved ? 'Approved' : 'Rejected'} approval "${n.data?.title ?? 'Approval'}"`,
              details: {
                title: n.data?.title ?? 'Approval',
                approverRole: n.data?.approverRole ?? 'Approver',
                autoApproveThreshold: n.data?.autoApproveThreshold ?? 0,
                decision: approved ? 'approved' : 'rejected'
              }
            };

          case 'automated':
            return {
              ...base,
              status: 'success',
              message: `Executed automated action "${n.data?.actionId ?? 'automated'}"`,
              details: {
                actionId: n.data?.actionId ?? null,
                actionLabel: n.data?.actionLabel ?? n.data?.actionId ?? 'Automated action',
                actionParams: n.data?.actionParams ?? {}
              }
            };

          case 'end':
            return {
              ...base,
              status: 'success',
              message: `Completed workflow "${n.data?.endMessage ?? 'End'}"`,
              details: {
                endMessage: n.data?.endMessage ?? 'End',
                summary: !!n.data?.summary
              }
            };

          default:
            return {
              ...base,
              status: 'success',
              message: n.data?.title ? `Executed ${n.data.title}` : `Executed node ${n.id}`,
              details: {
                raw: n.data ?? null
              }
            };
        }
      });

      await delay(300);
      return HttpResponse.json({ steps });
    } catch (err) {
      console.error('MSW /simulate handler error:', err);
      return HttpResponse.json({ error: 'simulate handler failed' }, { status: 500 });
    }
  })
];
