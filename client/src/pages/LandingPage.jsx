import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatINR } from '../utils/currency.js';
import {
  ArrowRight,
  Shield,
  Database,
  Server,
  Zap,
  TrendingUp,
  PieChart,
  Lock,
  Wallet,
  CheckCircle2,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';

export function LandingPage({ onNavigate }) {
  const { isAuthenticated } = useAuth();

  // Interactive Live Calculator Preview
  const [demoIncome, setDemoIncome] = useState(120000);
  const [demoExpenses, setDemoExpenses] = useState(55000);

  const demoSavings = Math.max(0, demoIncome - demoExpenses);
  const demoSavingsRate = demoIncome > 0 ? Math.round((demoSavings / demoIncome) * 100) : 0;

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '6rem 2rem 4.5rem',
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Subtle pill tag */}
        <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
          <div className="badge-yellow">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-yellow)' }} />
            College Project 25070521010 • Full-Stack Finance Platform
          </div>
        </div>

        {/* Hero Headline */}
        <h1
          style={{
            maxWidth: '1020px',
            marginBottom: '1.5rem',
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
          }}
        >
          CONTROL YOUR WEALTH WITH{' '}
          <span
            style={{
              color: 'var(--accent-yellow)',
              textShadow: '0 0 30px rgba(244, 213, 46, 0.25)',
            }}
          >
            PRECISION
          </span>{' '}
          & ARCHITECTURAL CLARITY.
        </h1>

        <p
          style={{
            maxWidth: '680px',
            fontSize: '1.15rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
          }}
        >
          Vaultly is an authentic, dark editorial personal finance tracker engineered with pure Node.js HTTP,
          persistent MongoDB Community/Compass integration, integer paise arithmetic, and bank-grade scrypt authentication.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('/app/dashboard')}
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0 2rem' }}
            >
              Open Your Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('/signup')}
                className="btn-primary"
                style={{ fontSize: '1rem', padding: '0 2rem' }}
              >
                Launch Finance Tracker <ArrowRight size={18} />
              </button>
              <button
                onClick={() => onNavigate('/login')}
                className="btn-secondary"
                style={{ fontSize: '1rem', padding: '0 1.75rem' }}
              >
                Sign In With Demo Account
              </button>
            </>
          )}
        </div>

        {/* Live Interactive Editorial Panel */}
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem',
            border: '1px solid var(--border-medium)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle grid accent inside card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.25rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="var(--accent-yellow)" />
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Interactive Cash Flow Sandbox</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Test our integer paise accounting model with real-time Indian Rupee formatting.
              </p>
            </div>
            <div className="badge-yellow">Zero Floating-Point Drift Guaranteed</div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Monthly Inflow (Salary & Freelance)
                  </label>
                  <span className="mono-number" style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {formatINR(demoIncome * 100, false)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="5000"
                  value={demoIncome}
                  onChange={(e) => setDemoIncome(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-yellow)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Monthly Outflow (Rent, Dining, Bills)
                  </label>
                  <span className="mono-number" style={{ fontWeight: 700, color: 'var(--danger)' }}>
                    {formatINR(demoExpenses * 100, false)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="2500"
                  value={demoExpenses}
                  onChange={(e) => setDemoExpenses(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--danger)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Results Display */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Net Monthly Savings
                </div>
                <div
                  className="mono-number"
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'var(--accent-yellow)',
                    marginTop: '0.25rem',
                  }}
                >
                  {formatINR(demoSavings * 100, false)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Savings Efficiency Rate
                </div>
                <div
                  className="mono-number"
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: demoSavingsRate >= 30 ? 'var(--success)' : 'var(--warning)',
                    marginTop: '0.25rem',
                  }}
                >
                  {demoSavingsRate}%
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Annual Accumulated Wealth Potential:</span>
                  <span className="mono-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatINR(demoSavings * 12 * 100, false)} / year
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Section */}
      <section
        style={{
          padding: '4.5rem 2rem',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <div className="badge-yellow" style={{ marginBottom: '0.75rem' }}>
              Rigorous Engineering
            </div>
            <h2>Built Exactly To Strict Academic Specifications</h2>
            <p style={{ marginTop: '0.75rem' }}>
              Zero Express.js shortcuts, zero fake database mocks. An authentic full-stack application built for college project evaluation.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Card 1 */}
            <div className="glass-card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(244, 213, 46, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-yellow)',
                  marginBottom: '1.25rem',
                }}
              >
                <Server size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Pure Node.js Server</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Implemented solely using Node.js's built-in <code>node:http</code> module. Includes custom modular routing, regex path params, request size safeguards, and streaming error handlers.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(120, 216, 160, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success)',
                  marginBottom: '1.25rem',
                }}
              >
                <Database size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>MongoDB Compass Ready</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Connects through the official MongoDB driver to <code>personal_finance_tracker</code>. Inspect every collection, index, and document directly via the MongoDB Compass GUI.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(96, 165, 250, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--info)',
                  marginBottom: '1.25rem',
                }}
              >
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Scrypt & OIDC Auth</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Password security with <code>crypto.scrypt</code>, 16-byte random salts, timing-safe checks, SHA-256 hashed session tokens, HTTP-only cookies, and Google OpenID Connect.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass-card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(243, 198, 106, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--warning)',
                  marginBottom: '1.25rem',
                }}
              >
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Paise Minor Units</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All monetary records are stored as integer minor units (paise in INR). Completely eliminates JavaScript binary floating-point roundoff errors (e.g. 0.1 + 0.2 ≠ 0.3).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough Grid */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
          <div className="badge-yellow" style={{ marginBottom: '0.75rem' }}>
            Comprehensive Finance Features
          </div>
          <h2>Everything You Need To Master Your Money</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <Wallet size={24} color="var(--accent-yellow)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Multi-Account Balance Tracking</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Manage HDFC bank accounts, cash in hand, digital wallets, and savings accounts. Track balances computed dynamically from transactions without double-counting transfers.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <PieChart size={24} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Monthly Spending Budgets</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Set monthly category spending caps. Visual progress indicators and automatic system alerts notify you before you exceed your targets.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <TrendingUp size={24} color="#60A5FA" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Targeted Savings Goals</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Create milestone goals for emergency funds, travel, or device upgrades. Record contributions and celebrate completions.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <FileSpreadsheet size={24} color="var(--warning)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>One-Click CSV Export</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Export complete transaction histories to CSV for external audits or spreadsheets, strictly scoped to your authenticated account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
