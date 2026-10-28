import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/dates.js';
import { Modal } from '../components/Modal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import {
  RefreshCw,
  Plus,
  Calendar,
  CheckCircle,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Play,
} from 'lucide-react';

export function RecurringPage() {
  const toast = useToast();
  const [schedules, setSchedules] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [merchant, setMerchant] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rRes, aRes, cRes] = await Promise.all([
        api.recurring.list(),
        api.accounts.list(),
        api.categories.list(),
      ]);

      if (rRes?.data) setSchedules(rRes.data);
      if (aRes?.data?.accounts) setAccounts(aRes.data.accounts);
      if (cRes?.data) setCategories(cRes.data);
    } catch {
      toast.error('Failed to load recurring schedules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || !accountId) {
      toast.error('Please fill all required schedule fields');
      return;
    }

    try {
      await api.recurring.create({
        description,
        type,
        amount: parseFloat(amount),
        frequency,
        startDate,
        accountId,
        categoryId: categoryId || null,
        merchant,
      });
      toast.success('Recurring schedule active');
      setIsModalOpen(false);
      setDescription('');
      setAmount('');
      setMerchant('');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create schedule');
    }
  };

  const handleExecute = async (id, desc) => {
    try {
      await api.recurring.execute(id);
      toast.success(`Transaction posted for "${desc}" and advanced to next cycle!`);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to post transaction');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.recurring.delete(id);
      toast.success('Schedule deleted');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete schedule');
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
          <h1 style={{ fontSize: '1.85rem' }}>Recurring Transactions</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Schedule and track recurring subscriptions, rent, utility bills, and salary deposits.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-primary btn-sm">
          <Plus size={16} /> New Schedule
        </button>
      </div>

      {/* Info notice explaining scheduling mechanics */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(244, 213, 46, 0.06)',
          border: '1px solid var(--border-highlight)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}
      >
        <Info size={20} color="var(--accent-yellow)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Transparent Execution:</strong> Recurring schedules forecast your upcoming due dates. Click <strong>"Post Now"</strong> on any schedule to post the actual ledger transaction and advance the calendar to the next cycle.
        </span>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="No Recurring Schedules Configured"
          description="Automate repetitive expenses like Netflix, broadband, gym fees, or monthly salary by defining a recurring rule."
          actionLabel="Create First Schedule"
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
          {schedules.map((s) => (
            <div
              key={s.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${s.type === 'income' ? 'var(--success)' : 'var(--danger)'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div className="badge-yellow" style={{ fontSize: '0.7rem', padding: '1px 8px', marginBottom: '0.35rem' }}>
                      {s.frequency.toUpperCase()}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{s.description}</h3>
                    {s.merchant && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Merchant: {s.merchant}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setDeleteConfirmId(s.id)}
                    className="btn-icon"
                    style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
                    title="Delete Schedule"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Scheduled Amount
                  </span>
                  <div
                    className="mono-number"
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: s.type === 'income' ? 'var(--success)' : 'var(--text-primary)',
                      marginTop: '0.2rem',
                    }}
                  >
                    {s.type === 'income' ? '+' : '-'}{formatINR(s.amountPaise)}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>
                    Account: <strong>{s.accountName}</strong>
                  </div>
                  <div>
                    Category: <strong>{s.categoryName}</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.85rem',
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Next Due: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(s.nextDueDate)}</strong>
                </div>

                <button
                  onClick={() => handleExecute(s.id, s.description)}
                  className="btn-primary btn-sm"
                  style={{ height: '32px', fontSize: '0.78rem', gap: '4px' }}
                >
                  <Play size={12} /> Post Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Recurring Schedule">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Schedule Description *</label>
            <input
              type="text"
              placeholder="e.g. Netflix 4K, Apartment Rent, Broadband"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="select-field">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹ INR) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="select-field">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">First Due Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Account *</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="select-field" required>
                <option value="">Select Account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="select-field">
                <option value="">Select Category</option>
                {categories.filter((c) => c.type === type).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Merchant / Service Provider</label>
            <input
              type="text"
              placeholder="e.g. Airtel, Netflix, Landlord"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm">
              Activate Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Recurring Schedule"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Are you sure you want to stop this recurring schedule? Existing transactions generated from past cycles will remain preserved in your ledger.
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
