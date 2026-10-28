import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatINR } from '../utils/currency.js';
import { Modal } from '../components/Modal.jsx';
import {
  Landmark,
  Plus,
  Wallet,
  CreditCard,
  Coins,
  Edit2,
  Trash2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export function AccountsPage() {
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [totalNetWorthPaise, setTotalNetWorthPaise] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [startingBalance, setStartingBalance] = useState('');
  const [color, setColor] = useState('#F4D52E');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.accounts.list();
      if (res?.data) {
        setAccounts(res.data.accounts || []);
        setTotalNetWorthPaise(res.data.totalNetWorthPaise || 0);
      }
    } catch (err) {
      toast.error('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCreateModal = () => {
    setEditAccount(null);
    setName('');
    setType('bank');
    setStartingBalance('0');
    setColor('#F4D52E');
    setIsModalOpen(true);
  };

  const openEditModal = (acc) => {
    setEditAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setStartingBalance((acc.startingBalancePaise / 100).toString());
    setColor(acc.color || '#F4D52E');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Account name is required');
      return;
    }

    try {
      if (editAccount) {
        await api.accounts.update(editAccount.id, {
          name,
          type,
          color,
          startingBalance: parseFloat(startingBalance) || 0,
        });
        toast.success('Account updated successfully');
      } else {
        await api.accounts.create({
          name,
          type,
          color,
          startingBalance: parseFloat(startingBalance) || 0,
        });
        toast.success('New account created');
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to save account');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.accounts.delete(id);
      toast.success('Account removed');
      setDeleteConfirmId(null);
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Cannot delete account with linked transactions');
    }
  };

  const getAccountIcon = (accType) => {
    switch (accType) {
      case 'bank':
        return Landmark;
      case 'savings':
        return Coins;
      case 'wallet':
        return Wallet;
      default:
        return CreditCard;
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
          <h1 style={{ fontSize: '1.85rem' }}>Accounts & Wallets</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage bank accounts, physical cash, and digital wallets with zero double-counting transfers.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary btn-sm">
          <Plus size={16} /> Add New Account
        </button>
      </div>

      {/* Net Worth Banner Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          borderLeft: '4px solid var(--accent-yellow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Total Accumulated Portfolio Net Worth
          </span>
          <div
            className="mono-number"
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--accent-yellow)',
              marginTop: '0.25rem',
            }}
          >
            {formatINR(totalNetWorthPaise)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Combined real-time balance across {accounts.length} active financial accounts
          </div>
        </div>

        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            maxWidth: '340px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
            <ShieldCheck size={16} color="var(--success)" /> Isolated Ledger Model
          </div>
          Transfers between your accounts adjust balances without artificially inflating income or expense totals.
        </div>
      </div>

      {/* Account Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          return (
            <div
              key={acc.id}
              className="glass-card"
              style={{
                borderTop: `4px solid ${acc.color || 'var(--accent-yellow)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '200px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: acc.color || 'var(--accent-yellow)',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{acc.name}</h4>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        {acc.type}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => openEditModal(acc)}
                      className="btn-icon"
                      style={{ width: '30px', height: '30px' }}
                      title="Edit Account"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(acc.id)}
                      className="btn-icon"
                      style={{ width: '30px', height: '30px', color: 'var(--danger)' }}
                      title="Delete Account"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Current Ledger Balance
                  </span>
                  <div
                    className="mono-number"
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: acc.balancePaise >= 0 ? 'var(--text-primary)' : 'var(--danger)',
                      marginTop: '0.2rem',
                    }}
                  >
                    {formatINR(acc.balancePaise)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Opening: {formatINR(acc.startingBalancePaise, false)}</span>
                <span style={{ color: 'var(--success)' }}>Active & Synced</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editAccount ? 'Edit Account Information' : 'Add New Financial Account'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Account Name *</label>
            <input
              type="text"
              placeholder="e.g. ICICI Bank, Personal Cash, Zerodha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="select-field">
                <option value="bank">Bank Checking Account</option>
                <option value="savings">Savings Account</option>
                <option value="cash">Physical Cash In Hand</option>
                <option value="wallet">Digital UPI / Paytm Wallet</option>
                <option value="investment">Investment Account</option>
                <option value="other">Other Asset</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Theme Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)} className="select-field">
                <option value="#F4D52E">Vaultly Yellow (#F4D52E)</option>
                <option value="#78D8A0">Mint Green (#78D8A0)</option>
                <option value="#60A5FA">Cobalt Blue (#60A5FA)</option>
                <option value="#FBBF24">Amber (#FBBF24)</option>
                <option value="#F472B6">Rose Pink (#F472B6)</option>
                <option value="#A78BFA">Purple (#A78BFA)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Opening Starting Balance (₹ INR)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
              className="input-field"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Initial balance before any recorded transactions.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm">
              {editAccount ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Financial Account"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Are you sure you want to delete this account? The system enforces database referential integrity: accounts with linked transactions cannot be deleted until all transactions are reassigned.
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
