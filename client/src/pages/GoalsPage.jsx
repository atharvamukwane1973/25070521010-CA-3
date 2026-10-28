import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/dates.js';
import { Modal } from '../components/Modal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  TrendingUp,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export function GoalsPage() {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('General');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const res = await api.goals.list();
      if (res?.data) {
        setGoals(res.data.goals || []);
        setSummary(res.data.summary || null);
      }
    } catch {
      toast.error('Failed to load savings goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      toast.error('Please specify a title and target amount');
      return;
    }

    try {
      await api.goals.create({
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(initialAmount) || 0,
        targetDate: targetDate || null,
        category,
      });
      toast.success('Savings goal established');
      setIsCreateOpen(false);
      setTitle('');
      setTargetAmount('');
      setInitialAmount('0');
      setTargetDate('');
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Failed to create goal');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please specify a positive contribution amount');
      return;
    }

    try {
      await api.goals.contribute(contributeGoal.id, parseFloat(contributionAmount));
      toast.success('Contribution recorded towards goal progress!');
      setContributeGoal(null);
      setContributionAmount('');
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Failed to record contribution');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.goals.delete(id);
      toast.success('Goal removed');
      setDeleteConfirmId(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Failed to delete goal');
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
          <h1 style={{ fontSize: '1.85rem' }}>Savings Goals</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track milestone targets for emergency funds, tech upgrades, and dream vacations.
          </p>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="btn-primary btn-sm">
          <Plus size={16} /> New Savings Goal
        </button>
      </div>

      {/* Summary Row */}
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
              Total Savings Target
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {formatINR(summary.totalTargetPaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Across {goals.length} defined financial goals
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Amount Saved
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
              {formatINR(summary.totalSavedPaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {summary.overallProgressPercent}% overall milestone completion
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid #60A5FA' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Goals Tracking
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.2rem' }}>
              {summary.activeGoalsCount} Active / {summary.completedGoalsCount} Done
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Target milestones on track
            </div>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Savings Goals Established Yet"
          description="Create your first financial target—such as an emergency reserve or equipment purchase—to track visual progress."
          actionLabel="Create Savings Target"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {goals.map((g) => {
            const isDone = g.status === 'completed' || g.progressPercent === 100;

            return (
              <div
                key={g.id}
                className="glass-card"
                style={{
                  borderTop: `4px solid ${isDone ? 'var(--success)' : 'var(--accent-yellow)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div className="badge-yellow" style={{ fontSize: '0.7rem', padding: '1px 7px', marginBottom: '0.35rem' }}>
                        {g.category}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{g.title}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isDone && (
                        <span className="badge-success">
                          <CheckCircle2 size={12} /> Achieved
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(g.id)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
                        title="Delete Goal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress section */}
                  <div style={{ margin: '1.25rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                      <span className="mono-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatINR(g.currentAmountPaise, false)}
                      </span>
                      <span
                        className="mono-number"
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isDone ? 'var(--success)' : 'var(--accent-yellow)',
                        }}
                      >
                        {g.progressPercent}%
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div
                        style={{
                          width: `${g.progressPercent}%`,
                          height: '100%',
                          background: isDone
                            ? 'var(--success)'
                            : 'linear-gradient(90deg, var(--accent-yellow), var(--accent-yellow-soft))',
                          borderRadius: '4px',
                          transition: 'width var(--transition-smooth)',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>Target: {formatINR(g.targetAmountPaise, false)}</span>
                      <span>{isDone ? 'Goal Complete!' : `Remaining: ${formatINR(g.remainingAmountPaise, false)}`}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {g.targetDate ? `Target Date: ${formatDate(g.targetDate)}` : 'No deadline'}
                  </div>

                  {!isDone && (
                    <button
                      onClick={() => setContributeGoal(g)}
                      className="btn-primary btn-sm"
                      style={{ height: '32px', fontSize: '0.8rem' }}
                    >
                      + Add Progress
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Savings Goal">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund, Goa Trip, MacBook Pro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Amount (₹ INR) *</label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Already Saved (₹ INR)</label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Completion Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category / Purpose</label>
              <input
                type="text"
                placeholder="e.g. Electronics, Travel, Safety"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm">
              Create Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Progress / Contribution Modal */}
      {contributeGoal && (
        <Modal
          isOpen={Boolean(contributeGoal)}
          onClose={() => setContributeGoal(null)}
          title={`Record Progress Towards: ${contributeGoal.title}`}
        >
          <form onSubmit={handleContribute}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Record savings progress toward this target. Per academic specifications, goal contributions track your recorded milestone progress without generating duplicate bank movement.
            </p>

            <div className="form-group">
              <label className="form-label">Contribution Amount (₹ INR) *</label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="e.g. 5000"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setContributeGoal(null)} className="btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn-primary btn-sm">
                Confirm Contribution
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Savings Goal"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Are you sure you want to delete this savings goal? This will remove its milestone tracking from your portfolio.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteConfirmId)} className="btn-danger btn-sm">
              Confirm Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
