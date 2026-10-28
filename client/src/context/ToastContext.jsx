import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 9999,
          maxWidth: '420px',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: '#121212',
              border: `1px solid ${
                t.type === 'success'
                  ? 'rgba(120, 216, 160, 0.4)'
                  : t.type === 'error'
                  ? 'rgba(255, 118, 118, 0.4)'
                  : 'rgba(244, 213, 46, 0.4)'
              }`,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
              color: '#F5F5F0',
              fontSize: '0.9rem',
              animation: 'slideUp 200ms ease-out',
            }}
          >
            {t.type === 'success' && <CheckCircle2 size={18} color="#78D8A0" />}
            {t.type === 'error' && <AlertCircle size={18} color="#FF7676" />}
            {t.type === 'info' && <Info size={18} color="#F4D52E" />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                color: '#797972',
                padding: '2px',
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
