import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/dates.js';
import { EmptyState } from '../components/EmptyState.jsx';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Tag,
  Calendar,
} from 'lucide-react';

export function DashboardPage({ onNavigate, onOpenNewTransaction }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await api.dashboard.getSummary();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading && !data) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Loading your financial portfolio...</p>
      </div>
    );
  }

  // First-use Empty State
  if (!data?.hasRecords) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1>Welcome, {user?.name || 'Investor'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Your personal finance ledger is ready. Let's record your first income or expense to populate your analytics.
          </p>
        </div>
        <EmptyState
          icon={Wallet}
          title="Your Vaultly Ledger Is Fresh"
          description="Record your opening bank deposits, corporate salary, or recent grocery receipts to unlock automated charts and budget gauges."
          actionLabel="Record First Transaction"
          onAction={onOpenNewTransaction}
        />
      </div>
    );
  }

  // Compute maximum amount for the 6-month chart scaling
  const maxTrendAmount = Math.max(
    ...(data?.monthlyTrends?.flatMap((t) => [t.incomePaise, t.expensePaise]) || [10000000])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Greeting Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="badge-yellow" style={{ marginBottom: '0.4rem' }}>
            Portfolio Active • Live MongoDB
          </div>
          <h1 style={{ fontSize: '1.85rem' }}>Welcome, {user?.name || 'Account'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onOpenNewTransaction} className="btn-primary btn-sm">
            <PlusCircle size={16} /> Quick Record
          </button>
          <button onClick={() => onNavigate('/app/transactions')} className="btn-secondary btn-sm">
            All Transactions <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Top Editorial KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Available Balance */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-yellow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Net Balance
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244, 213, 46, 0.1)', color: 'var(--accent-yellow)' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div
            className="mono-number"
            style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}
          >
            {formatINR(data.totalBalancePaise)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Across all verified accounts & wallets
          </div>
        </div>

        {/* Current Month Inflow */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly Inflow
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(120, 216, 160, 0.1)', color: 'var(--success)' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div
            className="mono-number"
            style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}
          >
            {formatINR(data.currentMonthIncomePaise)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {data.incomeChangePct >= 0 ? `+${data.incomeChangePct}%` : `${data.incomeChangePct}%`} vs previous month
          </div>
        </div>

        {/* Current Month Outflow */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly Outflow
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255, 118, 118, 0.1)', color: 'var(--danger)' }}>
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div
            className="mono-number"
            style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}
          >
            {formatINR(data.currentMonthExpensePaise)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {data.expenseChangePct >= 0 ? `+${data.expenseChangePct}%` : `${data.expenseChangePct}%`} vs previous month
          </div>
        </div>

        {/* Net Cash Flow & Savings Rate */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Net Cash Flow
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.1)', color: 'var(--info)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div
            className="mono-number"
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: data.netCashFlowPaise >= 0 ? 'var(--accent-yellow)' : 'var(--danger)',
              marginBottom: '0.5rem',
            }}
          >
            {formatINR(data.netCashFlowPaise)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Savings Rate: <strong style={{ color: 'var(--success)' }}>{data.savingsRate}%</strong> of income
          </div>
        </div>
      </div>

      {/* Middle Row: 6-Month Chart + Category Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* 6-Month Income vs Expense Visualizer */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Income vs Outflow Trend</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Historical 6-month financial performance
              </p>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--success)' }} />
                <span>Income</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(255, 118, 118, 0.85)' }} />
                <span>Expense</span>
              </div>
            </div>
          </div>

          {/* SVG/Bar Visualization */}
          <div
            style={{
              height: '240px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '16px',
              paddingTop: '20px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {data.monthlyTrends?.map((m, idx) => {
              const incHeight = maxTrendAmount > 0 ? (m.incomePaise / maxTrendAmount) * 190 : 0;
              const expHeight = maxTrendAmount > 0 ? (m.expensePaise / maxTrendAmount) * 190 : 0;

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '4px',
                      width: '100%',
                      justifyContent: 'center',
                      height: '190px',
                    }}
                  >
                    {/* Income Bar */}
                    <div
                      title={`Income: ${formatINR(m.incomePaise)}`}
                      style={{
                        width: '45%',
                        maxWidth: '22px',
                        height: `${Math.max(4, incHeight)}px`,
                        background: 'var(--success)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height var(--transition-smooth)',
                      }}
                    />
                    {/* Expense Bar */}
                    <div
                      title={`Expense: ${formatINR(m.expensePaise)}`}
                      style={{
                        width: '45%',
                        maxWidth: '22px',
                        height: `${Math.max(4, expHeight)}px`,
                        background: 'rgba(255, 118, 118, 0.85)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height var(--transition-smooth)',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {m.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Month Category Breakdown */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.2rem' }}>Category Outflow</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Current month distribution
              </p>
            </div>
            <button onClick={() => onNavigate('/app/categories')} className="btn-secondary btn-sm" style={{ height: '32px' }}>
              Manage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.categoryBreakdown?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No category expenses recorded this month yet.
              </div>
            ) : (
              data.categoryBreakdown?.slice(0, 5).map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: cat.color || 'var(--accent-yellow)',
                        }}
                      />
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cat.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span className="mono-number" style={{ fontWeight: 600 }}>
                        {formatINR(cat.spentPaise)}
                      </span>
                      <span style={{ color: 'var(--text-muted)', width: '35px', textAlign: 'right' }}>
                        {cat.percent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${cat.percent}%`,
                        height: '100%',
                        background: cat.color || 'var(--accent-yellow)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions & Savings Goals */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Transactions */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Recent Activity</h3>
            <button
              onClick={() => onNavigate('/app/transactions')}
              style={{
                background: 'transparent',
                color: 'var(--accent-yellow)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Full History →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.recentTransactions?.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background:
                        tx.type === 'income'
                          ? 'rgba(120, 216, 160, 0.12)'
                          : tx.type === 'expense'
                          ? 'rgba(255, 118, 118, 0.12)'
                          : 'rgba(244, 213, 46, 0.12)',
                      color:
                        tx.type === 'income'
                          ? 'var(--success)'
                          : tx.type === 'expense'
                          ? 'var(--danger)'
                          : 'var(--accent-yellow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {tx.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.merchant ? `${tx.merchant} • ` : ''}
                      {formatDate(tx.date)}
                    </div>
                  </div>
                </div>

                <div
                  className="mono-number"
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color:
                      tx.type === 'income'
                        ? 'var(--success)'
                        : tx.type === 'expense'
                        ? 'var(--text-primary)'
                        : 'var(--accent-yellow)',
                  }}
                >
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                  {formatINR(tx.amountPaise)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Goals Widget */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Savings Goals</h3>
            <button
              onClick={() => onNavigate('/app/goals')}
              style={{
                background: 'transparent',
                color: 'var(--accent-yellow)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All Goals →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {data.savingsGoals?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No active savings goals defined.
              </div>
            ) : (
              data.savingsGoals?.map((g) => (
                <div
                  key={g.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.title}</span>
                    <span
                      className="mono-number"
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: g.progressPercent === 100 ? 'var(--success)' : 'var(--accent-yellow)',
                      }}
                    >
                      {g.progressPercent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '7px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: `${g.progressPercent}%`,
                        height: '100%',
                        background:
                          g.progressPercent === 100
                            ? 'var(--success)'
                            : 'linear-gradient(90deg, var(--accent-yellow), var(--accent-yellow-soft))',
                        borderRadius: '4px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Saved: {formatINR(g.currentAmountPaise, false)}</span>
                    <span>Target: {formatINR(g.targetAmountPaise, false)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
