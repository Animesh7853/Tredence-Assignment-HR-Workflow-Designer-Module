// src/components/Toast/ToastProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';

type Toast = { id: string; type: 'success'|'error'|'info'; message: string };
type ToastContextValue = {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(type: Toast['type'], message: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const t = { id, type, message };
    setToasts(s => [t, ...s]);
    setTimeout(() => {
      setToasts(s => s.filter(x => x.id !== id));
    }, 4000);
  }

  const api = {
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m),
    info: (m: string) => push('info', m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {ReactDOM.createPortal(
        <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {toasts.map(t => (
            <div key={t.id} style={{
              padding: '10px 12px',
              borderRadius: 8,
              color: '#fff',
              background: t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#dc2626' : '#475569',
              boxShadow: '0 6px 18px rgba(2,6,23,0.12)'
            }}>
              {t.message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
