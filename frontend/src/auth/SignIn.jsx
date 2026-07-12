import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../services/authService';
import { ROUTES } from '../config/routes';
import './Auth.css';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const params = new URLSearchParams(location.search);
  const registered = params.get('registered');
  const orgCreated = params.get('org_created');
  const passwordReset = params.get('reset');

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [resendState, setResendState] = useState('idle');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (errorCode) setErrorCode('');
    if (resendState !== 'idle') setResendState('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    setErrorCode('');

    try {
      await login(form.email.trim().toLowerCase(), form.password);
      const destination = location.state?.from?.pathname || ROUTES.DASHBOARD;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      setErrorCode(err.code || '');
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendState('sending');
    try {
      await resendVerification(form.email.trim().toLowerCase());
      setResendState('sent');
    } catch {
      setResendState('idle');
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2"  y="2"  width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="16" y="2"  width="10" height="10" rx="2" fill="white" fillOpacity="0.4" />
              <rect x="2"  y="16" width="10" height="10" rx="2" fill="white" fillOpacity="0.4" />
              <rect x="16" y="16" width="10" height="10" rx="2" fill="white" fillOpacity="0.7" />
            </svg>
          </div>
          <span className="auth-brand-name">AssetFlow</span>
        </div>

        {/* Registered success banner */}
        {(registered || orgCreated || passwordReset) && (
          <div className="auth-success-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 12 15 16 9" />
            </svg>
            {orgCreated
              ? 'Organization created! Verify the admin email, then sign in.'
              : passwordReset
              ? 'Password reset successfully. Please sign in with your new password.'
              : 'Account created! An administrator must approve your account before you can sign in.'}
          </div>
        )}

        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your AssetFlow workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signin-email">Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="signin-password">Password</label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="auth-forgot">Forgot password?</Link>
            </div>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="signin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {errorCode === 'EMAIL_NOT_VERIFIED' && (
            resendState === 'sent' ? (
              <div className="auth-success-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="9 12 12 15 16 9" />
                </svg>
                Verification email sent. Check your inbox.
              </div>
            ) : (
              <button
                type="button"
                className="auth-forgot"
                onClick={handleResendVerification}
                disabled={resendState === 'sending'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                {resendState === 'sending' ? 'Sending verification email…' : 'Resend verification email'}
              </button>
            )
          )}

          <button type="submit" className="auth-submit" disabled={loading} id="signin-submit-btn">
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                Sign in
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider"><span>new to AssetFlow?</span></div>

        <p className="auth-switch">
          <Link to="/signup" className="auth-link-block" id="signin-goto-signup">
            <span>Create an employee account</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </p>

        <p className="auth-org-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Roles are assigned by your organization admin — not at sign-up
        </p>
      </div>
    </div>
  );
}
