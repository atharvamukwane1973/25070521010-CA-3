import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldCheck, ArrowRight, Wallet } from 'lucide-react';

export function Navbar({ onNavigate, currentPath }) {
  const { isAuthenticated, user } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 2rem',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <div
        onClick={() => onNavigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            background: 'var(--accent-yellow)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#050505',
            boxShadow: 'var(--shadow-glow-yellow)',
          }}
        >
          <Wallet size={20} strokeWidth={2.5} />
        </div>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            VAULTLY
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            College Project 25070521010
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        <button
          onClick={() => onNavigate('/')}
          style={{
            background: 'transparent',
            color: currentPath === '/' ? 'var(--accent-yellow)' : 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Overview
        </button>
        <button
          onClick={() => onNavigate('/features')}
          style={{
            background: 'transparent',
            color: currentPath === '/features' ? 'var(--accent-yellow)' : 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Features & Specs
        </button>
        <button
          onClick={() => onNavigate('/privacy')}
          style={{
            background: 'transparent',
            color: currentPath === '/privacy' ? 'var(--accent-yellow)' : 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Privacy
        </button>
        <button
          onClick={() => onNavigate('/terms')}
          style={{
            background: 'transparent',
            color: currentPath === '/terms' ? 'var(--accent-yellow)' : 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          Terms
        </button>
      </nav>

      {/* Auth Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <button
            onClick={() => onNavigate('/app/dashboard')}
            className="btn-primary btn-sm"
          >
            Go to Dashboard <ArrowRight size={16} />
          </button>
        ) : (
          <>
            <button
              onClick={() => onNavigate('/login')}
              className="btn-secondary btn-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="btn-primary btn-sm"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
