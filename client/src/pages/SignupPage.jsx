import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Wallet, ArrowRight, ShieldCheck } from 'lucide-react';

export function SignupPage({ onNavigate }) {
  const { register } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      toast.error('Please enter your full name');
      return;
    }

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success('Account created! Default accounts & categories initialized.');
      onNavigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
          maxWidth: '480px',
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
              boxShadow: 'var(--shadow-glow-yellow)',
            }}
          >
            <Wallet size={24} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Create Account</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Join Vaultly to take complete control of your finances
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Aryan Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 8 Characters) *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={16} color="var(--success)" />
            <span>Encrypted with Node.js crypto.scrypt & random salt</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {isLoading ? 'Creating Account...' : 'Register & Start Tracking'}{' '}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            style={{
              background: 'transparent',
              color: 'var(--accent-yellow)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Sign In Instead
          </button>
        </div>
      </div>
    </div>
  );
}
