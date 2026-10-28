import React from 'react';
import { Plus, Bell, Calendar } from 'lucide-react';
import { formatDate } from '../utils/dates.js';

export function AppHeader({ title, subtitle, onOpenNewTransaction, onNavigate, unreadCount = 0 }) {
  const todayStr = formatDate(new Date());

  return (
    <header
      style={{
        height: '70px',
        padding: '0 2rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(5, 5, 5, 0.65)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Date indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'var(--surface-glass)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Calendar size={14} color="var(--accent-yellow)" />
          <span>{todayStr}</span>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => onNavigate('/app/notifications')}
          className="btn-icon"
          style={{ position: 'relative' }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-yellow)',
                boxShadow: '0 0 8px var(--accent-yellow)',
              }}
            />
          )}
        </button>

        {/* Quick Add Transaction Button */}
        {onOpenNewTransaction && (
          <button onClick={onOpenNewTransaction} className="btn-primary btn-sm">
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Transaction</span>
          </button>
        )}
      </div>
    </header>
  );
}
