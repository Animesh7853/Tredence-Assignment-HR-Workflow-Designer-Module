// src/api/msw/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// `worker` used in main.tsx to start MSW during development
export const worker = setupWorker(...handlers);
