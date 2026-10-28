import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Modal } from '../components/Modal.jsx';
import {
  Tags,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  AlertCircle,
  Briefcase,
  Utensils,
  Home,
  Zap,
  Car,
  Tag,
  Film,
  Activity,
  BookOpen,
  Laptop,
} from 'lucide-react';

export function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState('#F4D52E');
  const [icon, setIcon] = useState('Tag');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.categories.list();
      if (res?.data) {
        setCategories(res.data);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditCategory(null);
    setName('');
    setType(activeTab);
    setColor(activeTab === 'income' ? '#78D8A0' : '#F4D52E');
    setIcon('Tag');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color || '#F4D52E');
    setIcon(cat.icon || 'Tag');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editCategory) {
        await api.categories.update(editCategory.id, { name, color, icon });
        toast.success('Category updated successfully');
      } else {
        await api.categories.create({ name, type, color, icon });
        toast.success('Category created');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.categories.delete(id);
      toast.success('Category removed');
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Cannot delete category in active use');
    }
  };

  const filtered = categories.filter((c) => c.type === activeTab);

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
          <h1 style={{ fontSize: '1.85rem' }}>Category Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Organize transactions into custom income and expense taxonomies stored in MongoDB.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary btn-sm">
          <Plus size={16} /> New Category
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('expense')}
          style={{
            background: 'transparent',
            color: activeTab === 'expense' ? 'var(--danger)' : 'var(--text-muted)',
            fontWeight: activeTab === 'expense' ? 700 : 500,
            fontSize: '1rem',
            padding: '6px 14px',
            borderRadius: '6px',
            border: activeTab === 'expense' ? '1px solid rgba(255, 118, 118, 0.4)' : '1px solid transparent',
          }}
        >
          Expense Categories ({categories.filter((c) => c.type === 'expense').length})
        </button>

        <button
          onClick={() => setActiveTab('income')}
          style={{
            background: 'transparent',
            color: activeTab === 'income' ? 'var(--success)' : 'var(--text-muted)',
            fontWeight: activeTab === 'income' ? 700 : 500,
            fontSize: '1rem',
            padding: '6px 14px',
            borderRadius: '6px',
            border: activeTab === 'income' ? '1px solid rgba(120, 216, 160, 0.4)' : '1px solid transparent',
          }}
        >
          Income Categories ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {/* Category Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {filtered.map((cat) => (
          <div
            key={cat.id}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: cat.color || 'var(--accent-yellow)',
                }}
              >
                <Tag size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {cat.isDefault ? 'Default System Category' : 'Custom Category'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => openEditModal(cat)}
                className="btn-icon"
                style={{ width: '30px', height: '30px' }}
                title="Edit Category"
              >
                <Edit2 size={13} />
              </button>
              <button
                onClick={() => setDeleteConfirmId(cat.id)}
                className="btn-icon"
                style={{ width: '30px', height: '30px', color: 'var(--danger)' }}
                title="Delete Category"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Groceries, Dividends"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={Boolean(editCategory)}
                className="select-field"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Accent Color</label>
              <select value={color} onChange={(e) => setColor(e.target.value)} className="select-field">
                <option value="#F4D52E">Yellow (#F4D52E)</option>
                <option value="#78D8A0">Green (#78D8A0)</option>
                <option value="#F87171">Red (#F87171)</option>
                <option value="#60A5FA">Blue (#60A5FA)</option>
                <option value="#FB923C">Orange (#FB923C)</option>
                <option value="#A78BFA">Purple (#A78BFA)</option>
                <option value="#EC4899">Pink (#EC4899)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-sm">
              {editCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Category"
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Are you sure you want to delete this category? If there are transactions linked to this category, the deletion will be blocked by the server to prevent data corruption.
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
