import React from 'react';
import { AlertOctagon, ArrowLeft, Home } from 'lucide-react';

export function NotFoundPage({ onNavigate, isAccessDenied = false }) {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          padding: '3rem 2rem',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isAccessDenied ? 'rgba(255, 118, 118, 0.12)' : 'rgba(244, 213, 46, 0.12)',
            color: isAccessDenied ? 'var(--danger)' : 'var(--accent-yellow)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <AlertOctagon size={32} />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          {isAccessDenied ? '403 — Access Denied' : '404 — Route Not Found'}
        </h1>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          {isAccessDenied
            ? 'You do not have authorization to view this financial resource. Please authenticate or verify your account session.'
            : 'The requested finance view or resource could not be found. Please check the URL or return to safety.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('/')} className="btn-secondary btn-sm">
            <Home size={16} /> Home
          </button>
          <button onClick={() => onNavigate('/app/dashboard')} className="btn-primary btn-sm">
            <ArrowLeft size={16} /> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
