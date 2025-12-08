import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Start MSW in dev
if (import.meta.env.DEV) {
  import('./api/msw/browser').then(({ worker }) => {
    worker.start();
  });
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
