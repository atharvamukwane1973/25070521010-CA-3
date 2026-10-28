import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  editTransaction = null,
  accounts = [],
  categories = [],
}) {
  const toast = useToast();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type || 'expense');
      setAmount(editTransaction.amountRupees || '');
      setAccountId(editTransaction.accountId || accounts[0]?.id || '');
      setTargetAccountId(editTransaction.targetAccountId || '');
      setCategoryId(editTransaction.categoryId || '');
      setDate(
        editTransaction.date
          ? new Date(editTransaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDescription(editTransaction.description || '');
      setMerchant(editTransaction.merchant || '');
      setNotes(editTransaction.notes || '');
      setTagInput(editTransaction.tags?.join(', ') || '');
    } else {
      setType('expense');
      setAmount('');
      setAccountId(accounts[0]?.id || '');
      setTargetAccountId(accounts[1]?.id || '');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setMerchant('');
      setNotes('');
      setTagInput('');
    }
  }, [editTransaction, accounts, isOpen]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount greater than zero');
      return;
    }

    if (!accountId) {
      toast.error('Please select an account');
      return;
    }

    if (type === 'transfer' && (!targetAccountId || accountId === targetAccountId)) {
      toast.error('Please select a different target account for transfer');
      return;
    }

    const payload = {
      type,
      amount: parseFloat(amount),
      accountId,
      targetAccountId: type === 'transfer' ? targetAccountId : null,
      categoryId: type !== 'transfer' ? categoryId || null : null,
      date,
      description: description.trim() || (type === 'transfer' ? 'Account Transfer' : `${type.toUpperCase()} Entry`),
      merchant: merchant.trim(),
      notes: notes.trim(),
      tags: tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setIsSubmitting(true);
    try {
      if (editTransaction) {
        await api.transactions.update(editTransaction.id, payload);
        toast.success('Transaction updated successfully');
      } else {
        await api.transactions.create(payload);
        toast.success('Transaction recorded successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Edit Financial Record' : 'Record New Transaction'}
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit}>
        {/* Type selector tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '1.25rem',
            background: 'var(--bg-secondary)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => setType('expense')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: type === 'expense' ? 'rgba(255, 118, 118, 0.15)' : 'transparent',
              color: type === 'expense' ? 'var(--danger)' : 'var(--text-muted)',
              border: type === 'expense' ? '1px solid rgba(255, 118, 118, 0.4)' : '1px solid transparent',
              fontSize: '0.85rem',
            }}
          >
            <ArrowDownRight size={16} /> Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: type === 'income' ? 'rgba(120, 216, 160, 0.15)' : 'transparent',
              color: type === 'income' ? 'var(--success)' : 'var(--text-muted)',
              border: type === 'income' ? '1px solid rgba(120, 216, 160, 0.4)' : '1px solid transparent',
              fontSize: '0.85rem',
            }}
          >
            <ArrowUpRight size={16} /> Income
          </button>
          <button
            type="button"
            onClick={() => setType('transfer')}
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: type === 'transfer' ? 'rgba(244, 213, 46, 0.15)' : 'transparent',
              color: type === 'transfer' ? 'var(--accent-yellow)' : 'var(--text-muted)',
              border: type === 'transfer' ? '1px solid var(--border-highlight)' : '1px solid transparent',
              fontSize: '0.85rem',
            }}
          >
            <ArrowLeftRight size={16} /> Transfer
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label">Amount (₹ INR) *</label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent-yellow)',
                fontWeight: 700,
                fontSize: '1.2rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '34px',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
              required
            />
          </div>
        </div>

        {/* Account and Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">{type === 'transfer' ? 'Source Account *' : 'Account *'}</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="select-field"
              required
            >
              <option value="">Select Account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' ? (
            <div className="form-group">
              <label className="form-label">Target Account *</label>
              <select
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="select-field"
                required
              >
                <option value="">Select Destination</option>
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="select-field"
              >
                <option value="">Select Category (Optional)</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date & Merchant */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Transaction Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Merchant / Payee</label>
            <input
              type="text"
              placeholder="e.g. Amazon, Swiggy, Employer"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            placeholder="Brief description or purpose"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Tags & Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. food, weekend, project"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              placeholder="Optional personal notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary btn-sm">
            {isSubmitting ? 'Recording...' : editTransaction ? 'Save Changes' : 'Record Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
