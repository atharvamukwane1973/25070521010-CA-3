import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  Tags,
  PieChart,
  Target,
  RefreshCw,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react';

export function Sidebar({ currentPath, onNavigate, unreadNotifications = 0 }) {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', path: '/app/transactions', icon: Receipt },
    { label: 'Accounts & Wallets', path: '/app/accounts', icon: Landmark },
    { label: 'Categories', path: '/app/categories', icon: Tags },
    { label: 'Budgets', path: '/app/budgets', icon: PieChart },
    { label: 'Savings Goals', path: '/app/goals', icon: Target },
    { label: 'Recurring Schedules', path: '/app/recurring', icon: RefreshCw },
    { label: 'Reports & Analytics', path: '/app/analytics', icon: BarChart3 },
    {
      label: 'Notifications',
      path: '/app/notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand header */}
      <div
        onClick={() => onNavigate('/')}
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            background: 'var(--accent-yellow)',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#050505',
          }}
        >
          <Wallet size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            VAULTLY
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Finance Platform
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          padding: '1.25rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: isActive ? 'rgba(244, 213, 46, 0.12)' : 'transparent',
                color: isActive ? 'var(--accent-yellow)' : 'var(--text-secondary)',
                border: isActive
                  ? '1px solid var(--border-highlight)'
                  : '1px solid transparent',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                justifyContent: 'flex-start',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    background: 'var(--accent-yellow)',
                    color: '#050505',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F4D52E, #B99B08)',
                color: '#050505',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name || 'Account'}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.email || ''}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
