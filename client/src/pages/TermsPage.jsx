import React from 'react';
import { FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export function TermsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div className="badge-yellow" style={{ marginBottom: '0.75rem' }}>
          Legal & Academic Scope
        </div>
        <h1>Terms of Service</h1>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
          Last updated: October 2026 • Official College Project Submission (25070521010)
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-yellow)" /> 1. Nature of Application
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Vaultly is an academic full-stack software engineering project designed to provide manual personal finance bookkeeping, budgeting, and savings goal visualization. It does not act as a licensed banking institution, payment processor, or regulated investment advisor.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="var(--success)" /> 2. Accuracy of User-Entered Bookkeeping
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Financial statistics, monthly summaries, budget usage percentages, and net worth calculations reflect user-entered transactions and starting balances. The user is responsible for the veracity of the amounts and categories entered into the tracker.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="var(--danger)" /> 3. Responsible Usage
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Users agree not to attempt unauthorized penetration testing, automated scraping, or denial-of-service attempts. The platform employs rate limiters and CSRF token safeguards to maintain service stability and data integrity.
          </p>
        </section>
      </div>
    </div>
  );
}
