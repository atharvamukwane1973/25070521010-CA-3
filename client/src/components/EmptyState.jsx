import React from 'react';
import { PlusCircle } from 'lucide-react';

export function EmptyState({
  icon: Icon = PlusCircle,
  title = 'No records found',
  description = 'Get started by creating your first record to begin tracking your finances.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-panel)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(244, 213, 46, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-yellow)',
        }}
      >
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <div style={{ maxWidth: '420px' }}>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>{title}</h4>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{description}</p>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
