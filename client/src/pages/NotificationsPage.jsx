import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/dates.js';
import { EmptyState } from '../components/EmptyState.jsx';
import {
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Info,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function NotificationsPage({ onNavigate }) {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.notifications.list();
      if (res?.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch {
      toast.error('Failed to check notification triggers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={18} color="var(--danger)" />;
      case 'warning':
        return <ShieldAlert size={18} color="var(--warning)" />;
      case 'success':
        return <CheckCircle2 size={18} color="var(--success)" />;
      default:
        return <Info size={18} color="var(--accent-yellow)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem' }}>Notification Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Real-time alerts triggered by MongoDB budget thresholds, upcoming recurring rules, and goal milestones.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All Caught Up — Zero Active Alerts"
          description="Your portfolio is operating within healthy parameters. No budget limits breached or imminent subscriptions due."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                borderLeft: `4px solid ${
                  n.type === 'danger'
                    ? 'var(--danger)'
                    : n.type === 'warning'
                    ? 'var(--warning)'
                    : n.type === 'success'
                    ? 'var(--success)'
                    : 'var(--accent-yellow)'
                }`,
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIcon(n.type)}
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {formatDate(n.timestamp)}
                  </span>
                </div>
              </div>

              {n.actionUrl && (
                <button
                  onClick={() => onNavigate(n.actionUrl)}
                  className="btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  View Details <ArrowRight size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
