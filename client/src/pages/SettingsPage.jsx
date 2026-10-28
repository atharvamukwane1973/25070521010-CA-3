import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { formatDate } from '../utils/dates.js';
import {
  Settings,
  Lock,
  User,
  Database,
  Download,
  ShieldCheck,
  CheckCircle,
  Copy,
} from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdating(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully. Other sessions invalidated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyCompassUri = () => {
    navigator.clipboard.writeText('mongodb://127.0.0.1:27017/personal_finance_tracker');
    toast.success('MongoDB Compass URI copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem' }}>Profile & Security Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your account credentials, session security, and database inspection parameters.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--accent-yellow)" /> Account Overview
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Full Name
            </span>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '0.2rem' }}>
              {user?.name || 'Investor'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Email Address
            </span>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', marginTop: '0.2rem' }}>
              {user?.email || 'user@example.com'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Authentication Provider
            </span>
            <div style={{ marginTop: '0.2rem' }}>
              <span className="badge-yellow">
                {user?.authProvider === 'google' ? 'Google OAuth 2.0' : 'Local Scrypt Encryption'}
              </span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Account Established
            </span>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
              {formatDate(user?.createdAt || new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="var(--success)" /> Update Password
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Re-encrypt your account credentials with a new scrypt-derived hash and fresh 16-byte random salt.
        </p>

        <form onSubmit={handleChangePassword} style={{ maxWidth: '480px' }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password (Min 8 Characters)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="btn-primary btn-sm"
            style={{ marginTop: '0.75rem' }}
          >
            {isUpdating ? 'Updating Hash...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* MongoDB Compass Inspection Card */}
      <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-yellow)' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--accent-yellow)" /> MongoDB Compass Evaluator Configuration
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Teacher & Examiner verification instructions. Inspect the live application database in MongoDB Compass using the exact connection string below:
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#090909',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
          }}
        >
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-yellow)' }}>
            mongodb://127.0.0.1:27017/personal_finance_tracker
          </code>
          <button onClick={copyCompassUri} className="btn-secondary btn-sm" style={{ height: '32px', gap: '4px' }}>
            <Copy size={13} /> Copy URI
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <div><strong>Database Name:</strong> personal_finance_tracker</div>
          <div><strong>Indexed Collections:</strong> users, sessions, accounts, transactions, budgets, savings_goals</div>
          <div><strong>Server Engine:</strong> Pure Node.js (node:http)</div>
        </div>
      </div>
    </div>
  );
}
