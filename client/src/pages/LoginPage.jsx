import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { Wallet, ArrowRight, Lock, Mail, AlertTriangle, KeyRound } from 'lucide-react';

export function LoginPage({ onNavigate }) {
  const { login, googleConfigured } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully');
      onNavigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@vaultly.app');
    setPassword('Vaultly2026!');
    toast.info('Demo credentials loaded. Click "Sign In" to proceed.');
  };

  const handleGoogleClick = async () => {
    try {
      const res = await api.auth.getGoogleAuthUrl();
      if (res?.data?.isConfigured && res.data.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        setShowGoogleModal(true);
      }
    } catch (err) {
      setShowGoogleModal(true);
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
        {/* Header */}
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
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Enter your credentials to access your financial dashboard
          </p>
        </div>

        {/* Demo Quick Fill Banner */}
        <div
          onClick={fillDemoCredentials}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(244, 213, 46, 0.08)',
            border: '1px solid var(--border-highlight)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'background var(--transition-fast)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={16} color="var(--accent-yellow)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              College Demo Account
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)', fontWeight: 600 }}>
            Click to Auto-Fill →
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                style={{
                  background: 'transparent',
                  color: 'var(--accent-yellow)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In To Vaultly'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '1.75rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="btn-secondary"
          style={{ width: '100%', gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.1.2-1.9.4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12c0 1.9.6 3.7 1.6 5.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 6.4 10.4 6.4z"
            />
          </svg>
          <span>Sign In With Google</span>
        </button>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('/signup')}
            style={{
              background: 'transparent',
              color: 'var(--accent-yellow)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Create an Account
          </button>
        </div>
      </div>

      {/* Google OAuth Notice Modal */}
      {showGoogleModal && (
        <div className="modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--warning)" /> Google OAuth Status
              </h3>
            </div>
            <div className="modal-body" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '1rem' }}>
                The Google OAuth 2.0 / OpenID Connect authorization code flow is fully implemented on the backend in <code>server/src/controllers/authController.js</code>.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                To enable live Google Sign-In with your own Google Cloud Console credentials, simply add your credentials to <code>server/.env</code>:
              </p>
              <pre
                style={{
                  background: '#090909',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-yellow)',
                  marginBottom: '1rem',
                  overflowX: 'auto',
                }}
              >
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
              </pre>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Per requirements, mock successes are strictly prevented. You can log in instantly using the verified college demo credentials or standard email registration.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowGoogleModal(false)} className="btn-primary btn-sm">
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
