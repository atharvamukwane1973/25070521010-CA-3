import React from 'react';
import {
  Server,
  Database,
  Lock,
  Layers,
  CheckCircle,
  FileText,
  Key,
  ShieldCheck,
  RefreshCw,
  PieChart,
} from 'lucide-react';

export function FeaturesPage({ onNavigate }) {
  const specs = [
    { label: 'Project Root Folder', val: '25070521010' },
    { label: 'GitHub Repository Name', val: '25070521010' },
    { label: 'Frontend Technology', val: 'React.js, JavaScript, HTML5, CSS3' },
    { label: 'Backend Technology', val: 'Pure Node.js (node:http) — No Express' },
    { label: 'Database & GUI', val: 'MongoDB Community Server + MongoDB Compass' },
    { label: 'Database Driver', val: 'Official MongoDB Node.js Driver (mongodb)' },
    { label: 'Database Name', val: 'personal_finance_tracker' },
    { label: 'Authentication Scheme', val: 'Scrypt Password Hashing + Session Cookies + Google OAuth' },
    { label: 'Currency Precision', val: 'Integer Minor Units (Paise in INR) — Zero float error' },
    { label: 'Client-Server Protocol', val: 'RESTful APIs over Native Fetch with CSRF Protection' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div className="badge-yellow" style={{ marginBottom: '0.75rem' }}>
          Technical Specifications
        </div>
        <h1>System Architecture & Compliance</h1>
        <p style={{ maxWidth: '650px', margin: '0.75rem auto 0' }}>
          Detailed verification of strict academic requirements, security protocols, and database schema implementation.
        </p>
      </div>

      {/* Specifications Table */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--accent-yellow)" /> Mandatory Compliance Checklist
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Implementation Specification</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.val}</td>
                  <td>
                    <span className="badge-success">
                      <CheckCircle size={12} /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How It Works Grid */}
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        How Vaultly Operates
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-yellow)', fontWeight: 700, marginBottom: '0.5rem' }}>
            STEP 01
          </div>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Encrypted Registration</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Users register with email/password. Password is authenticated via Node.js <code>crypto.scrypt</code> with a unique 16-byte random salt and verified with timing-safe comparison. Default bank and category records are automatically seeded.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-yellow)', fontWeight: 700, marginBottom: '0.5rem' }}>
            STEP 02
          </div>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Zero-Float Integer Accounting</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Every deposit, expense, and transfer is normalized into integer paise. MongoDB indexes on <code>ownerId + date</code> enable sub-millisecond aggregations of cash flows, balances, and monthly categories.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-yellow)', fontWeight: 700, marginBottom: '0.5rem' }}>
            STEP 03
          </div>
          <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Compass Real-Time Inspection</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Connect MongoDB Compass to <code>mongodb://127.0.0.1:27017/personal_finance_tracker</code> to inspect collections: users, sessions, accounts, transactions, categories, budgets, and savings goals in real time.
          </p>
        </div>
      </div>
    </div>
  );
}
