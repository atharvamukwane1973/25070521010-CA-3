import React from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { Shield, Database, Server, Code2, Heart } from 'lucide-react';

export function PublicLayout({ children, currentPath, onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onNavigate={onNavigate} currentPath={currentPath} />

      <main style={{ flex: 1 }}>{children}</main>

      {/* Editorial Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#030303',
          padding: '3.5rem 2rem 2rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Col 1: Brand & College details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'var(--accent-yellow)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#050505',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                V
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                VAULTLY
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Full-Stack Personal Finance Tracker built as an official college project submission.
              Architected with high security, pure Node.js HTTP server, and persistent MongoDB Compass integration.
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <strong>Submission Root & Repo:</strong> 25070521010
            </div>
          </div>

          {/* Col 2: Architecture Highlights */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              System Architecture
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={14} color="var(--accent-yellow)" /> Pure <code>node:http</code> (Zero Express)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={14} color="var(--success)" /> Official MongoDB Node.js Driver & Compass
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#60A5FA" /> Scrypt Password Hashes & CSRF Protection
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 size={14} color="var(--warning)" /> Integer Paise Math (Zero Float Drift)
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Overview & Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/features')}
                  style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}
                >
                  System Features & Specs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left' }}
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            © 2026 Vaultly — Personal Finance Tracker. College Project Submission 25070521010.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with pure Node.js, React, and MongoDB <Heart size={13} color="var(--danger)" />
          </div>
        </div>
      </footer>
    </div>
  );
}
