import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/dates.js';
import { EmptyState } from '../components/EmptyState.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import { Modal } from '../components/Modal.jsx';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

export function TransactionsPage({ onOpenNewTransaction }) {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Metadata
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modals
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchMetadata = async () => {
    try {
      const [accRes, catRes] = await Promise.all([api.accounts.list(), api.categories.list()]);
      if (accRes?.data?.accounts) setAccounts(accRes.data.accounts);
      if (catRes?.data) setCategories(catRes.data);
    } catch {
      // ignore
    }
  };

  const loadTransactions = useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page: pageToLoad,
        limit: 15,
      };
      if (search) params.q = search;
      if (selectedType) params.type = selectedType;
      if (selectedAccount) params.accountId = selectedAccount;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.transactions.list(params);
      if (res?.data) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination || { page: 1, limit: 15, totalPages: 1, totalCount: 0 });
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedType, selectedAccount, selectedCategory, startDate, endDate, toast]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    loadTransactions(1);
  }, [loadTransactions]);

  const handleDelete = async (id) => {
    try {
      await api.transactions.delete(id);
      toast.success('Transaction deleted');
      setDeleteConfirmId(null);
      loadTransactions(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction');
    }
  };

  const handleExportCsv = () => {
    window.location.href = api.transactions.exportCsvUrl();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedAccount('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
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
          <h1 style={{ fontSize: '1.85rem' }}>Transaction History</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Search, filter, and review all financial inflows and outflows with integer paise precision.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} className="btn-secondary btn-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={onOpenNewTransaction} className="btn-primary btn-sm">
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search description, merchant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', height: '42px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="select-field"
            style={{ height: '42px', fontSize: '0.85rem' }}
          >
            <option value="">All Types (Income, Expense, Transfer)</option>
            <option value="expense">Expense Only</option>
            <option value="income">Income Only</option>
            <option value="transfer">Transfers</option>
          </select>

          {/* Account filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="select-field"
            style={{ height: '42px', fontSize: '0.85rem' }}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-field"
            style={{ height: '42px', fontSize: '0.85rem' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* Date range & Reset row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Calendar size={14} />
            <span>Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              style={{ height: '36px', width: '140px', fontSize: '0.8rem', padding: '0 8px' }}
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
              style={{ height: '36px', width: '140px', fontSize: '0.8rem', padding: '0 8px' }}
            />
          </div>

          {(search || selectedType || selectedAccount || selectedCategory || startDate || endDate) && (
            <button onClick={resetFilters} className="btn-secondary btn-sm" style={{ height: '36px', gap: '4px' }}>
              <X size={14} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="table-container">
        {transactions.length === 0 ? (
          <div style={{ padding: '3rem 1rem' }}>
            <EmptyState
              title="No Matching Transactions"
              description="No financial records match your selected filter criteria. Try resetting filters or recording a new entry."
              actionLabel="Clear Filters"
              onAction={resetFilters}
            />
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description / Merchant</th>
                <th>Category</th>
                <th>Account</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    {formatDate(tx.date)}
                  </td>

                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
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
                      }}
                    >
                      {tx.type === 'income' && <ArrowUpRight size={12} />}
                      {tx.type === 'expense' && <ArrowDownRight size={12} />}
                      {tx.type === 'transfer' && <ArrowLeftRight size={12} />}
                      {tx.type}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.description}
                    </div>
                    {tx.merchant && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Merchant: {tx.merchant}
                      </div>
                    )}
                  </td>

                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: tx.categoryColor || '#797972',
                        }}
                      />
                      {tx.categoryName}
                    </span>
                  </td>

                  <td style={{ fontSize: '0.85rem' }}>
                    {tx.type === 'transfer' ? (
                      <span>
                        {tx.accountName} → {tx.targetAccountName}
                      </span>
                    ) : (
                      <span>{tx.accountName}</span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span
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
                    </span>
                  </td>

                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        onClick={() => setViewItem(tx)}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px' }}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setEditItem(tx)}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px' }}
                        title="Edit Entry"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(tx.id)}
                        className="btn-icon"
                        style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
                        title="Delete Entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 0',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total entries)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => loadTransactions(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary btn-sm"
              style={{ gap: '4px' }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => loadTransactions(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary btn-sm"
              style={{ gap: '4px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <TransactionModal
          isOpen={Boolean(editItem)}
          onClose={() => setEditItem(null)}
          onSuccess={() => loadTransactions(pagination.page)}
          editTransaction={editItem}
          accounts={accounts}
          categories={categories}
        />
      )}

      {/* Detail View Modal */}
      {viewItem && (
        <Modal isOpen={Boolean(viewItem)} onClose={() => setViewItem(null)} title="Transaction Record Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                {viewItem.type} Amount
              </div>
              <div
                className="mono-number"
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color:
                    viewItem.type === 'income'
                      ? 'var(--success)'
                      : viewItem.type === 'expense'
                      ? 'var(--danger)'
                      : 'var(--accent-yellow)',
                }}
              >
                {formatINR(viewItem.amountPaise)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Stored in MongoDB as {viewItem.amountPaise} integer paise
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Description</span>
                <strong>{viewItem.description}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Merchant / Payee</span>
                <span>{viewItem.merchant || '—'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Category</span>
                <span>{viewItem.categoryName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Account</span>
                <span>{viewItem.accountName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Date</span>
                <span>{formatDate(viewItem.date)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Record ID</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{viewItem.id}</span>
              </div>
            </div>

            {viewItem.notes && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Personal Notes</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {viewItem.notes}
                </p>
              </div>
            )}

            {viewItem.tags?.length > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', marginBottom: '0.4rem' }}>Tags</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {viewItem.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        fontSize: '0.75rem',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setViewItem(null)} className="btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Confirm Record Deletion">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete this transaction? This action will adjust your account balance and monthly category statistics in MongoDB.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteConfirmId)} className="btn-danger btn-sm">
              Delete Record
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
