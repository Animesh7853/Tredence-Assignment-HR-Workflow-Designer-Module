import { rest } from 'msw';
import { AUTOMATIONS } from './mockData';

export const handlers = [
  rest.get('/automations', (req, res, ctx) => {
    return res(ctx.delay(200), ctx.json(AUTOMATIONS));
  }),

  rest.post('/simulate', async (req, res, ctx) => {
    const payload = await req.json();
    const nodes = payload.nodes || [];
    // Mock: return steps iterating node order
    const steps = nodes.map((n: any, i: number) => ({
      nodeId: n.id,
      type: n.type,
      message: `Executed ${n.type} "${(n.data && n.data.title) || ''}"`,
      status: 'success'
    }));
    return res(ctx.delay(400), ctx.json({ steps }));
  })
];
