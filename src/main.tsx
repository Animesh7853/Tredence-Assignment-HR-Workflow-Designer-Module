// src/main.tsx
// Application entry point with optional MSW support for dev and production demo

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ToastProvider } from './components/Toast/ToastProvider';

/**
 * Conditionally enables MSW mocking.
 * - In development: always enabled
 * - In production: only enabled when VITE_ENABLE_MSW=true
 */
async function enableMocking(): Promise<void> {
  const isDev = import.meta.env.DEV;
  const forceMsw = import.meta.env.VITE_ENABLE_MSW === 'true';

  // Skip MSW if not in dev and not explicitly enabled
  if (!isDev && !forceMsw) {
    console.log('[MSW] Mocking disabled in production');
    return;
  }

  console.log(`[MSW] Starting mock service worker... (mode: ${isDev ? 'development' : 'production-demo'})`);

  try {
    // Dynamically import MSW browser module
    const { worker } = await import('./api/msw/browser');

    // Start the service worker
    await worker.start({
      // Don't warn about unhandled requests (let them pass through)
      onUnhandledRequest: 'bypass',
      // Explicit service worker URL for production compatibility
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    console.log('[MSW] Mock service worker started successfully ✓');
  } catch (error) {
    console.error('[MSW] Failed to start mock service worker:', error);
    // Continue app boot even if MSW fails - allows graceful degradation
  }
}

// Boot the application after MSW is ready
enableMocking().then(() => {
  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root element not found. Ensure index.html has <div id="root"></div>');
  }

  createRoot(container).render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>
  );
});
