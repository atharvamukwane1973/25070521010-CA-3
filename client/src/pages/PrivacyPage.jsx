import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Database } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div className="badge-yellow" style={{ marginBottom: '0.75rem' }}>
          Transparency & Security
        </div>
        <h1>Privacy Policy</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
          Last updated: October 2026 • Official College Project Submission (25070521010)
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EyeOff size={18} color="var(--accent-yellow)" /> 1. No Banking Passwords or Sensitive Financial Access
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Vaultly is a personal finance bookkeeping and budgeting application. We never ask for, collect, or store your real net-banking passwords, UPI PINs, credit/debit card CVVs, or Aadhaar identity numbers. All financial figures are manual bookkeeping records maintained privately by the authenticated user.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--success)" /> 2. Cryptographic Storage & Session Protection
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            User passwords are encrypted before storage using Node.js's built-in <code>crypto.scrypt</code> algorithm with a cryptographically secure random 16-byte salt per user. Session tokens are generated using 32 random bytes, and only their SHA-256 hashes are persisted in the database. Cookies are delivered with <code>HttpOnly</code> and <code>SameSite</code> protections.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#60A5FA" /> 3. Data Ownership & Isolation
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Every account, transaction, budget limit, and savings goal is strictly scoped to the authenticated user’s unique MongoDB Object ID (<code>ownerId</code>). Queries and mutations strictly enforce ownership validation at the server level, preventing cross-tenant or cross-user data leakage.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="var(--warning)" /> 4. Data Export & Deletion
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Users retain complete ownership over their financial records. You can download your entire transaction history in CSV format at any time directly through the application interface.
          </p>
        </section>
      </div>
    </div>
  );
}
