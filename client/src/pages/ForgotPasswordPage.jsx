import React, { useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { KeyRound, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage({ onNavigate }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      toast.success('Password reset token generated.');
      if (res?.data?.token) {
        setToken(res.data.token);
      }
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to request reset token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Reset token is required');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.auth.resetPassword(token, newPassword);
      toast.success('Password reset successfully! Please log in.');
      onNavigate('/login');
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--accent-yellow)',
              color: '#050505',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <KeyRound size={22} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
            {step === 1 ? 'Password Recovery' : 'Set New Password'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {step === 1
              ? 'Enter your account email to receive a secure recovery token'
              : 'Enter the recovery token and specify your new password'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken}>
            <div className="form-group">
              <label className="form-label">Account Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {isLoading ? 'Generating Token...' : 'Generate Reset Token'} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">Recovery Token</label>
              <input
                type="text"
                placeholder="Paste reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input-field"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
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
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {isLoading ? 'Updating...' : 'Save New Password & Sign In'} <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <button
            onClick={() => onNavigate('/login')}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
