import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ToastProvider } from './components/Toast/ToastProvider';

async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) {
    return;
  }

  console.log('[MSW] Starting mock service worker...');

  const { worker } = await import('./api/msw/browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  console.log('[MSW] Mock service worker started successfully');
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>
  );
});
