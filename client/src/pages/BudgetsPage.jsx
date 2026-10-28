import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatINR } from '../utils/currency.js';
import { getCurrentMonthStr, formatMonthName } from '../utils/dates.js';
import { Modal } from '../components/Modal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calendar,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

export function BudgetsPage() {
  const toast = useToast();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');

  const fetchBudgetData = async (month) => {
    setIsLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        api.budgets.list(month),
        api.categories.list(),
      ]);

      if (bRes?.data) {
        setBudgets(bRes.data.budgets || []);
        setSummary(bRes.data.summary || null);
      }
      if (cRes?.data) {
        setCategories(cRes.data.filter((c) => c.type === 'expense'));
      }
    } catch {
      toast.error('Failed to load budget records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData(selectedMonth);
  }, [selectedMonth]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      toast.error('Please select an expense category');
      return;
    }

    if (!limitAmount || parseFloat(limitAmount) <= 0) {
      toast.error('Please specify a positive budget limit amount');
      return;
    }

    try {
      await api.budgets.upsert({
        categoryId,
        month: selectedMonth,
        limit: parseFloat(limitAmount),
      });
      toast.success('Budget limit configured');
      setIsModalOpen(false);
      setCategoryId('');
      setLimitAmount('');
      fetchBudgetData(selectedMonth);
    } catch (err) {
      toast.error(err.message || 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await api.budgets.delete(id);
      toast.success('Budget removed');
      fetchBudgetData(selectedMonth);
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
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
          <h1 style={{ fontSize: '1.85rem' }}>Monthly Budgets</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track categorical spending limits and prevent overspending with real-time calculations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Month selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-secondary)',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Calendar size={16} color="var(--accent-yellow)" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
          </div>

          <button onClick={() => setIsModalOpen(true)} className="btn-primary btn-sm">
            <Plus size={16} /> Set Category Budget
          </button>
        </div>
      </div>

      {/* Overview KPI Cards */}
      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-yellow)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Budget Limit
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {formatINR(summary.totalBudgetPaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Configured for {formatMonthName(selectedMonth)}
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Actual Spent So Far
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.2rem' }}>
              {formatINR(summary.totalSpentPaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {summary.totalPercentageUsed}% of total monthly budget consumed
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Remaining Safe Margin
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
              {formatINR(summary.totalRemainingPaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Safe spending capacity before limit breach
            </div>
          </div>
        </div>
      )}

      {/* Budget Items */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={PieChart}
          title={`No Budgets For ${formatMonthName(selectedMonth)}`}
          description="Set spending limits for categories like Food, Utilities, or Entertainment to stay financially disciplined."
          actionLabel="Create First Budget Limit"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {budgets.map((b) => {
            const isDanger = b.isOverBudget;
            const isWarning = b.percentageUsed >= 80 && !isDanger;

            return (
              <div
                key={b.id}
                className="glass-card"
                style={{
                  borderTop: `4px solid ${
                    isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)'
                  }`,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{b.categoryName}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Limit: {formatINR(b.limitPaise)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isDanger ? (
                      <span className="badge-danger">Over Budget!</span>
                    ) : isWarning ? (
                      <span className="badge-yellow">Warning 80%+</span>
                    ) : (
                      <span className="badge-success">On Track</span>
                    )}

                    <button
                      onClick={() => handleDeleteBudget(b.id)}
                      className="btn-icon"
                      style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
                      title="Delete Budget"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ margin: '1rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Spent: <strong className="mono-number">{formatINR(b.spentPaise)}</strong>
                    </span>
                    <span
                      className="mono-number"
                      style={{
                        fontWeight: 700,
                        color: isDanger ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)',
                      }}
                    >
                      {b.percentageUsed}%
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, b.percentageUsed)}%`,
                        height: '100%',
                        background: isDanger
                          ? 'var(--danger)'
                          : isWarning
                          ? 'var(--warning)'
                          : 'var(--success)',
                        borderRadius: '4px',
                        transition: 'width var(--transition-smooth)',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>
                    Remaining: <strong style={{ color: isDanger ? 'var(--danger)' : 'var(--text-primary)' }}>{formatINR(b.remainingPaise)}</strong>
                  </span>
                  <span>{isDanger ? 'Limit exceeded' : 'Available'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Monthly Budget Limit">
        <form onSubmit={handleSaveBudget}>
          <div className="form-group">
            <label className="form-label">Expense Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="select-field"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit (₹ INR) *</label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 15000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="input-field"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target month: {formatMonthName(selectedMonth)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm">
              Save Budget Limit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
